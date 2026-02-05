import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ResidentRoute
 * - Allows access ONLY to authenticated residents
 * - Redirects admin → admin dashboard
 * - Redirects unauthenticated → login
 */

export default function ResidentRoute() {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    // While auth state is resolving
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen text-gray-500">
                Checking resident access...
            </div>
        );
    }

    // Not logged in → login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Logged in but admin → admin dashboard
    if (isAdmin) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    // Resident → allow access
    return <Outlet />;
}
