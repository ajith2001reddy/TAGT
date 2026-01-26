import api from "../api/axios";

export const raiseRequest = (message) =>
    api.post("/api/resident/request", { message });

export const getPayments = (id) =>
    api.get(`/api/resident/payments/${id}`);
