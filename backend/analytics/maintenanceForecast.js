const Request = require("../models/Request");

/* =====================================================
   MAINTENANCE COST FORECAST ENGINE
   - Monthly aggregation
   - Trend-based prediction
   - Spike detection
===================================================== */

/**
 * Get monthly maintenance cost history
 */
async function getMonthlyMaintenanceCosts(months = 6) {
    const now = new Date();
    const history = [];

    for (let i = months; i > 0; i--) {
        const start = new Date(
            now.getFullYear(),
            now.getMonth() - i,
            1
        );
        const end = new Date(
            now.getFullYear(),
            now.getMonth() - i + 1,
            0,
            23,
            59,
            59
        );

        const requests = await Request.find({
            createdAt: { $gte: start, $lte: end }
        });

        const totalCost = requests.reduce(
            (sum, r) => sum + (r.cost || 0),
            0
        );

        history.push({
            month: start.toISOString().slice(0, 7),
            cost: Number(totalCost.toFixed(2))
        });
    }

    return history;
}

/**
 * Calculate average monthly cost change (trend)
 */
function calculateCostTrend(data) {
    if (data.length < 2) return 0;

    let change = 0;
    for (let i = 1; i < data.length; i++) {
        change += data[i].cost - data[i - 1].cost;
    }

    return change / (data.length - 1);
}

/**
 * Detect spike risk
 */
function detectSpikeRisk(history) {
    if (history.length < 3) return "LOW";

    const avg =
        history.reduce((s, m) => s + m.cost, 0) / history.length;

    const last = history[history.length - 1].cost;

    if (last > avg * 1.4) return "HIGH";
    if (last > avg * 1.2) return "MEDIUM";
    return "LOW";
}

/**
 * Predict future maintenance costs
 */
async function predictMaintenanceCost(monthsAhead = 6) {
    const history = await getMonthlyMaintenanceCosts(6);

    if (history.length === 0) {
        return {
            history: [],
            forecast: [],
            note: "Not enough data to forecast maintenance costs"
        };
    }

    const trend = calculateCostTrend(history);
    const spikeRisk = detectSpikeRisk(history);

    let currentCost = history[history.length - 1].cost;
    const forecast = [];

    for (let i = 1; i <= monthsAhead; i++) {
        currentCost += trend;
        currentCost = Math.max(0, currentCost);

        const date = new Date();
        date.setMonth(date.getMonth() + i);

        forecast.push({
            month: date.toISOString().slice(0, 7),
            predictedCost: Number(currentCost.toFixed(2))
        });
    }

    return {
        history,
        forecast,
        meta: {
            trend: Number(trend.toFixed(2)),
            spikeRisk,
            generatedAt: new Date(),
            model: "Linear Trend + Spike Detection"
        }
    };
}

module.exports = {
    predictMaintenanceCost
};
