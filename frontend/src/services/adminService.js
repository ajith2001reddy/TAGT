import api from "../api/axios";

/* ================= DASHBOARD STATS ================= */
export const getAdminStats = async () => {
    const res = await api.get("/admin/stats");
    return res.data;
};

/* ================= REQUESTS ================= */
export const getAllRequests = async () => {
    const res = await api.get("/admin/requests");
    return res.data;
};

/* alias so AdminDashboard.jsx works */
export const getRequests = getAllRequests;

/* ==================================================
   LEGACY STATUS UPDATE (UNCHANGED)
   - Used by existing UI
   - No admin note required
================================================== */
export const updateRequestStatus = async (id, status) => {
    await api.put(`/admin/requests/${id}/status`, { status });
};

/* ==================================================
   PHASE 1 – ADVANCED WORKFLOW STATUS UPDATE (NEW)
   - Enforced status flow
   - Mandatory admin note
   - Uses NEW backend endpoint
================================================== */
export const updateRequestWorkflowStatus = async (
    id,
    workflowStatus,
    note
) => {
    await api.put(`/admin/requests/${id}/workflow-status`, {
        workflowStatus,
        note
    });
};

/* ================= RESIDENTS ================= */
export const getResidents = async () => {
    const res = await api.get("/admin/residents");
    return res.data;
};
