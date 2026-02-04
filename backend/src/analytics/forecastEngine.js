import Room from "../models/rooms.js";

async function getCurrentOccupancy() {
    const rooms = await Room.find({}, "totalBeds occupiedBeds").lean();

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

async function predictOccupancy(monthsAhead = 6) {
    const snapshot = await getCurrentOccupancy();

    if (snapshot.totalBeds === 0) {
        return {
            history: [],
            forecast: [],
            meta: {
                model: "No data",
                generatedAt: new Date()
            }
        };
    }

    const now = new Date();

    const history = [
        {
            month: now.toISOString().slice(0, 7),
            occupancyRate: snapshot.occupancyRate
        }
    ];

    const forecast = Array.from({ length: monthsAhead }, (_, i) => {
        const date = new Date(now);
        date.setMonth(now.getMonth() + i + 1);

        return {
            month: date.toISOString().slice(0, 7),
            predictedOccupancy: snapshot.occupancyRate
        };
    });

    return {
        history,
        forecast,
        meta: {
            model: "Flat baseline projection",
            generatedAt: new Date(),
            totalBeds: snapshot.totalBeds,
            occupiedBeds: snapshot.occupiedBeds,
            occupancyRate: snapshot.occupancyRate
        }
    };
}

export { predictOccupancy };
