import axios from "axios";

// ✅ CRA-compatible env variable
const API_URL =
    process.env.REACT_APP_API_URL || "https://api.tagt.website/api";

const api = axios.create({
    baseURL: API_URL.replace(/\/$/, ""),
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

// 🔑 Attach JWT token
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

// 🚫 Handle auth expiration safely
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url;
        const hadToken = Boolean(localStorage.getItem("token"));

        // Only redirect if token existed (session expired)
        if (
            status === 401 &&
            hadToken &&
            !url?.includes("/auth/login")
        ) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        return Promise.reject({
            status,
            message:
                error.response?.data?.message ||
                error.message ||
                "Request failed",
        });
    }
);

export default api;
