import axios from "axios";

/**
 * Backend API Configuration
 * - Uses environment variable for flexibility
 * - Defaults to Render backend
 * - Automatically attaches JWT token
 */

const api = axios.create({
    baseURL:
        process.env.REACT_APP_API_URL?.replace(/\/$/, "") ||
        "https://tagt.onrender.com/api",
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true
});

// Request interceptor - attach auth token
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

// Response interceptor - global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.href = "/";
        }

        if (error.response?.status === 403) {
            console.error("Access denied");
        }

        return Promise.reject(error);
    }
);

export default api;
