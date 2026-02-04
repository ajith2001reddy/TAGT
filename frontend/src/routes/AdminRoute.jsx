import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * AdminRoute
 * - Allows access ONLY if user role === "admin"
 * - Relies on AuthContext (single source of truth)
 */
export default function AdminRoute() {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    // ⏳ Wait until auth state is ready
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400">
                Loading...
            </div>
        );
    }

    // 🔒 Not logged in
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 🛑 Logged in but not admin
    if (!isAdmin) {
        return <Navigate to="/login" replace />;
    }

    // ✅ Admin access granted
    return <Outlet />;
}
