import { createContext, useContext, useEffect, useState } from "react";

/**
 * Auth Context
 * - JWT is the single source of truth
 * - No role stored separately
 * - Safe against malformed tokens
 */

const AuthContext = createContext(null);

function decodeToken(token) {
    try {
        const base64 = token.split(".")[1];
        if (!base64) return null;

        const payload = JSON.parse(atob(base64));
        return {
            id: payload.id,
            role: payload.role
        };
    } catch {
        return null;
    }
}

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

        const decoded = decodeToken(token);

        if (decoded) {
            setUser(decoded);
        } else {
            localStorage.removeItem("token");
            setUser(null);
        }

        setLoading(false);
    }, []);

    const login = (token) => {
        const decoded = decodeToken(token);

        if (!decoded) {
            localStorage.removeItem("token");
            setUser(null);
            return;
        }

        localStorage.setItem("token", token);
        setUser(decoded);
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
