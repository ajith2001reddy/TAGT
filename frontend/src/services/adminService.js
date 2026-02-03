import api from "../api/axios";

/* ================= DASHBOARD STATS ================= */
export const getAdminStats = async () => {
    try {
        const res = await api.get("/admin/stats");
        return res.data;
    } catch (err) {
        console.error("Error fetching admin stats:", err);
        throw new Error("Failed to fetch admin stats");
    }
};

/* ================= REQUESTS ================= */
export const getAllRequests = async () => {
    try {
        const res = await api.get("/admin/requests");
        return res.data;
    } catch (err) {
        console.error("Error fetching all requests:", err);
        throw new Error("Failed to fetch all requests");
    }
};

/* alias so AdminDashboard.jsx works */
export const getRequests = getAllRequests;

/* ==================================================
   LEGACY STATUS UPDATE (UNCHANGED)
   - Used by existing UI
   - No admin note required
================================================== */
export const updateRequestStatus = async (id, status) => {
    try {
        await api.put(`/admin/requests/${id}/status`, { status });
    } catch (err) {
        console.error(`Error updating status for request ${id}:`, err);
        throw new Error("Failed to update request status");
    }
};

/* ==================================================
   PHASE 1 – ADVANCED WORKFLOW STATUS UPDATE (NEW)
   - Enforced status flow
   - Mandatory admin note
   - Uses NEW backend endpoint
================================================== */
export const updateRequestWorkflowStatus = async (id, workflowStatus, note) => {
    try {
        await api.put(`/admin/requests/${id}/workflow-status`, {
            workflowStatus,
            note
        });
    } catch (err) {
        console.error(`Error updating workflow status for request ${id}:`, err);
        throw new Error("Failed to update workflow status");
    }
};

/* ================= RESIDENTS ================= */
export const getResidents = async () => {
    try {
        const res = await api.get("/admin/residents");
        return res.data;
    } catch (err) {
        console.error("Error fetching residents:", err);
        throw new Error("Failed to fetch residents");
    }
};
