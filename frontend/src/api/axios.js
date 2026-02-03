import axios from "axios";

const API_URL =
    import.meta.env.VITE_API_URL || "https://api.tagt.website/api";

const api = axios.create({
    baseURL: API_URL.replace(/\/$/, ""),
    timeout: 15000,
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

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
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
