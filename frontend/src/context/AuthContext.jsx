import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

// Decode JWT safely
function decodeToken(token) {
    try {
        const payloadBase64 = token.split(".")[1];
        if (!payloadBase64) return null;

        const base64 = payloadBase64
            .replace(/-/g, "+")
            .replace(/_/g, "/")
            .padEnd(payloadBase64.length + (4 - (payloadBase64.length % 4)) % 4, "=");

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

    // Restore auth on app start
    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setLoading(false);
            return;
        }

        const decoded = decodeToken(token);

        if (!decoded) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
        } else {
            // ✅ Ensure role exists
            const safeUser = {
                ...decoded,
                role: decoded.role || "resident",
            };

            setUser(safeUser);
            localStorage.setItem("user", JSON.stringify(safeUser));
        }

        setLoading(false);
    }, []);

    // Login handler
    const login = (token) => {
        const decoded = decodeToken(token);

        if (!decoded) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
            return false;
        }

        const safeUser = {
            ...decoded,
            role: decoded.role || "resident",
        };

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(safeUser));
        setUser(safeUser);

        return true;
    };

    // Logout handler
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);

        // ✅ force redirect to login page
        window.location.href = "/login";
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
}
