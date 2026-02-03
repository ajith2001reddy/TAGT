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

    try {
        const res = await api.get("/analytics/kpis", { params });
        return res.data?.data;
    } catch (err) {
        console.error("Error fetching KPIs:", err);
        throw new Error("Failed to fetch KPIs");
    }
};

/* =======================
   OCCUPANCY FORECAST (STEP 2)
======================= */

/**
 * Predict occupancy for next N months
 */
export const predictOccupancy = async (months = 6) => {
    try {
        const res = await api.get("/analytics/predict/occupancy", {
            params: { months }
        });
        return res.data?.data;
    } catch (err) {
        console.error("Error predicting occupancy:", err);
        throw new Error("Failed to predict occupancy");
    }
};

/* =======================
   MAINTENANCE COST FORECAST (STEP 3)
======================= */

/**
 * Predict maintenance costs for next N months
 */
export const predictMaintenanceCost = async (months = 6) => {
    try {
        const res = await api.get("/analytics/predict/maintenance", {
            params: { months }
        });
        return res.data?.data;
    } catch (err) {
        console.error("Error predicting maintenance cost:", err);
        throw new Error("Failed to predict maintenance cost");
    }
};

/* =======================
   CHURN PREDICTION (STEP 4)
======================= */

/**
 * Predict resident churn risk
 */
export const predictChurn = async () => {
    try {
        const res = await api.get("/analytics/predict/churn");
        return res.data?.data;
    } catch (err) {
        console.error("Error predicting churn:", err);
        throw new Error("Failed to predict churn");
    }
};

/* =======================
   REVENUE OPTIMIZATION (STEP 5)
======================= */

/**
 * Get AI revenue optimization insights
 */
export const optimizeRevenue = async () => {
    try {
        const res = await api.get("/analytics/optimize/revenue");
        return res.data?.data;
    } catch (err) {
        console.error("Error optimizing revenue:", err);
        throw new Error("Failed to optimize revenue");
    }
};
