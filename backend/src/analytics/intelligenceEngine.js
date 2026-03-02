// src/analytics/intelligenceEngine.js
// Phase 3 – Revenue forecast, occupancy trends, smart alerts
import Payment from "../models/Payment.js";
import Room from "../models/rooms.js";
import User from "../models/User.js";
import Request from "../models/Request.js";
import { buildPropertyFilter } from "../utils/tenantScope.js";

/* ─────────────────────────────────────────────────────
   Revenue Forecast
   Uses last 6 months of actual paid data,
   linear regression to project next 3 months
─────────────────────────────────────────────────────── */
export const revenueForecast = async (req) => {
    const scope = buildPropertyFilter(req.user);
    const pm = scope.propertyId ? { propertyId: scope.propertyId } : {};

    const history = await Payment.aggregate([
        { $match: { ...pm, status: "paid" } },
        { $group: { _id: "$month", collected: { $sum: "$amount" }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
    ]);

    const last6 = history.slice(-6);

    // Linear regression y = mx + b
    const n = last6.length;
    let forecast = [];
    let slope = 0, intercept = 0, trend = "stable";

    if (n >= 2) {
        const xs = last6.map((_, i) => i);
        const ys = last6.map(d => d.collected);
        const sumX = xs.reduce((a, b) => a + b, 0);
        const sumY = ys.reduce((a, b) => a + b, 0);
        const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0);
        const sumX2 = xs.reduce((a, x) => a + x * x, 0);
        slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        intercept = (sumY - slope * sumX) / n;
        trend = slope > 50 ? "up" : slope < -50 ? "down" : "stable";
    } else {
        const avg = n ? last6[0].collected : 0;
        slope = 0; intercept = avg;
    }

    // Project 3 months ahead
    const lastMonth = last6.length ? last6[last6.length - 1]._id : new Date().toISOString().slice(0, 7);
    for (let i = 1; i <= 3; i++) {
        const d = new Date(lastMonth + "-01");
        d.setMonth(d.getMonth() + i);
        const projected = Math.max(0, Math.round(intercept + slope * (n + i - 1)));
        forecast.push({ month: d.toISOString().slice(0, 7), projected, isForecast: true });
    }

    return {
        history: last6.map(d => ({ month: d._id, collected: d.collected, count: d.count })),
        forecast,
        trend,
        avgMonthlyRevenue: n ? Math.round(last6.reduce((s, d) => s + d.collected, 0) / n) : 0,
        generatedAt: new Date(),
    };
};

/* ─────────────────────────────────────────────────────
   Occupancy Trends
   Monthly resident count + occupancy % from payment history
─────────────────────────────────────────────────────── */
export const occupancyTrends = async (req) => {
    const scope = buildPropertyFilter(req.user);
    const pm = scope.propertyId ? { propertyId: scope.propertyId } : {};

    // Get current bed totals
    const rooms = await Room.find(pm, "totalBeds occupiedBeds rent roomNumber").lean();
    const totalBeds = rooms.reduce((s, r) => s + (r.totalBeds || 0), 0);
    const currentOccupied = rooms.reduce((s, r) => s + (r.occupiedBeds || 0), 0);

    // Revenue trend by month (proxy for occupancy trend)
    const paymentsByMonth = await Payment.aggregate([
        { $match: { ...pm } },
        { $group: { _id: "$month", billed: { $sum: "$amount" }, paid: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$amount", 0] } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $limit: 12 },
    ]);

    // Resident growth – residents created per month
    const residentsByMonth = await User.aggregate([
        { $match: { ...pm, role: "resident" } },
        { $group: { _id: { $substr: ["$createdAt", 0, 7] }, newResidents: { $sum: 1 } } },
        { $sort: { _id: 1 } },
    ]);

    const residentMap = {};
    residentsByMonth.forEach(r => { residentMap[r._id] = r.newResidents; });

    // Per-room breakdown
    const roomBreakdown = rooms.map(r => ({
        roomNumber: r.roomNumber,
        totalBeds: r.totalBeds || 0,
        occupiedBeds: r.occupiedBeds || 0,
        occupancyRate: r.totalBeds ? Number(((r.occupiedBeds / r.totalBeds) * 100).toFixed(0)) : 0,
        rent: r.rent || 0,
    }));

    return {
        current: {
            totalBeds,
            occupiedBeds: currentOccupied,
            occupancyRate: totalBeds ? Number(((currentOccupied / totalBeds) * 100).toFixed(1)) : 0,
        },
        monthlyRevenueTrend: paymentsByMonth.map(m => ({
            month: m._id,
            billed: m.billed,
            paid: m.paid,
            collectionRate: m.billed ? Number(((m.paid / m.billed) * 100).toFixed(0)) : 0,
            newResidents: residentMap[m._id] || 0,
        })),
        roomBreakdown,
        generatedAt: new Date(),
    };
};

/* ─────────────────────────────────────────────────────
   Smart Alerts
   Auto-detected problems that need owner attention
─────────────────────────────────────────────────────── */
export const smartAlerts = async (req) => {
    const scope = buildPropertyFilter(req.user);
    const pm = scope.propertyId ? { propertyId: scope.propertyId } : {};
    const alerts = [];

    const [rooms, payments, residents, requests] = await Promise.all([
        Room.find(pm).lean(),
        Payment.find(pm).lean(),
        User.find({ ...pm, role: "resident", isActive: true }).lean(),
        Request.find({ ...pm, status: { $in: ["pending", "open"] } }).lean(),
    ]);

    const now = new Date();
    const totalBeds = rooms.reduce((s, r) => s + (r.totalBeds || 0), 0);
    const occupiedBeds = rooms.reduce((s, r) => s + (r.occupiedBeds || 0), 0);
    const occupancyRate = totalBeds ? (occupiedBeds / totalBeds) * 100 : 0;

    // 1. Low occupancy
    if (occupancyRate < 60) {
        alerts.push({ id: "low-occupancy", severity: "critical", title: "Critical Low Occupancy", description: `Only ${occupancyRate.toFixed(0)}% of beds are occupied. You're losing ₹${Math.round((totalBeds - occupiedBeds) * (rooms.reduce((s, r) => s + (r.rent || 0), 0) / (rooms.length || 1)))} this month.`, action: "Review pricing and run promotions" });
    } else if (occupancyRate < 80) {
        alerts.push({ id: "moderate-occupancy", severity: "warning", title: "Below Target Occupancy", description: `Occupancy at ${occupancyRate.toFixed(0)}% — below the 80% healthy threshold.`, action: "Consider targeted outreach or pricing adjustments" });
    }

    // 2. Overdue payments cluster
    const overduePayments = payments.filter(p => p.status === "overdue");
    const overdueAmount = overduePayments.reduce((s, p) => s + (p.amount || 0), 0);
    if (overduePayments.length >= 3) {
        alerts.push({ id: "overdue-cluster", severity: "critical", title: `${overduePayments.length} Overdue Bills`, description: `₹${overdueAmount.toLocaleString()} in overdue rent. Multiple residents behind may indicate financial distress.`, action: "Send reminders and initiate collection process" });
    } else if (overduePayments.length >= 1) {
        alerts.push({ id: "overdue-bills", severity: "warning", title: `${overduePayments.length} Overdue Bill${overduePayments.length > 1 ? "s" : ""}`, description: `₹${overdueAmount.toLocaleString()} in overdue rent needs collection.`, action: "Send payment reminder emails" });
    }

    // 3. High maintenance load
    const pendingRequests = requests.filter(r => r.status === "pending");
    if (pendingRequests.length >= 5) {
        alerts.push({ id: "maintenance-overload", severity: "critical", title: "Maintenance Overload", description: `${pendingRequests.length} open maintenance requests. High unresolved issues affect resident satisfaction and churn.`, action: "Prioritize and resolve maintenance requests" });
    } else if (pendingRequests.length >= 2) {
        alerts.push({ id: "pending-maintenance", severity: "warning", title: `${pendingRequests.length} Pending Requests`, description: "Open maintenance requests from residents need attention.", action: "Review and update request statuses" });
    }

    // 4. Collection rate drop
    const currentMonth = now.toISOString().slice(0, 7);
    const monthPayments = payments.filter(p => p.month === currentMonth);
    if (monthPayments.length > 0) {
        const collected = monthPayments.filter(p => p.status === "paid").reduce((s, p) => s + (p.amount || 0), 0);
        const billed = monthPayments.reduce((s, p) => s + (p.amount || 0), 0);
        const rate = billed ? (collected / billed) * 100 : 0;
        if (rate < 50 && monthPayments.length >= 3) {
            alerts.push({ id: "low-collection", severity: "critical", title: "Low Collection Rate This Month", description: `Only ${rate.toFixed(0)}% collected this month. Most residents haven't paid.`, action: "Send urgent payment reminders" });
        }
    }

    // 5. Rooms in maintenance mode
    const maintenanceRooms = rooms.filter(r => r.maintenanceMode);
    if (maintenanceRooms.length > 0) {
        alerts.push({ id: "maintenance-rooms", severity: "info", title: `${maintenanceRooms.length} Room${maintenanceRooms.length > 1 ? "s" : ""} in Maintenance Mode`, description: `${maintenanceRooms.map(r => `Room ${r.roomNumber}`).join(", ")} cannot accept new residents.`, action: "Complete maintenance and re-enable rooms" });
    }

    // 6. No bills generated this month
    if (residents.length > 0 && monthPayments.length === 0) {
        alerts.push({ id: "no-bills", severity: "warning", title: "No Bills Generated This Month", description: `You have ${residents.length} active residents but no rent bills for ${currentMonth}.`, action: "Run monthly rent generation" });
    }

    if (alerts.length === 0) {
        alerts.push({ id: "all-clear", severity: "info", title: "All Clear", description: "No critical issues detected. Your property is performing well.", action: "Continue monitoring" });
    }

    return { alerts, generatedAt: new Date(), totalAlerts: alerts.length };
};
