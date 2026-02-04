import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ adminOnly = false }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    // ⏳ Prevent flicker while auth state is loading
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400">
                Loading...
            </div>
        );
    }

    // 🔒 Not authenticated → login
    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    // 🛑 Admin-only route but user is not admin
    if (adminOnly && user.role !== "admin") {
        return (
            <Navigate
                to="/resident/dashboard"
                replace
            />
        );
    }

    // ✅ Auth OK → render nested routes
    return <Outlet />;
}
