// src/controllers/v2/intelligenceController.js
import { revenueForecast, occupancyTrends, smartAlerts } from "../../analytics/intelligenceEngine.js";
import { predictChurn } from "../../analytics/churnEngine.js";
import redis from "../../config/redis.js";
import logger from "../../utils/logger.js";

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
        const propertyId = req.user.propertyId || "global";
        const cacheKey = `intelligence:summary:${propertyId}`;

        // 1. Try Cache
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            logger.info("[Intelligence] Cache Hit", { propertyId });
            return res.json({ success: true, data: JSON.parse(cachedData), cached: true });
        }

        // 2. Compute
        const [forecast, trends, alerts, churn] = await Promise.allSettled([
            revenueForecast(req),
            occupancyTrends(req),
            smartAlerts(req),
            predictChurn(req),
        ]);

        const result = {
            forecast: forecast.status === "fulfilled" ? forecast.value : null,
            trends: trends.status === "fulfilled" ? trends.value : null,
            alerts: alerts.status === "fulfilled" ? alerts.value : null,
            churn: churn.status === "fulfilled" ? churn.value : null,
        };

        // 3. Save Cache (5 minutes)
        await redis.setex(cacheKey, 300, JSON.stringify(result));
        logger.info("[Intelligence] Cache Set", { propertyId });

        return res.json({
            success: true,
            data: result
        });
    } catch (err) { next(err); }
};
