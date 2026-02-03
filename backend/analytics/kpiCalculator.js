const Room = require("../models/Room");
const Payment = require("../models/Payment");
const Request = require("../models/Request");

/* =====================================================
   KPI CALCULATOR (SNAPSHOT-BASED)
===================================================== */

async function getKPIs({ fromDate, toDate } = {}) {
    const dateFilter =
        fromDate && toDate
            ? { createdAt: { $gte: fromDate, $lte: toDate } }
            : {};

    /* =======================
       OCCUPANCY KPI
    ======================= */
    const roomDocs = await Room.find({}, "totalBeds occupiedBeds");

    const totals = roomDocs.reduce(
        (acc, room) => {
            acc.totalBeds += room.totalBeds || 0;
            acc.occupiedBeds += room.occupiedBeds || 0;
            return acc;
        },
        { totalBeds: 0, occupiedBeds: 0 }
    );

    const occupancyRate =
        totals.totalBeds === 0
            ? 0
            : Number(
                ((totals.occupiedBeds / totals.totalBeds) * 100).toFixed(2)
            );

    /* =======================
       PAYMENT COLLECTION KPI
    ======================= */
    const payments = await Payment.find(dateFilter, "amount status");

    let totalBilled = 0;
    let totalCollected = 0;

    for (const payment of payments) {
        totalBilled += payment.amount || 0;
        if (payment.status === "paid") {
            totalCollected += payment.amount || 0;
        }
    }

    const collectionRate =
        totalBilled === 0
            ? 0
            : Number(((totalCollected / totalBilled) * 100).toFixed(2));

    /* =======================
       MAINTENANCE KPI
    ======================= */
    const resolvedRequests = await Request.find(
        { status: "resolved", ...dateFilter },
        "createdAt updatedAt"
    );

    let totalResolutionHours = 0;

    for (const req of resolvedRequests) {
        const hours =
            (new Date(req.updatedAt) - new Date(req.createdAt)) /
            (1000 * 60 * 60);
        totalResolutionHours += hours;
    }

    const avgResolutionTime =
        resolvedRequests.length === 0
            ? 0
            : Number(
                (totalResolutionHours / resolvedRequests.length).toFixed(2)
            );

    return {
        occupancy: {
            rate: occupancyRate,
            occupiedBeds: totals.occupiedBeds,
            totalBeds: totals.totalBeds
        },
        payments: {
            collectionRate,
            totalBilled,
            totalCollected
        },
        maintenance: {
            avgResolutionTime,
            resolvedCount: resolvedRequests.length
        },
        meta: {
            mode: "snapshot",
            fromDate: fromDate || null,
            toDate: toDate || null,
            generatedAt: new Date()
        }
    };
}

module.exports = {
    getKPIs
};
