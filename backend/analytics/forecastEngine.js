const Room = require("../models/rooms");

/* =====================================================
   OCCUPANCY FORECAST ENGINE (HONEST VERSION)
===================================================== */

/**
 * Get current occupancy snapshot
 * (Used as baseline, not fake history)
 */
async function getCurrentOccupancy() {
    const rooms = await Room.find({}, "totalBeds occupiedBeds");

    if (!rooms.length) {
        return {
            totalBeds: 0,
            occupiedBeds: 0,
            occupancyRate: 0
        };
    }

    const totalBeds = rooms.reduce(
        (sum, r) => sum + (r.totalBeds || 0),
        0
    );

    const occupiedBeds = rooms.reduce(
        (sum, r) => sum + (r.occupiedBeds || 0),
        0
    );

    const occupancyRate =
        totalBeds === 0
            ? 0
            : Number(((occupiedBeds / totalBeds) * 100).toFixed(2));

    return { totalBeds, occupiedBeds, occupancyRate };
}

/**
 * Predict occupancy using flat projection
 * (No fake trends without historical data)
 */
async function predictOccupancy(monthsAhead = 6) {
    const snapshot = await getCurrentOccupancy();

    if (snapshot.totalBeds === 0) {
        return {
            history: [],
            forecast: [],
            meta: {
                note: "No room data available",
                generatedAt: new Date()
            }
        };
    }

    const now = new Date();

    // Represent "history" as a single baseline point
    const history = [
        {
            month: now.toISOString().slice(0, 7),
            occupancyRate: snapshot.occupancyRate
        }
    ];

    const forecast = [];

    for (let i = 1; i <= monthsAhead; i++) {
        const date = new Date(now);
        date.setMonth(now.getMonth() + i);

        forecast.push({
            month: date.toISOString().slice(0, 7),
            predictedOccupancy: snapshot.occupancyRate
        });
    }

    return {
        history,
        forecast,
        meta: {
            model: "Flat baseline (no historical data)",
            generatedAt: new Date(),
            totalBeds: snapshot.totalBeds,
            occupiedBeds: snapshot.occupiedBeds
        }
    };
}

module.exports = {
    predictOccupancy
};
