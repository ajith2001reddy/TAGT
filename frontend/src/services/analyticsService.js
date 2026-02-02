import api from "../api/axios";

/* =====================================================
   ANALYTICS SERVICE (ADVANCED)
   - Real-time KPIs
   - Predictive analytics
   - AI-ready
===================================================== */

/* =======================
   REAL-TIME KPIs (STEP 1)
======================= */

/**
 * Fetch real-time KPIs
 * Optional filters:
 *  - fromDate (ISO)
 *  - toDate   (ISO)
 */
export const getKPIs = async ({ fromDate, toDate } = {}) => {
    const params = {};

    if (fromDate && toDate) {
        params.fromDate = fromDate;
        params.toDate = toDate;
    }

    const res = await api.get("/analytics/kpis", { params });
    return res.data?.data;
};

/* =======================
   OCCUPANCY FORECAST (STEP 2)
======================= */

/**
 * Predict occupancy for next N months
 */
export const predictOccupancy = async (months = 6) => {
    const res = await api.get("/analytics/predict/occupancy", {
        params: { months }
    });

    return res.data?.data;
};

/* =======================
   MAINTENANCE COST FORECAST (STEP 3)
======================= */

/**
 * Predict maintenance costs for next N months
 */
export const predictMaintenanceCost = async (months = 6) => {
    const res = await api.get("/analytics/predict/maintenance", {
        params: { months }
    });

    return res.data?.data;
};

/* =======================
   CHURN PREDICTION (STEP 4)
======================= */

/**
 * Predict resident churn risk
 */
export const predictChurn = async () => {
    const res = await api.get("/analytics/predict/churn");
    return res.data?.data;
};

/* =======================
   REVENUE OPTIMIZATION (STEP 5)
======================= */

/**
 * Get AI revenue optimization insights
 */
export const optimizeRevenue = async () => {
    const res = await api.get("/analytics/optimize/revenue");
    return res.data?.data;
};
