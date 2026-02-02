const express = require("express");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

const { getKPIs } = require("../analytics/kpiCalculator");
const { predictOccupancy } = require("../analytics/forecastEngine");
const { predictMaintenanceCost } = require("../analytics/maintenanceForecast");
const { predictChurn } = require("../analytics/churnModel");
const { optimizeRevenue } = require("../analytics/revenueOptimizer"); // ✅ STEP 5

const router = express.Router();

/* =====================================================
   ADMIN → ANALYTICS DASHBOARD (KPIs)  [STEP 1]
===================================================== */
router.get("/kpis", auth, isAdmin, async (req, res) => {
    try {
        const { fromDate, toDate } = req.query;
        const filters = {};

        if (fromDate && toDate) {
            filters.fromDate = new Date(fromDate);
            filters.toDate = new Date(toDate);

            if (
                isNaN(filters.fromDate.getTime()) ||
                isNaN(filters.toDate.getTime())
            ) {
                return res.status(400).json({
                    message: "Invalid date range"
                });
            }
        }

        const kpis = await getKPIs(filters);

        res.json({
            success: true,
            data: kpis
        });
    } catch (err) {
        console.error("❌ ANALYTICS KPI ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Failed to load analytics KPIs"
        });
    }
});

/* =====================================================
   ADMIN → OCCUPANCY FORECAST  [STEP 2]
===================================================== */
router.get("/predict/occupancy", auth, isAdmin, async (req, res) => {
    try {
        const months = Math.min(
            Number(req.query.months) || 6,
            12
        );

        const forecast = await predictOccupancy(months);

        res.json({
            success: true,
            data: forecast
        });
    } catch (err) {
        console.error("❌ OCCUPANCY FORECAST ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Failed to generate occupancy forecast"
        });
    }
});

/* =====================================================
   ADMIN → MAINTENANCE COST FORECAST  [STEP 3]
===================================================== */
router.get("/predict/maintenance", auth, isAdmin, async (req, res) => {
    try {
        const months = Math.min(
            Number(req.query.months) || 6,
            12
        );

        const forecast = await predictMaintenanceCost(months);

        res.json({
            success: true,
            data: forecast
        });
    } catch (err) {
        console.error("❌ MAINTENANCE FORECAST ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Failed to generate maintenance cost forecast"
        });
    }
});

/* =====================================================
   ADMIN → RESIDENT CHURN PREDICTION  [STEP 4]
===================================================== */
router.get("/predict/churn", auth, isAdmin, async (req, res) => {
    try {
        const churnData = await predictChurn();

        res.json({
            success: true,
            data: churnData
        });
    } catch (err) {
        console.error("❌ CHURN PREDICTION ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Failed to generate churn prediction"
        });
    }
});

/* =====================================================
   ADMIN → REVENUE OPTIMIZATION  [STEP 5]
===================================================== */
router.get(
    "/optimize/revenue",
    auth,
    isAdmin,
    async (req, res) => {
        try {
            const insights = await optimizeRevenue();

            res.json({
                success: true,
                data: insights
            });
        } catch (err) {
            console.error("❌ REVENUE OPTIMIZATION ERROR:", err);
            res.status(500).json({
                success: false,
                message: "Failed to generate revenue optimization insights"
            });
        }
    }
);

module.exports = router;
