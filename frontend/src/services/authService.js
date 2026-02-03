import api from "../api/axios";

// Auth service to handle authentication tasks

/* =================== LOGIN =================== */
/**
 * Login a user with their credentials.
 * Stores the token and user role in localStorage.
 */
export const login = async (email, password) => {
    try {
        const res = await api.post("/auth/login", { email, password });
        const { token, role, user } = res.data;

        // Save token and user info in localStorage (or sessionStorage)
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("user", JSON.stringify(user));

        return user;
    } catch (err) {
        console.error("Login failed:", err);
        throw new Error("Login failed, please try again.");
    }
};

/* =================== REGISTER =================== */
/**
 * Register a new user.
 * Creates a new user and logs them in by storing their token.
 */
export const register = async (email, password, role) => {
    try {
        const res = await api.post("/auth/register", { email, password, role });
        const { token, user } = res.data;

        // Save token and user info in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("user", JSON.stringify(user));

        return user;
    } catch (err) {
        console.error("Registration failed:", err);
        throw new Error("Registration failed, please try again.");
    }
};

/* =================== LOGOUT =================== */
/**
 * Logs out the user by clearing their session data.
 */
export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    // Redirect user to login page (if necessary)
    window.location.href = "/login";
};

/* =================== GET CURRENT USER =================== */
/**
 * Get the current authenticated user from localStorage.
 */
export const getCurrentUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};

/* =================== IS AUTHENTICATED =================== */
/**
 * Check if the user is authenticated by verifying if a token exists.
 */
export const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    return !!token; // Return true if the token exists
};

/* =================== VALIDATE TOKEN =================== */
/**
 * Validates the token by sending a request to check its validity.
 * Example implementation if you have a backend to verify the token.
 */
export const validateToken = async () => {
    try {
        const res = await api.get("/auth/validate-token");
        return res.data.isValid;
    } catch (err) {
        console.error("Token validation failed:", err);
        return false;
    }
};

/* =================== GET TOKEN =================== */
/**
 * Get the stored token from localStorage.
 */
export const getToken = () => {
    return localStorage.getItem("token");
};
