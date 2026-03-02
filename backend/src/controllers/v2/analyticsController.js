import User from "../../models/User.js";
import Room from "../../models/rooms.js";
import Payment from "../../models/Payment.js";
import Property from "../../models/Property.js";
import Request from "../../models/Request.js";
import { buildPropertyFilter } from "../../utils/tenantScope.js";

/**
 * Standard summary for Owner Dashboard
 */
export const ownerDashboardAnalytics = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const propertyMatch = scope.propertyId ? { propertyId: scope.propertyId } : {};

        const [totalResidents, totalRooms, pendingPayments, overduePayments, revenueAgg, occupancyAgg] = await Promise.all([
            User.countDocuments({ role: "resident", isActive: true, ...propertyMatch }),
            Room.countDocuments({ ...propertyMatch }),
            Payment.countDocuments({ status: "pending", ...propertyMatch }),
            Payment.countDocuments({ status: "pending", dueDate: { $lt: new Date() }, ...propertyMatch }),
            Payment.aggregate([{ $match: { status: "paid", ...propertyMatch } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
            Room.aggregate([{ $match: propertyMatch }, { $group: { _id: null, occupied: { $sum: "$occupiedBeds" }, total: { $sum: "$totalBeds" } } }])
        ]);

        const occupied = occupancyAgg[0]?.occupied || 0;
        const totalBeds = occupancyAgg[0]?.total || 0;
        const occupancyRate = totalBeds ? Number(((occupied / totalBeds) * 100).toFixed(2)) : 0;
        const monthlyRevenue = revenueAgg[0]?.total || 0;

        // Generate Insights (Consolidated from legacy optimizeRevenue)
        const insights = [];
        if (occupancyRate < 70) {
            insights.push({
                type: "OCCUPANCY",
                severity: "HIGH",
                message: "Low occupancy detected",
                recommendation: "Consider promotions or flexible pricing to fill units."
            });
        }
        if (overduePayments > 2) {
            insights.push({
                type: "PAYMENTS",
                severity: "MEDIUM",
                message: "High overdue payments count",
                recommendation: "Send automated reminders or enforce late fees."
            });
        }
        if (insights.length === 0) {
            insights.push({
                type: "HEALTHY",
                severity: "LOW",
                message: "Portfolio performing well",
                recommendation: "Maintain current operational strategy."
            });
        }

        return res.json({
            success: true,
            data: {
                totalResidents,
                totalRooms,
                occupancyRate,
                pendingPayments,
                overduePayments,
                monthlyRevenue,
                insights
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Detailed financial dashboard with trends
 */
export const ownerFinancialDashboard = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const pm = scope.propertyId ? { propertyId: scope.propertyId } : {};
        const currentMonth = new Date().toISOString().slice(0, 7);

        const [rooms, allPayments, monthPayments] = await Promise.all([
            Room.find(pm, "totalBeds occupiedBeds rent").lean(),
            Payment.find(pm, "amount status lateFee totalPayable paidAt dueDate").lean(),
            Payment.find({ ...pm, month: currentMonth }, "amount status lateFee").lean(),
        ]);

        const totalBeds = rooms.reduce((s, r) => s + (r.totalBeds || 0), 0);
        const occupiedBeds = rooms.reduce((s, r) => s + (r.occupiedBeds || 0), 0);
        const occupancyRate = totalBeds ? Number(((occupiedBeds / totalBeds) * 100).toFixed(1)) : 0;

        const expectedMonthly = rooms.reduce((s, r) => s + (r.rent || 0) * (r.occupiedBeds || 0), 0);

        const monthCollected = monthPayments.filter(p => p.status === "paid").reduce((s, p) => s + (p.amount || 0), 0);
        const monthExpected = monthPayments.reduce((s, p) => s + (p.amount || 0), 0);
        const outstanding = allPayments.filter(p => p.status !== "paid").reduce((s, p) => s + (p.amount || 0), 0);
        const lateFeesEarned = allPayments.filter(p => p.status === "paid").reduce((s, p) => s + (p.lateFee || 0), 0);
        const overdue = allPayments.filter(p => p.status !== "paid" && p.dueDate && new Date(p.dueDate) < new Date());
        const overdueAmount = overdue.reduce((s, p) => s + (p.amount || 0), 0);

        // 6-month revenue trend
        const trendAgg = await Payment.aggregate([
            { $match: { ...pm, status: "paid" } },
            { $group: { _id: "$month", collected: { $sum: "$amount" } } },
            { $sort: { _id: -1 } }, { $limit: 6 },
        ]);
        const trend = trendAgg.reverse().map(t => ({ month: t._id, collected: t.collected }));

        return res.json({
            success: true,
            data: {
                occupancyRate, totalBeds, occupiedBeds,
                monthly: { expected: monthExpected || expectedMonthly, collected: monthCollected, outstanding },
                lateFeesEarned,
                overdueAmount,
                overdueCount: overdue.length,
                profitEstimate: monthCollected + lateFeesEarned,
                collectionRate: monthExpected ? Number(((monthCollected / monthExpected) * 100).toFixed(1)) : 0,
                trend,
            }
        });
    } catch (err) { next(err); }
};

/**
 * Leakage report (empty beds, late payers)
 */
export const revenueLeakReport = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const pm = scope.propertyId ? { propertyId: scope.propertyId } : {};

        const [rooms, residents, payments] = await Promise.all([
            Room.find(pm).lean(),
            User.find({ ...pm, role: "resident", isActive: true }).lean(),
            Payment.find(pm, "resident amount status lateFee dueDate month paidAt").lean(),
        ]);

        const avgRent = rooms.length ? rooms.reduce((s, r) => s + (r.rent || 0), 0) / rooms.length : 0;

        const emptyBeds = rooms.map(r => {
            const empty = (r.totalBeds || 0) - (r.occupiedBeds || 0);
            return { roomNumber: r.roomNumber, emptyBeds: empty, costPerMonth: empty * (r.rent || 0) };
        }).filter(r => r.emptyBeds > 0);

        const emptyBedCostTotal = emptyBeds.reduce((s, r) => s + r.costPerMonth, 0);

        const paymentsByResident = {};
        for (const p of payments) {
            const rid = String(p.resident);
            if (!paymentsByResident[rid]) paymentsByResident[rid] = [];
            paymentsByResident[rid].push(p);
        }

        const chronicLatePayers = residents.filter(r => {
            const rPays = paymentsByResident[String(r._id)] || [];
            const late = rPays.filter(p => p.status !== "paid" && p.dueDate && new Date(p.dueDate) < new Date());
            return late.length >= 2;
        }).map(r => ({ name: r.name, email: r.email, lateCount: (paymentsByResident[String(r._id)] || []).filter(p => p.status !== "paid").length }));

        return res.json({
            success: true,
            data: {
                emptyBeds, emptyBedCostTotal,
                chronicLatePayers,
                avgRent: Math.round(avgRent),
            }
        });
    } catch (err) { next(err); }
};

/**
 * Super Admin: Overview of entire platform
 */
export const providerOverview = async (req, res, next) => {
    try {
        const [totalProperties, totalOwners, totalResidents, revenue] = await Promise.all([
            Property.countDocuments({}),
            User.countDocuments({ role: "owner" }),
            User.countDocuments({ role: "resident" }),
            Payment.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$amount" } } }])
        ]);
        return res.json({
            success: true,
            data: {
                totalProperties,
                totalOwners,
                totalResidents,
                platformRevenue: revenue[0]?.total || 0
            }
        });
    } catch (err) { next(err); }
};

/**
 * Platform-wide stats for Super Admins
 */
export const platformStats = async (req, res, next) => {
    try {
        const [totalProperties, totalOwners, totalResidents, revenueAgg, activePayments, rooms] = await Promise.all([
            Property.countDocuments({}),
            User.countDocuments({ role: "owner" }),
            User.countDocuments({ role: "resident", isActive: true }),
            Payment.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$amount" }, fees: { $sum: "$lateFee" } } }]),
            Payment.countDocuments({ status: { $in: ["pending", "overdue"] } }),
            Room.aggregate([{ $group: { _id: null, total: { $sum: "$totalBeds" }, occupied: { $sum: "$occupiedBeds" } } }]),
        ]);

        const totalBeds = rooms[0]?.total || 0;
        const occupiedBeds = rooms[0]?.occupied || 0;

        return res.json({
            success: true, data: {
                totalProperties, totalOwners, totalResidents,
                totalRentCollected: revenueAgg[0]?.total || 0,
                totalLateFeesCollected: revenueAgg[0]?.fees || 0,
                activeUnpaidBills: activePayments,
                platformOccupancyRate: totalBeds ? Number(((occupiedBeds / totalBeds) * 100).toFixed(1)) : 0,
                totalBeds, occupiedBeds,
            }
        });
    } catch (err) { next(err); }
};

/**
 * Resident Dashboard (V1)
 */
export const residentDashboard = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const [profile, payments, requests] = await Promise.all([
            User.findOne({ _id: req.user._id }).populate("roomId", "roomNumber rent totalBeds occupiedBeds").lean(),
            Payment.find(scope).sort({ createdAt: -1 }).limit(12).lean(),
            Request.find(scope).sort({ createdAt: -1 }).limit(20).lean()
        ]);
        return res.json({ success: true, data: { profile, payments, requests } });
    } catch (err) { next(err); }
};

/**
 * Resident Dashboard (V2) - Enhanced with countdowns
 */
export const residentDashboardV2 = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const currentMonth = new Date().toISOString().slice(0, 7);

        const [profile, payments] = await Promise.all([
            User.findById(req.user._id).populate("roomId", "roomNumber rent totalBeds occupiedBeds").lean(),
            Payment.find({ resident: req.user._id, ...scope }).sort({ month: -1 }).lean(),
        ]);

        const currentPayment = payments.find(p => p.month === currentMonth);
        const nextDue = currentPayment?.dueDate ? new Date(currentPayment.dueDate) : null;
        const daysUntilDue = nextDue ? Math.ceil((nextDue - Date.now()) / 86400000) : null;
        const isOverdue = daysUntilDue !== null && daysUntilDue < 0;

        // NEW: Calculate totals and notifications
        const paidPayments = payments.filter(p => p.status === "paid");
        const totalPaid = paidPayments.reduce((s, p) => s + (p.amount || 0), 0);
        const totalLateFeePaid = paidPayments.reduce((s, p) => s + (p.lateFee || 0), 0);

        const notifications = [];
        if (isOverdue) {
            notifications.push({ type: "danger", message: `Your rent for ${currentPayment?.month} is overdue. Please pay to avoid further late fees.` });
        } else if (daysUntilDue !== null && daysUntilDue <= 3 && currentPayment?.status !== "paid") {
            notifications.push({ type: "warning", message: `Your rent for ${currentPayment?.month} is due in ${daysUntilDue} days.` });
        }

        return res.json({
            success: true,
            data: {
                profile,
                room: profile?.roomId || null,
                currentPayment: currentPayment || null,
                daysUntilDue,
                isOverdue,
                totalPaid,
                totalLateFeePaid,
                notifications,
                paymentHistory: payments,
            }
        });
    } catch (err) { next(err); }
};
