import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    // While auth state is resolving
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen text-gray-500">
                Checking admin access...
            </div>
        );
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
