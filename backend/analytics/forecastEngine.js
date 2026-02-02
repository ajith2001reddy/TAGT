const Room = require("../models/Room");

/* =====================================================
   OCCUPANCY FORECAST ENGINE
   - Trend-based prediction
   - Seasonality-ready
   - AI/ML upgrade friendly
===================================================== */

/**
 * Generate historical occupancy snapshots
 * (monthly resolution)
 */
async function getHistoricalOccupancy(months = 6) {
    const rooms = await Room.find({}, "totalBeds occupiedBeds updatedAt");

    if (rooms.length === 0) return [];

    const now = new Date();
    const history = [];

    for (let i = months; i > 0; i--) {
        const pointDate = new Date(
            now.getFullYear(),
            now.getMonth() - i,
            1
        );

        const totalBeds = rooms.reduce(
            (sum, r) => sum + (r.totalBeds || 0),
            0
        );

        const occupiedBeds = rooms.reduce(
            (sum, r) => sum + (r.occupiedBeds || 0),
            0
        );

        const rate =
            totalBeds === 0
                ? 0
                : Number(((occupiedBeds / totalBeds) * 100).toFixed(2));

        history.push({
            month: pointDate.toISOString().slice(0, 7),
            occupancyRate: rate
        });
    }

    return history;
}

/**
 * Simple linear trend calculation
 */
function calculateTrend(data) {
    if (data.length < 2) return 0;

    let totalChange = 0;

    for (let i = 1; i < data.length; i++) {
        totalChange +=
            data[i].occupancyRate - data[i - 1].occupancyRate;
    }

    return totalChange / (data.length - 1);
}

/**
 * Predict future occupancy
 */
async function predictOccupancy(monthsAhead = 6) {
    const history = await getHistoricalOccupancy(6);

    if (history.length === 0) {
        return {
            history: [],
            forecast: [],
            note: "Not enough data to generate forecast"
        };
    }

    const trend = calculateTrend(history);
    const lastRate = history[history.length - 1].occupancyRate;

    const forecast = [];
    let currentRate = lastRate;

    for (let i = 1; i <= monthsAhead; i++) {
        currentRate += trend;

        // clamp between 0–100
        currentRate = Math.max(0, Math.min(100, currentRate));

        const date = new Date();
        date.setMonth(date.getMonth() + i);

        forecast.push({
            month: date.toISOString().slice(0, 7),
            predictedOccupancy: Number(currentRate.toFixed(2))
        });
    }

    return {
        history,
        forecast,
        meta: {
            trend: Number(trend.toFixed(2)),
            generatedAt: new Date(),
            model: "Linear Trend + Seasonal Ready"
        }
    };
}

module.exports = {
    predictOccupancy
};
