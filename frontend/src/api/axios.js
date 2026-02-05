import axios from "axios";

// ✅ CRA-compatible env variable
const RAW_API_URL =
    process.env.REACT_APP_API_URL || "https://api.tagt.website/api";

// Normalize (remove trailing slash)
const API_URL = RAW_API_URL.replace(/\/$/, "");

const api = axios.create({
    baseURL: API_URL,
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
        const status = error?.response?.status;
        const requestUrl = error?.config?.url || "";
        const hadToken = !!localStorage.getItem("token");

        // Avoid redirect loops & allow login failure handling
        const isAuthRoute = requestUrl.includes("/auth");

        if (status === 401 && hadToken && !isAuthRoute) {
            localStorage.removeItem("token");
            localStorage.removeItem("user"); // safety
            window.location.replace("/login");
        }

        return Promise.reject(error);
    }
);

export default api;
