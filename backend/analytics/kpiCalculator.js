const Room = require("../models/Room");
const Payment = require("../models/Payment");
const Request = require("../models/Request");

/* =====================================================
   ADVANCED KPI CALCULATOR
   - Real-time metrics
   - Safe fallbacks
   - Time-range ready (future AI use)
===================================================== */

async function getKPIs({ fromDate, toDate } = {}) {
    const dateFilter =
        fromDate && toDate
            ? { createdAt: { $gte: fromDate, $lte: toDate } }
            : {};

    /* =======================
       OCCUPANCY KPI
    ======================= */
    const rooms = await Room.find({}, "totalBeds occupiedBeds");

    const totals = rooms.reduce(
        (acc, r) => {
            acc.totalBeds += r.totalBeds || 0;
            acc.occupiedBeds += r.occupiedBeds || 0;
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

    for (const p of payments) {
        totalBilled += p.amount || 0;
        if (p.status === "paid") {
            totalCollected += p.amount || 0;
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

    for (const r of resolvedRequests) {
        const hours =
            (new Date(r.updatedAt) - new Date(r.createdAt)) /
            (1000 * 60 * 60);
        totalResolutionHours += hours;
    }

    const avgResolutionTime =
        resolvedRequests.length === 0
            ? 0
            : Number(
                (totalResolutionHours / resolvedRequests.length).toFixed(2)
            );

    /* =======================
       RETURN KPI OBJECT
    ======================= */
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
            fromDate: fromDate || null,
            toDate: toDate || null,
            generatedAt: new Date()
        }
    };
}

module.exports = {
    getKPIs
};
