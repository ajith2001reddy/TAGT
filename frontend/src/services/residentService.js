import api from "../api/axios";

export const createRequest = async (message) => {
    await api.post("/resident/request", { message });
};

export const getMyRequests = async () => {
    const res = await api.get("/resident/requests");
    return res.data;
};
