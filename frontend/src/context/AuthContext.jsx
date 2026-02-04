import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

// ✅ Safe JWT decode (base64url compatible)
function decodeToken(token) {
    try {
        const payloadBase64 = token.split(".")[1];
        if (!payloadBase64) return null;

        const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(base64));

        // ⏰ Optional: token expiry check
        if (payload.exp && Date.now() >= payload.exp * 1000) {
            return null;
        }

        return payload;
    } catch (err) {
        console.error("Token decode failed:", err);
        return null;
    }
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🔄 Restore auth state on app load
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

    // ✅ Call this after successful login
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
        window.location.href = "/login";
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

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
};
