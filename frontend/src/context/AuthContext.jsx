import { createContext, useContext, useEffect, useState } from "react";

/**
 * Auth Context (SAFE VERSION)
 * - JWT is the single source of truth
 * - No localStorage.role
 * - Prevents infinite redirects
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load auth state once on app start
    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            setUser({
                id: payload.id,
                role: payload.role
            });
        } catch (err) {
            localStorage.removeItem("token");
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = (token) => {
        localStorage.setItem("token", token);

        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({
            id: payload.id,
            role: payload.role
        });
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isAdmin: user?.role === "admin",
                loading,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
