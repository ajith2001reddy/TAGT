import api from "../api/axios";

export const createRequest = async (message) => {
    await api.post("/api/resident/request", { message });
};

export const getMyRequests = async () => {
    const res = await api.get("/api/resident/requests");
    return res.data;
};
