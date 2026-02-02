const express = require("express");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const { getKPIs } = require("../analytics/kpiCalculator");

const router = express.Router();

/* =====================================================
   ADMIN → ANALYTICS DASHBOARD (KPIs)
   - Real-time metrics
   - Optional date filtering
===================================================== */

/**
 * GET /api/analytics/kpis
 * Optional query params:
 *  - fromDate (ISO string)
 *  - toDate   (ISO string)
 *
 * Example:
 * /api/analytics/kpis?fromDate=2025-01-01&toDate=2025-01-31
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

module.exports = router;
