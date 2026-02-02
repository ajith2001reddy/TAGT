import axios from "axios";

/**
 * Backend API Configuration
 * - Explicit production-safe fallback
 * - Prevents undefined baseURL
 * - Always targets /api
 */

const API_URL =
    process.env.REACT_APP_API_URL || "https://api.tagt.website/api";

const api = axios.create({
    baseURL: API_URL.replace(/\/$/, ""),
    headers: {
        "Content-Type": "application/json"
    }
});

// Attach JWT token automatically
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

// Global auth handling (SAFE)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Only clear token
            localStorage.removeItem("token");
            // DO NOT navigate here
            // DO NOT manage role here
        }
        return Promise.reject(error);
    }
);

export default api;
