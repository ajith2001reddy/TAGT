import User from "../../models/User.js";
import Room from "../../models/Room.js";
import Payment from "../../models/Payment.js";
import Property from "../../models/Property.js";
import Request from "../../models/Request.js";
import JoinRequest from "../../models/JoinRequest.js";
import { buildPropertyFilter } from "../../utils/tenantScope.js";
import logger from "../../utils/logger.js";
import { predictChurn } from "../../analytics/churnEngine.js";
import { predictMaintenanceCost } from "../../analytics/maintenanceForecast.js";

import cacheService from "../../services/cacheService.js";
import { getKPIsInternal } from "../../analytics/kpiCalculator.js";
import { calculateRevenueForecast, calculateSmartAlerts, calculateOccupancyTrends } from "../../analytics/intelligenceEngine.js";

// Redis Cache Config
const ANALYTICS_CACHE_TTL = 300; // 5 minutes (in seconds for Redis)

const getCacheKey = (user, prefix) => {
    const scope = buildPropertyFilter(user);
    return `analytics:${prefix}:${user.role}:${JSON.stringify(scope)}`;
};

/**
 * Standard summary for Owner Dashboard
 */
export const ownerDashboardAnalytics = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const cacheKey = cacheService.generateKey("owner_summary", JSON.stringify(scope));

        const cached = await cacheService.get(cacheKey);
        if (cached) return res.json(cached);

        const [totalResidents, totalRooms, pendingPayments, overduePayments, revenueAgg, occupancyAgg] = await Promise.all([
            User.countDocuments({ role: "resident", isActive: true, ...scope }),
            Room.countDocuments({ ...scope }),
            Payment.countDocuments({ status: "pending", ...scope }),
            Payment.countDocuments({ status: "pending", dueDate: { $lt: new Date() }, ...scope }),
            Payment.aggregate([{ $match: { status: "paid", isDeleted: { $ne: true }, ...scope } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
            Room.aggregate([{ $match: { isDeleted: { $ne: true }, ...scope } }, { $group: { _id: null, occupied: { $sum: "$occupiedBeds" }, total: { $sum: "$totalBeds" } } }])
        ]);

        const occupied = occupancyAgg[0]?.occupied || 0;
        const totalBeds = occupancyAgg[0]?.total || 0;
        const occupancyRate = totalBeds ? Number(((occupied / totalBeds) * 100).toFixed(2)) : 0;
        const monthlyRevenue = revenueAgg[0]?.total || 0;

        const insights = [];
        if (occupancyRate < 70) {
            insights.push({ type: "OCCUPANCY", severity: "HIGH", message: "Low occupancy detected", recommendation: "Consider promotions." });
        }

        const result = {
            success: true,
            data: {
                totalResidents, totalRooms, occupancyRate,
                pendingPayments, overduePayments, monthlyRevenue,
                insights
            }
        };

        await cacheService.set(cacheKey, result, 300);
        return res.json(result);
    } catch (err) {
        next(err);
    }
};

/**
 * Detailed financial dashboard with trends
 */
export const ownerFinancialDashboard = async (req, res, next) => {
    try {
        const cacheKey = getCacheKey(req.user, "owner_financial");

        // 1. Try Redis Cache
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            logger.info("Financial Cache Hit (via Service)", { key: cacheKey });
            return res.json(cached);
        }

        // 🔐 SECURITY: Always scope queries to this user's property/properties
        const scope = buildPropertyFilter(req.user);
        const currentMonth = new Date().toISOString().slice(0, 7);

        const [rooms, allPayments, monthPayments] = await Promise.all([
            Room.find(scope, "totalBeds occupiedBeds rent").lean(),
            Payment.find(scope, "amount status lateFee totalPayable paidAt dueDate").lean(),
            Payment.find({ ...scope, month: currentMonth }, "amount status lateFee").lean(),
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
            { $match: { ...scope, status: "paid", isDeleted: { $ne: true } } },
            { $group: { _id: "$month", collected: { $sum: "$amount" } } },
            { $sort: { _id: -1 } }, { $limit: 6 },
        ]);
        const trend = trendAgg.reverse().map(t => ({ month: t._id, collected: t.collected }));

        const result = {
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
        };

        await cacheService.set(cacheKey, result, ANALYTICS_CACHE_TTL);

        return res.json(result);
    } catch (err) { next(err); }
};

/**
 * Leakage report (empty beds, late payers)
 */
export const revenueLeakReport = async (req, res, next) => {
    try {
        const cacheKey = getCacheKey(req.user, "owner_leakage");

        // 1. Try Redis Cache
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            logger.info("Leakage Cache Hit (via Service)", { key: cacheKey });
            return res.json(cached);
        }

        // 🔐 SECURITY: Always scope queries to this user's property/properties
        const scope = buildPropertyFilter(req.user);

        const [rooms, residents, payments] = await Promise.all([
            Room.find(scope).lean(),
            User.find({ ...scope, role: "resident", isActive: true }).lean(),
            Payment.find(scope, "resident amount status lateFee dueDate month paidAt").lean(),
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

        const underpricedRooms = rooms.filter(r => r.rent < avgRent * 0.9).map(r => ({
            roomNumber: r.roomNumber,
            currentRent: r.rent,
            suggestedRent: Math.round(avgRent)
        }));

        const result = {
            success: true,
            data: {
                emptyBeds, emptyBedCostTotal,
                chronicLatePayers,
                underpricedRooms,
                avgRent: Math.round(avgRent),
            }
        };

        await cacheService.set(cacheKey, result, ANALYTICS_CACHE_TTL);

        return res.json(result);
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
            Payment.aggregate([{ $match: { status: "paid", isDeleted: { $ne: true } } }, { $group: { _id: null, total: { $sum: "$amount" } } }])
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
        const [totalProperties, totalOwners, totalResidents, revenueAgg, activePayments, rooms, subs, topProps, recentActivity] = await Promise.all([
            Property.countDocuments({}),
            User.countDocuments({ role: "owner" }),
            User.countDocuments({ role: "resident", isActive: true }),
            Payment.aggregate([{ $match: { status: "paid", isDeleted: { $ne: true } } }, { $group: { _id: null, total: { $sum: "$amount" }, fees: { $sum: "$lateFee" } } }]),
            Payment.countDocuments({ status: { $in: ["pending", "overdue"] }, isDeleted: { $ne: true } }),
            Room.aggregate([{ $match: { isDeleted: { $ne: true } } }, { $group: { _id: null, total: { $sum: "$totalBeds" }, occupied: { $sum: "$occupiedBeds" } } }]),
            import("../../models/Subscription.js").then(m => m.default.find({ status: "active" })),
            Payment.aggregate([
                { $match: { status: "paid", isDeleted: { $ne: true } } },
                { $group: { _id: "$propertyId", revenue: { $sum: "$amount" } } },
                { $sort: { revenue: -1 } },
                { $limit: 5 },
                { $lookup: { from: "properties", localField: "_id", foreignField: "_id", as: "property" } },
                { $unwind: "$property" }
            ]),
            import("../../models/ActivityLog.js").then(m => m.default.find({}).sort({ createdAt: -1 }).limit(5).populate("performedBy", "name"))
        ]);

        const totalBeds = rooms[0]?.total || 0;
        const occupiedBeds = rooms[0]?.occupied || 0;

        // Calculate MRR (Pro: 999, Enterprise: 2999)
        const mrr = (subs || []).reduce((acc, s) => {
            if (s.plan === "pro") return acc + 999;
            if (s.plan === "enterprise") return acc + 2999;
            return acc;
        }, 0);

        return res.json({
            success: true, data: {
                totalProperties, totalOwners, totalResidents,
                totalRentCollected: revenueAgg[0]?.total || 0,
                totalLateFeesCollected: revenueAgg[0]?.fees || 0,
                activeUnpaidBills: activePayments,
                platformOccupancyRate: totalBeds ? Number(((occupiedBeds / totalBeds) * 100).toFixed(1)) : 0,
                totalBeds, occupiedBeds,
                platformMRR: mrr,
                activeSubs: (subs || []).filter(s => s.plan !== "free").length,
                topProperties: (topProps || []).map(p => ({
                    id: p.property._id,
                    name: p.property.name,
                    revenue: p.revenue
                })),
                recentActivity: (recentActivity || []).map(a => ({
                    id: a._id,
                    action: a.action,
                    userName: a.performedBy?.name || "System",
                    createdAt: a.createdAt,
                    details: { propertyId: a.propertyId }
                }))
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
            User.findOne({ _id: req.user._id })
                .populate("propertyId", "name address city heroImage")
                .populate("roomId", "roomNumber rent totalBeds occupiedBeds")
                .populate("bedId", "bedNumber")
                .lean(),
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
            User.findById(req.user._id)
                .populate("propertyId", "name address city phone heroImage")
                .populate("roomId", "roomNumber rent totalBeds occupiedBeds")
                .populate("bedId", "bedNumber")
                .lean(),
            Payment.find({ resident: req.user._id, ...scope }).sort({ month: -1 }).lean(),
        ]);

        let pendingRequest = null;
        if (!profile?.propertyId) {
            pendingRequest = await JoinRequest.findOne({ residentId: req.user._id, status: "pending", isDeleted: false })
                .populate("propertyId", "name city")
                .lean();
        }

        const currentPayment = payments.find(p => p.month === currentMonth);
        const nextDue = currentPayment?.dueDate ? new Date(currentPayment.dueDate) : null;
        const daysUntilDue = nextDue ? Math.ceil((nextDue - Date.now()) / 86400000) : null;
        const isOverdue = daysUntilDue !== null && daysUntilDue < 0;

        // NEW: Calculate totals and notifications
        const paidPayments = payments.filter(p => p.status === "paid");
        const totalPaid = paidPayments.reduce((s, p) => s + (p.amount || 0), 0);
        const totalLateFeePaid = paidPayments.reduce((s, p) => s + (p.lateFee || 0), 0);

        const notifications = [...(profile?.notifications || [])];
        if (isOverdue) {
            notifications.push({ type: "danger", message: `Your rent for ${currentPayment?.month} is overdue. Please pay to avoid further late fees.` });
        } else if (daysUntilDue !== null && daysUntilDue <= 3 && currentPayment?.status !== "paid") {
            notifications.push({ type: "warning", message: `Your rent for ${currentPayment?.month} is due in ${daysUntilDue} days.` });
        }

        return res.json({
            success: true,
            data: {
                profile,
                pendingRequest,
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

/**
 * Owner Dashboard Summary – aggregates KPIs + Forecast + Churn + Maintenance in one call.
 * GET /v2/analytics/dashboard-summary
 */
export const ownerDashboardSummary = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const cacheKey = cacheService.generateKey("dashboard_summary", JSON.stringify(scope));

        const cached = await cacheService.get(cacheKey);
        if (cached) return res.json({ success: true, cached: true, data: cached });

        const [kpis, revenue, alerts] = await Promise.all([
            getKPIsInternal(scope),
            calculateRevenueForecast(scope),
            calculateSmartAlerts(scope)
        ]);

        const result = { kpis, revenue, alerts };
        await cacheService.set(cacheKey, result, 600);

        return res.json({ success: true, cached: false, data: result });
    } catch (err) {
        next(err);
    }
};
