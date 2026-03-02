import Request from "../models/Request.js";
import { buildPropertyFilter } from "../utils/tenantScope.js";

/**
 * Get monthly maintenance cost history
 */
async function getMonthlyMaintenanceCosts(months = 6, req) {
    const now = new Date();
    const history = [];

    const ranges = Array.from({ length: months }, (_, i) => {
        const start = new Date(
            now.getFullYear(),
            now.getMonth() - (months - i),
            1
        );

        const end = new Date(
            now.getFullYear(),
            now.getMonth() - (months - i) + 1,
            0,
            23,
            59,
            59
        );

        return { start, end };
    });

    const scope = buildPropertyFilter(req.user);

    const requestsByMonth = await Promise.all(
        ranges.map(({ start, end }) =>
            Request.find(
                {
                    createdAt: { $gte: start, $lte: end },
                    ...scope
                }
            ).lean()
        )
    );

    ranges.forEach(({ start }, idx) => {
        // Since no cost field exists,
        // we use request count as maintenance load proxy
        const totalRequests = requestsByMonth[idx].length;

        history.push({
            month: start.toISOString().slice(0, 7),
            cost: totalRequests
        });
    });

    return history;
}

/**
 * Calculate trend slope
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
 * Predict future maintenance cost
 */
async function predictMaintenanceCost(req, monthsAhead = 6) {
    const history = await getMonthlyMaintenanceCosts(6, req);

    if (!history.length) {
        return {
            history: [],
            forecast: [],
            meta: {
                model: "Insufficient data",
                generatedAt: new Date()
            }
        };
    }

    const trend = calculateCostTrend(history);
    const spikeRisk = detectSpikeRisk(history);

    let currentCost = history[history.length - 1].cost;
    const forecast = [];

    for (let i = 1; i <= monthsAhead; i++) {
        currentCost = Math.max(0, currentCost + trend);

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
            model: "Linear Trend Projection"
        }
    };
}

export { predictMaintenanceCost };