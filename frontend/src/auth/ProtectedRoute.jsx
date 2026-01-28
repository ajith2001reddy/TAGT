import { Navigate, Outlet } from "react-router-dom";

/**
 * PROTECTED ROUTE
 * - Checks login
 * - Optionally checks role
 * - Does NOT blindly trust localStorage role
 */
export default function ProtectedRoute({ role }) {
    const token = localStorage.getItem("token");

    // Not logged in
    if (!token) {
        return <Navigate to="/" replace />;
    }

    // Decode role safely (optional but recommended)
    let userRole = null;

    try {
        const payload = JSON.parse(
            atob(token.split(".")[1])
        );
        userRole = payload.role;
    } catch {
        // corrupted token
        return <Navigate to="/" replace />;
    }

    // Role mismatch
    if (role && userRole !== role) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
