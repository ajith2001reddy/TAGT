import api from "../api/axios";

export const getAdminStats = async () => {
    const res = await api.get("/api/admin/stats");
    return res.data;
};

export const getRequests = async () => {
    const res = await api.get("/api/admin/requests");
    return res.data;
};

export const updateRequestStatus = async (id, status) => {
    await api.put(`/api/admin/requests/${id}/status`, { status });
};
export const getResidents = async () => {
    const res = await api.get("/api/admin/residents");
    return res.data;
};

export const addResident = async (data) => {
    const res = await api.post("/api/admin/add-resident", data);
    return res.data;
};
