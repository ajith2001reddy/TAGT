import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ResidentDashboard from "./pages/ResidentDashboard";
import ProtectedRoute from "./auth/ProtectedRoute";
import ToastProvider from "./components/ToastProvider";

function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Login />} />

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute role="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/resident"
                    element={
                        <ProtectedRoute role="resident">
                            <ResidentDashboard />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </AnimatePresence>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <ToastProvider />
            <AnimatedRoutes />
        </BrowserRouter>
    );
}
