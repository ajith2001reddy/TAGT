import { Router } from "express";
import auth from "../middleware/auth.js";

import { getKPIs } from "../analytics/kpiCalculator.js";
import { predictOccupancy } from "../analytics/forecastEngine.js";
import { predictMaintenanceCost } from "../analytics/maintenanceForecast.js";
import { predictChurn } from "../analytics/churnEngine.js";
import { optimizeRevenue } from "../analytics/revenueOptimizer.js";
import authorize from "../middleware/authorize.js";
import { generateMonthlyRent } from "../jobs/rentGenerator.js";
import { buildPropertyFilter } from "../utils/tenantScope.js";

const router = Router();

router.post("/debug/generate-rent", async (req, res) => {
    try {
        await generateMonthlyRent();
        res.json({ success: true, message: "Rent generated" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
/* =========================
   KPIs
 ========================= */
router.get("/kpis", auth, async (req, res, next) => {
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

        const kpis = await getKPIs(filters, req.user);
        res.json({ success: true, data: kpis });
    } catch (err) {
        next(err);
    }
});

/* =========================
   OCCUPANCY FORECAST
 ========================= */
router.get("/predict/occupancy", auth, async (req, res, next) => {
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
router.get("/predict/maintenance", auth, async (req, res, next) => {
    try {
        const forecast = await predictMaintenanceCost(req);

        res.json({
            success: true,
            data: forecast
        });
    } catch (err) {
        next(err);
    }
});

/* =========================
   CHURN PREDICTION
 ========================= */
router.get(
    "/predict/churn",
    auth,
    authorize("super_admin", "owner"),
    async (req, res, next) => {
        try {
            const churnData = await predictChurn(req);

            res.json({
                success: true,
                data: churnData
            });
        } catch (err) {
            next(err);
        }
    }
);

/* =========================
   REVENUE OPTIMIZATION
 ========================= */
router.get("/optimize/revenue", auth, authorize("owner", "super_admin"), async (req, res, next) => {
    try {
        const insights = await optimizeRevenue(req);

        res.json({
            success: true,
            data: insights
        });
    } catch (err) {
        next(err);
    }
});

export default router;
