import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    // Wait for auth to resolve
    if (loading) {
        return null;
    }

    // Not logged in → login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Logged in but not admin → resident dashboard
    if (!isAdmin) {
        return <Navigate to="/resident/dashboard" replace />;
    }

    // Admin → allow access
    return <Outlet />;
}
