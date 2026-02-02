const express = require("express");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

const { getKPIs } = require("../analytics/kpiCalculator");
const { predictOccupancy } = require("../analytics/forecastEngine");

const router = express.Router();

/* =====================================================
   ADMIN → ANALYTICS DASHBOARD (KPIs)
===================================================== */

/**
 * GET /api/analytics/kpis
 * Optional query params:
 *  - fromDate (ISO string)
 *  - toDate   (ISO string)
 */
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
                return res
                    .status(400)
                    .json({ message: "Invalid date range" });
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
   ADMIN → OCCUPANCY FORECAST (STEP 2)
===================================================== */

/**
 * GET /api/analytics/predict/occupancy
 * Query params:
 *  - months (optional, default = 6)
 *
 * Example:
 * /api/analytics/predict/occupancy?months=3
 */
router.get(
    "/predict/occupancy",
    auth,
    isAdmin,
    async (req, res) => {
        try {
            const months = Math.min(
                Number(req.query.months) || 6,
                12 // hard limit for safety
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
    }
);

module.exports = router;
