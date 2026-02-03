import axios from "axios";

/**
 * Backend API Configuration
 * - Production-safe fallback
 * - Normalized error handling
 * - JWT auto-injection
 */

const API_URL =
    process.env.REACT_APP_API_URL || "https://api.tagt.website/api";

const api = axios.create({
    baseURL: API_URL.replace(/\/$/, ""),
    timeout: 15000,
    headers: {
        "Content-Type": "application/json"
    }
});

// Attach JWT token automatically
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token && typeof token === "string") {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Global response handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
        }

        return Promise.reject({
            status: error.response?.status,
            message:
                error.response?.data?.message ||
                error.message ||
                "Request failed"
        });
    }
);

export default api;
