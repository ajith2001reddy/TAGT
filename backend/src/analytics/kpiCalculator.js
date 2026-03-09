import Room from "../models/Room.js";
import Payment from "../models/Payment.js";
import Request from "../models/Request.js";

/**
 * Stateless KPI Calculator.
 * Logic is separated from Express request/response.
 */

export const calculateOccupancyKPI = async (scope) => {
    const roomTotals = await Room.aggregate([
        { $match: { ...scope, isDeleted: { $ne: true } } },
        {
            $group: {
                _id: null,
                totalBeds: { $sum: "$totalBeds" },
                occupiedBeds: { $sum: "$occupiedBeds" },
            },
        },
    ]);

    const totalBeds = roomTotals[0]?.totalBeds || 0;
    const occupiedBeds = roomTotals[0]?.occupiedBeds || 0;
    const occupancyRate = totalBeds === 0 ? 0 : Number(((occupiedBeds / totalBeds) * 100).toFixed(2));

    return { rate: occupancyRate, occupiedBeds, totalBeds };
};

export const calculatePaymentKPI = async (scope, fromDate, toDate) => {
    const paymentDateFilter = fromDate && toDate ? { paidAt: { $gte: new Date(fromDate), $lte: new Date(toDate) } } : {};

    const paymentStats = await Payment.aggregate([
        { $match: { ...paymentDateFilter, ...scope, isDeleted: { $ne: true } } },
        {
            $group: {
                _id: null,
                totalBilled: { $sum: "$amount" },
                totalCollected: {
                    $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$amount", 0] },
                },
            },
        },
    ]);

    const totalBilled = paymentStats[0]?.totalBilled || 0;
    const totalCollected = paymentStats[0]?.totalCollected || 0;
    const collectionRate = totalBilled === 0 ? 0 : Number(((totalCollected / totalBilled) * 100).toFixed(2));

    return { collectionRate, totalBilled, totalCollected };
};

export const calculateMaintenanceKPI = async (scope, fromDate, toDate) => {
    const requestDateFilter = fromDate && toDate ? { createdAt: { $gte: new Date(fromDate), $lte: new Date(toDate) } } : {};

    const resolvedRequests = await Request.aggregate([
        { $match: { ...scope, status: "resolved", ...requestDateFilter, isDeleted: { $ne: true } } },
        {
            $project: {
                resolutionHours: {
                    $divide: [{ $subtract: ["$updatedAt", "$createdAt"] }, 1000 * 60 * 60],
                },
            },
        },
        {
            $group: {
                _id: null,
                avgResolutionTime: { $avg: "$resolutionHours" },
                resolvedCount: { $sum: 1 },
            },
        },
    ]);

    const avgResolutionTime = resolvedRequests[0]?.avgResolutionTime ? Number(resolvedRequests[0].avgResolutionTime.toFixed(2)) : 0;
    const resolvedCount = resolvedRequests[0]?.resolvedCount || 0;

    return { avgResolutionTime, resolvedCount };
};

/**
 * Consolidated KPI getter (Stateless)
 */
export const getKPIsInternal = async (scope, { fromDate, toDate } = {}) => {
    const [occupancy, payments, maintenance] = await Promise.all([
        calculateOccupancyKPI(scope),
        calculatePaymentKPI(scope, fromDate, toDate),
        calculateMaintenanceKPI(scope, fromDate, toDate),
    ]);

    return {
        occupancy,
        payments,
        maintenance,
        meta: {
            generatedAt: new Date(),
            fromDate,
            toDate
        }
    };
};
