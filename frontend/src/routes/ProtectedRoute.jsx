import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // While auth state is resolving
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen text-gray-500">
                Checking authentication...
            </div>
        );
    }

    // Not authenticated → redirect to login
    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    // Authenticated → allow access
    return <Outlet />;
}
