import axios from "axios";
import { auth } from "./firebase";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(async (config) => {
    const user = auth.currentUser;

    if (user) {
        try {
            const token = await user.getIdToken();
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        } catch (error) {
            console.error("Error fetching auth token:", error);
        }
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});