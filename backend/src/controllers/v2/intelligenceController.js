// src/controllers/v2/intelligenceController.js
import { revenueForecast, occupancyTrends, smartAlerts } from "../../analytics/intelligenceEngine.js";
import { predictChurn } from "../../analytics/churnEngine.js";

/* ─────────────────────────────────────────────────
   GET /v2/intelligence/revenue-forecast
───────────────────────────────────────────────── */
export const getRevenueForecast = async (req, res, next) => {
    try {
        const data = await revenueForecast(req);
        return res.json({ success: true, data });
    } catch (err) { next(err); }
};

/* ─────────────────────────────────────────────────
   GET /v2/intelligence/occupancy-trends
───────────────────────────────────────────────── */
export const getOccupancyTrends = async (req, res, next) => {
    try {
        const data = await occupancyTrends(req);
        return res.json({ success: true, data });
    } catch (err) { next(err); }
};

/* ─────────────────────────────────────────────────
   GET /v2/intelligence/smart-alerts
───────────────────────────────────────────────── */
export const getSmartAlerts = async (req, res, next) => {
    try {
        const data = await smartAlerts(req);
        return res.json({ success: true, data });
    } catch (err) { next(err); }
};

/* ─────────────────────────────────────────────────
   GET /v2/intelligence/churn-analysis
   Enhanced churn: full per-resident data
───────────────────────────────────────────────── */
export const getChurnAnalysis = async (req, res, next) => {
    try {
        const data = await predictChurn(req);
        return res.json({ success: true, data });
    } catch (err) { next(err); }
};

/* ─────────────────────────────────────────────────
   GET /v2/intelligence/summary
   All 4 in one call for the owner intelligence page
───────────────────────────────────────────────── */
export const getIntelligenceSummary = async (req, res, next) => {
    try {
        const [forecast, trends, alerts, churn] = await Promise.allSettled([
            revenueForecast(req),
            occupancyTrends(req),
            smartAlerts(req),
            predictChurn(req),
        ]);

        return res.json({
            success: true,
            data: {
                forecast: forecast.status === "fulfilled" ? forecast.value : null,
                trends: trends.status === "fulfilled" ? trends.value : null,
                alerts: alerts.status === "fulfilled" ? alerts.value : null,
                churn: churn.status === "fulfilled" ? churn.value : null,
            }
        });
    } catch (err) { next(err); }
};
