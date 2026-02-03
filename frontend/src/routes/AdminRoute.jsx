import { Navigate } from "react-router-dom";

/**
 * AdminRoute
 * Phase 4 – Route Protection
 *
 * - Allows access ONLY if user role === "admin"
 * - Redirects others to login or resident dashboard
 */

export default function AdminRoute({ children }) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Not logged in
    if (!token) {
        return <Navigate to="/" replace />;
    }

    // Logged in but not admin or role is missing/invalid
    if (role !== "admin") {
        return <Navigate to="/resident" replace />;
    }

    // Admin allowed
    return children;
}
