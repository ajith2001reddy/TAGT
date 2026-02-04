import { createContext, useContext, useEffect, useState } from "react";

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

    // 🔄 Initialize auth state from JWT once
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

    // ✅ Called AFTER successful login
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
                isAuthenticated: Boolean(user),
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
