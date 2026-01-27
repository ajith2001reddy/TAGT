import api from "../api/axios";

export const getAllRequests = async () => {
    const res = await api.get("/api/admin/requests");
    return res.data;
};

export const updateRequestStatus = async (id, status) => {
    await api.put(`/api/admin/requests/${id}/status`, { status });
};
