import api from "../api/axios";

/**
 * Resident Service
 * Phase 4 – Extended safely
 *
 * - Existing methods unchanged
 * - Supports workflow status & admin notes
 */

/* ================= CREATE REQUEST ================= */
export const createRequest = async (message) => {
    await api.post("/resident/request", { message });
};

/* ================= GET MY REQUESTS ================= */
export const getMyRequests = async () => {
    const res = await api.get("/resident/requests");

    // Normalize data for UI safety
    return Array.isArray(res.data)
        ? res.data.map((r) => ({
            _id: r._id,
            message: r.message,
            status: r.status,
            workflowStatus: r.workflowStatus || null,
            adminNotes: r.adminNotes || [],
            createdAt: r.createdAt
        }))
        : [];
};

/* ================= DELETE REQUEST ================= */
export const deleteRequest = async (id) => {
    await api.delete(`/resident/request/${id}`);
};
