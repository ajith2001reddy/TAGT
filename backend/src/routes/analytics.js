import { Router } from "express";
import auth, { isAdmin } from "../middleware/auth.js";

import { getKPIs } from "../analytics/kpiCalculator.js";
import { predictOccupancy } from "../analytics/forecastEngine.js";
import { predictMaintenanceCost } from "../analytics/maintenanceForecast.js";
import { predictChurn } from "../analytics/churnEngine.js";
import { optimizeRevenue } from "../analytics/revenueOptimizer.js";

const router = Router();


/* =========================
   KPIs
========================= */
router.get("/kpis", auth, isAdmin, async (req, res, next) => {
    try {
        const { fromDate, toDate } = req.query;
        const filters = {};

        if (fromDate && toDate) {
            const from = new Date(fromDate);
            const to = new Date(toDate);

            if (isNaN(from) || isNaN(to)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid date range"
                });
            }

            filters.fromDate = from;
            filters.toDate = to;
        }

        const kpis = await getKPIs(filters);
        res.json({ success: true, data: kpis });
    } catch (err) {
        next(err);
    }
});

/* =========================
   OCCUPANCY FORECAST
========================= */
router.get("/predict/occupancy", auth, isAdmin, async (req, res, next) => {
    try {
        const months = Math.min(Number(req.query.months) || 6, 12);
        const forecast = await predictOccupancy(months);
        res.json({ success: true, data: forecast });
    } catch (err) {
        next(err);
    }
});

/* =========================
   MAINTENANCE FORECAST
========================= */
router.get("/predict/maintenance", auth, isAdmin, async (req, res, next) => {
    try {
        const months = Math.min(Number(req.query.months) || 6, 12);
        const forecast = await predictMaintenanceCost(months);
        res.json({ success: true, data: forecast });
    } catch (err) {
        next(err);
    }
});

/* =========================
   CHURN PREDICTION
========================= */
router.get("/predict/churn", auth, isAdmin, async (req, res, next) => {
    try {
        const churnData = await predictChurn();
        res.json({ success: true, data: churnData });
    } catch (err) {
        next(err);
    }
});

/* =========================
   REVENUE OPTIMIZATION
========================= */
router.get("/optimize/revenue", auth, isAdmin, async (req, res, next) => {
    try {
        const insights = await optimizeRevenue();
        res.json({ success: true, data: insights });
    } catch (err) {
        next(err);
    }
});

export default router;
