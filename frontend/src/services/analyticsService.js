import api from "../api/axios";

/* =====================================================
   ANALYTICS SERVICE (ADVANCED)
   - Real-time KPIs
   - Predictive analytics
   - AI-ready
===================================================== */

/* =======================
   REAL-TIME KPIs
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
 * @param {number} months (default: 6)
 */
export const predictOccupancy = async (months = 6) => {
    const res = await api.get("/analytics/predict/occupancy", {
        params: { months }
    });

    return res.data?.data;
};

/* =======================
   FUTURE AI MODULES
======================= */

// Predict maintenance cost trends (STEP 3)
export const predictMaintenanceCost = async () => {
    const res = await api.get("/analytics/predict/maintenance");
    return res.data?.data;
};

// Predict resident churn (STEP 4)
export const predictChurn = async () => {
    const res = await api.get("/analytics/predict/churn");
    return res.data?.data;
};
