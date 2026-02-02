import api from "../api/axios";

/* =====================================================
   ANALYTICS SERVICE
   - Central place for dashboard analytics
   - Future AI endpoints ready
===================================================== */

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

/* =====================================================
   FUTURE AI ENDPOINTS (PLACEHOLDERS)
===================================================== */

// Predict occupancy (3–6 months)
export const predictOccupancy = async () => {
    const res = await api.get("/analytics/predict/occupancy");
    return res.data?.data;
};

// Predict maintenance cost trends
export const predictMaintenanceCost = async () => {
    const res = await api.get("/analytics/predict/maintenance");
    return res.data?.data;
};

// Predict resident churn
export const predictChurn = async () => {
    const res = await api.get("/analytics/predict/churn");
    return res.data?.data;
};
