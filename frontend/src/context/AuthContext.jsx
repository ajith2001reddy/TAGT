import { createContext, useContext, useEffect, useState } from "react";

/**
 * Auth Context
 * - Stores token & role
 * - Persists login across refresh
 * - Used across entire app
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load auth state on app start
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedRole = localStorage.getItem("role");

        if (storedToken && storedRole) {
            setToken(storedToken);
            setRole(storedRole);
        }

        setLoading(false);
    }, []);

    // Login handler
    const login = (token, role) => {
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);

        setToken(token);
        setRole(role);
    };

    // Logout handler
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");

        setToken(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                role,
                isAuthenticated: !!token,
                isAdmin: role === "admin",
                login,
                logout,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Hook for easy usage
export const useAuth = () => {
    return useContext(AuthContext);
};
