import { Navigate } from "react-router-dom";

/**
 * ResidentRoute
 * Phase 4 – Route Protection
 *
 * - Allows access ONLY if user role === "resident"
 * - Redirects others appropriately
 */

export default function ResidentRoute({ children }) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Not logged in
    if (!token) {
        return <Navigate to="/" replace />;
    }

    // Logged in but not resident
    if (role !== "resident") {
        return <Navigate to="/admin" replace />;
    }

    // Resident allowed
    return children;
}
