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

export const updateRequestStatus = async (id, status) => {
    await api.put(`/admin/requests/${id}/status`, { status });
};

/* ================= RESIDENTS ================= */
export const getResidents = async () => {
    const res = await api.get("/admin/residents");
    return res.data;
};
