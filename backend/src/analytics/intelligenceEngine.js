import Payment from "../models/Payment.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import Request from "../models/Request.js";

/**
 * Stateless Intelligence Engine.
 * Calculations are performed on provided data or by fetching data using a scope.
 */

/* ── Revenue Forecast ── */
export const calculateRevenueForecast = async (scope) => {
    const history = await Payment.aggregate([
        { $match: { ...scope, status: "paid", isDeleted: { $ne: true } } },
        { $group: { _id: "$month", collected: { $sum: "$amount" }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
    ]);

    const last6 = history.slice(-6);
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
        intercept = avg;
    }

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
    };
};

/* ── Occupancy Trends ── */
export const calculateOccupancyTrends = async (scope) => {
    const rooms = await Room.find(scope, "totalBeds occupiedBeds rent roomNumber").lean();
    const totalBeds = rooms.reduce((s, r) => s + (r.totalBeds || 0), 0);
    const currentOccupied = rooms.reduce((s, r) => s + (r.occupiedBeds || 0), 0);

    const paymentsByMonth = await Payment.aggregate([
        { $match: { ...scope, isDeleted: { $ne: true } } },
        { $group: { _id: "$month", billed: { $sum: "$amount" }, paid: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$amount", 0] } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $limit: 12 },
    ]);

    const residentsByMonth = await User.aggregate([
        { $match: { ...scope, role: "resident", isDeleted: { $ne: true } } },
        { $group: { _id: { $substr: ["$createdAt", 0, 7] }, newResidents: { $sum: 1 } } },
        { $sort: { _id: 1 } },
    ]);

    const residentMap = {};
    residentsByMonth.forEach(r => { residentMap[r._id] = r.newResidents; });

    const roomBreakdown = rooms.map(r => ({
        id: r._id,
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
    };
};

/* ── Smart Alerts ── */
export const calculateSmartAlerts = async (scope) => {
    const alerts = [];
    const [rooms, payments, residents, requests] = await Promise.all([
        Room.find(scope).lean(),
        Payment.find(scope).lean(),
        User.find({ ...scope, role: "resident", isActive: true, isDeleted: { $ne: true } }).lean(),
        Request.find({ ...scope, status: { $in: ["pending", "open"] }, isDeleted: { $ne: true } }).lean(),
    ]);

    const now = new Date();
    const totalBeds = rooms.reduce((s, r) => s + (r.totalBeds || 0), 0);
    const occupiedBeds = rooms.reduce((s, r) => s + (r.occupiedBeds || 0), 0);
    const occupancyRate = totalBeds ? (occupiedBeds / totalBeds) * 100 : 0;

    if (occupancyRate < 60) {
        alerts.push({ id: "low-occupancy", severity: "critical", title: "Critical Low Occupancy", description: `Only ${occupancyRate.toFixed(0)}% beds occupied.`, action: "Review pricing" });
    }

    const overduePayments = payments.filter(p => p.status === "overdue");
    if (overduePayments.length >= 3) {
        alerts.push({ id: "overdue-cluster", severity: "critical", title: `${overduePayments.length} Overdue Bills`, action: "Send reminders" });
    }

    const pendingRequests = requests.filter(r => r.status === "pending");
    if (pendingRequests.length >= 5) {
        alerts.push({ id: "maintenance-overload", severity: "critical", title: "Maintenance Overload", action: "Resolve priority requests" });
    }

    if (alerts.length === 0) {
        alerts.push({ id: "all-clear", severity: "info", title: "All Clear", description: "No critical issues detected." });
    }

    return { alerts, totalAlerts: alerts.length };
};
