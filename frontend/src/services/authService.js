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

        // Backend response example:
        // {
        //   token: "jwt"
        // }

        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Register user (optional)
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
 * Get current logged-in user (optional)
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
 * NOTE: AuthContext handles state + redirect
 */
export const logout = async () => {
    return Promise.resolve();
};
