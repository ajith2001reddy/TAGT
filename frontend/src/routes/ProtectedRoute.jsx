import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Prevent flicker / redirect loops
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400">
                Loading...
            </div>
        );
    }

    // Not authenticated → login
    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    // Role mismatch → redirect to the appropriate route based on the user's role
    if (role && user.role !== role) {
        return (
            <Navigate
                to={user.role === "admin" ? "/admin" : "/resident"}
                replace
            />
        );
    }

    // Return children if all checks pass
    return children;
}
