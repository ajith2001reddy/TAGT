import axios from "axios";

/**
 * Backend API Configuration (PRODUCTION SAFE)
 * - Uses environment variable ONLY
 * - No hardcoded URLs
 * - Attaches JWT automatically
 */

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL.replace(/\/$/, ""),
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true
});

// Attach JWT token
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

// Global auth handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

export default api;
