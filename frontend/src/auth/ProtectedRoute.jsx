import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    // not logged in
    if (!token) {
        return <Navigate to="/" />;
    }

    // role mismatch
    if (role && userRole !== role) {
        return <Navigate to="/" />;
    }

    return children;
}
