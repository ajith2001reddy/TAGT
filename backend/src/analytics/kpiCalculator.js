const Room = require("../models/rooms");
const Payment = require("../models/Payment");
const Request = require("../models/Request");

async function getKPIs({ fromDate, toDate } = {}) {
    const dateFilter =
        fromDate && toDate
            ? { createdAt: { $gte: fromDate, $lte: toDate } }
            : {};

    const [rooms, payments, resolvedRequests] = await Promise.all([
        Room.find({}, "totalBeds occupiedBeds").lean(),
        Payment.find(dateFilter, "amount status").lean(),
        Request.find(
            { status: "resolved", ...dateFilter },
            "createdAt updatedAt"
        ).lean()
    ]);

    const totals = rooms.reduce(
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

    let totalResolutionHours = 0;

    for (const req of resolvedRequests) {
        totalResolutionHours +=
            (new Date(req.updatedAt) - new Date(req.createdAt)) /
            (1000 * 60 * 60);
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

module.exports = { getKPIs };
