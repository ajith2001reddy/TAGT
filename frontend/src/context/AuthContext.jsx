import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

// Decode JWT safely (base64url compatible)
function decodeToken(token) {
    try {
        const payloadBase64 = token.split(".")[1];
        if (!payloadBase64) return null;

        const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(base64));

        // Expiry check
        if (payload.exp && Date.now() >= payload.exp * 1000) {
            return null;
        }

        return payload;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore auth state on app load
    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setLoading(false);
            return;
        }

        const decoded = decodeToken(token);

        if (!decoded) {
            localStorage.removeItem("token");
            setUser(null);
        } else {
            setUser(decoded);
        }

        setLoading(false);
    }, []);

    // Login: store token + set user
    const login = (token) => {
        const decoded = decodeToken(token);

        if (!decoded) {
            localStorage.removeItem("token");
            setUser(null);
            return false;
        }

        localStorage.setItem("token", token);
        setUser(decoded);
        return true;
    };

    // Logout: clear auth state
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    const value = {
        user,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === "admin",
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
}
