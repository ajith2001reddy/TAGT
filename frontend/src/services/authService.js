import api from "../api/axios";

/**
 * Login user
 * @param {Object} credentials
 * @param {string} credentials.email
 * @param {string} credentials.password
 */
export const login = async ({ email, password }) => {
    try {
        const response = await api.post("/auth/login", {
            email,
            password,
        });

        // Expected backend response:
        // {
        //   token: "jwt",
        //   user: { id, email, role, ... }
        // }

        if (response.data?.token) {
            localStorage.setItem("token", response.data.token);
        }

        return response.data;
    } catch (error) {
        // Error already normalized by axios interceptor
        throw error;
    }
};

/**
 * Register user (optional, if you have signup)
 */
export const register = async (data) => {
    try {
        const response = await api.post("/auth/register", data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get current logged-in user
 */
export const getCurrentUser = async () => {
    try {
        const response = await api.get("/auth/me");
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Logout user
 */
export const logout = () => {
    localStorage.removeItem("token");
};
