import { calculateRevenueForecast, calculateOccupancyTrends, calculateSmartAlerts } from "../../analytics/intelligenceEngine.js";
import { predictChurn } from "../../analytics/churnEngine.js";
import cacheService from "../../services/cacheService.js";
import { buildPropertyFilter } from "../../utils/tenantScope.js";
import logger from "../../utils/logger.js";

/* ─────────────────────────────────────────────────
   GET /v2/intelligence/revenue-forecast
───────────────────────────────────────────────── */
export const getRevenueForecast = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const data = await calculateRevenueForecast(scope);
        return res.json({ success: true, data });
    } catch (err) { next(err); }
};

/* ─────────────────────────────────────────────────
   GET /v2/intelligence/occupancy-trends
───────────────────────────────────────────────── */
export const getOccupancyTrends = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const data = await calculateOccupancyTrends(scope);
        return res.json({ success: true, data });
    } catch (err) { next(err); }
};

/* ─────────────────────────────────────────────────
   GET /v2/intelligence/smart-alerts
───────────────────────────────────────────────── */
export const getSmartAlerts = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const data = await calculateSmartAlerts(scope);
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
        const scope = buildPropertyFilter(req.user);
        const cacheKey = cacheService.generateKey("intelligence_summary", JSON.stringify(scope));

        // 1. Try Cache
        const cachedData = await cacheService.get(cacheKey);
        if (cachedData) {
            logger.info("[Intelligence] Cache Hit", { scope });
            return res.json({ success: true, data: cachedData, cached: true });
        }

        // 2. Compute
        const [forecast, trends, alerts, churn] = await Promise.allSettled([
            calculateRevenueForecast(scope),
            calculateOccupancyTrends(scope),
            calculateSmartAlerts(scope),
            predictChurn(req),
        ]);

        const result = {
            forecast: forecast.status === "fulfilled" ? forecast.value : null,
            trends: trends.status === "fulfilled" ? trends.value : null,
            alerts: alerts.status === "fulfilled" ? alerts.value : null,
            churn: churn.status === "fulfilled" ? churn.value : null,
        };

        // 3. Save Cache (5 minutes)
        await cacheService.set(cacheKey, result, 300);
        logger.info("[Intelligence] Cache Set", { scope });

        return res.json({
            success: true,
            data: result
        });
    } catch (err) { next(err); }
};
