import axios from "axios";

/**
 * MUST include /api
 * Backend routes start with /api/*
 */
const api = axios.create({
    baseURL: "https://tagt.onrender.com",
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
