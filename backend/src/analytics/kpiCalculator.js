import Room from "../models/rooms.js";
import Payment from "../models/Payment.js";
import Request from "../models/Request.js";

export const getKPIs = async ({ fromDate, toDate } = {}) => {
    const paymentDateFilter =
        fromDate && toDate
            ? { paidAt: { $gte: fromDate, $lte: toDate } }
            : {};

    const requestDateFilter =
        fromDate && toDate
            ? { createdAt: { $gte: fromDate, $lte: toDate } }
            : {};

    /* ================= OCCUPANCY ================= */
    const roomTotals = await Room.aggregate([
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

    const occupancyRate =
        totalBeds === 0 ? 0 : Number(((occupiedBeds / totalBeds) * 100).toFixed(2));

    /* ================= PAYMENTS ================= */
    const paymentStats = await Payment.aggregate([
        { $match: paymentDateFilter },
        {
            $group: {
                _id: null,
                totalBilled: { $sum: "$amount" },
                totalCollected: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "paid"] }, "$amount", 0],
                    },
                },
            },
        },
    ]);

    const totalBilled = paymentStats[0]?.totalBilled || 0;
    const totalCollected = paymentStats[0]?.totalCollected || 0;

    const collectionRate =
        totalBilled === 0
            ? 0
            : Number(((totalCollected / totalBilled) * 100).toFixed(2));

    /* ================= MAINTENANCE ================= */
    const resolvedRequests = await Request.aggregate([
        {
            $match: {
                status: "done", // ✅ correct final status
                ...requestDateFilter,
            },
        },
        {
            $project: {
                resolutionHours: {
                    $divide: [
                        { $subtract: ["$updatedAt", "$createdAt"] },
                        1000 * 60 * 60,
                    ],
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

    const avgResolutionTime =
        resolvedRequests[0]?.avgResolutionTime
            ? Number(resolvedRequests[0].avgResolutionTime.toFixed(2))
            : 0;

    const resolvedCount = resolvedRequests[0]?.resolvedCount || 0;

    /* ================= RESULT ================= */
    return {
        occupancy: {
            rate: occupancyRate,
            occupiedBeds,
            totalBeds,
        },
        payments: {
            collectionRate,
            totalBilled,
            totalCollected,
        },
        maintenance: {
            avgResolutionTime,
            resolvedCount,
        },
        meta: {
            mode: "snapshot",
            fromDate: fromDate || null,
            toDate: toDate || null,
            generatedAt: new Date(),
        },
    };
};
