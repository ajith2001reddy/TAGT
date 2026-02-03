import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute
 *
 * Usage:
 * - Protects routes from unauthenticated access
 * - Optionally restricts admin-only routes
 *
 * Props:
 * - adminOnly (boolean)
 */
export default function ProtectedRoute({ adminOnly = false }) {
    const { user, isAuthenticated, isAdmin, loading } = useAuth();

    // Still checking auth state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-gray-400">
                Loading...
            </div>
        );
    }

    // Not logged in → go to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Logged in but not admin → block admin routes
    if (adminOnly && !isAdmin) {
        return <Navigate to="/resident/dashboard" replace />;
    }

    // All good → render nested route
    return <Outlet />;
}
