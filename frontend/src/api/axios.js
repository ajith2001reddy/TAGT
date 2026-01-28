import axios from "axios";

/**
 * Backend API Configuration
 * - Uses environment variable for flexibility (local dev vs production)
 * - Automatically attaches JWT token to requests
 * - Handles common errors globally
 */

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "https://tagt.onrender.com/api",
    headers: {
        "Content-Type": "application/json"
    }
});

// Request interceptor - attaches auth token
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

// Response interceptor - handle common errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized (expired/invalid token)
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.href = "/";
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
            console.error("Access denied");
        }

        return Promise.reject(error);
    }
);

export default api;