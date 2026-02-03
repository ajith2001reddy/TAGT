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
    try {
        await api.post("/resident/request", { message });
    } catch (err) {
        console.error("Error creating request:", err);
        throw new Error("Failed to create request");
    }
};

/* ================= GET MY REQUESTS ================= */
export const getMyRequests = async () => {
    try {
        const res = await api.get("/resident/requests");

        // Normalize data for UI safety
        if (Array.isArray(res.data)) {
            return res.data.map((r) => ({
                _id: r._id,
                message: r.message,
                status: r.status,
                workflowStatus: r.workflowStatus || null,
                adminNotes: r.adminNotes || [],
                createdAt: r.createdAt
            }));
        } else {
            console.warn("Received data is not an array, returning empty array.");
            return [];
        }
    } catch (err) {
        console.error("Error fetching resident requests:", err);
        throw new Error("Failed to fetch requests");
    }
};

/* ================= DELETE REQUEST ================= */
export const deleteRequest = async (id) => {
    try {
        await api.delete(`/resident/request/${id}`);
    } catch (err) {
        console.error(`Error deleting request ${id}:`, err);
        throw new Error("Failed to delete request");
    }
};
