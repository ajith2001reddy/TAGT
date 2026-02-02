import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ResidentDashboard from "./pages/ResidentDashboard";
import AdminResidents from "./pages/AdminResidents";
import AdminRequests from "./pages/AdminRequests";
import RequestHistory from "./pages/RequestHistory";
import Payments from "./pages/Payments";
import ResidentPayments from "./pages/ResidentPayments";
import Rooms from "./pages/Rooms";

import ProtectedRoute from "./routes/ProtectedRoute";
import ToastProvider from "./components/ToastProvider";

function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* PUBLIC */}
                <Route path="/login" element={<Login />} />

                {/* ADMIN */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute role="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/requests"
                    element={
                        <ProtectedRoute role="admin">
                            <AdminRequests />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/history"
                    element={
                        <ProtectedRoute role="admin">
                            <RequestHistory />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/residents"
                    element={
                        <ProtectedRoute role="admin">
                            <AdminResidents />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/rooms"
                    element={
                        <ProtectedRoute role="admin">
                            <Rooms />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/payments"
                    element={
                        <ProtectedRoute role="admin">
                            <Payments />
                        </ProtectedRoute>
                    }
                />
                {/* ADMIN ROOT REDIRECT */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute role="admin">
                            <Navigate to="/admin/dashboard" replace />
                        </ProtectedRoute>
                    }
                />

                {/* RESIDENT ROOT REDIRECT */}
                <Route
                    path="/resident"
                    element={
                        <ProtectedRoute role="resident">
                            <Navigate to="/resident/dashboard" replace />
                        </ProtectedRoute>
                    }
                />


                {/* RESIDENT */}
                <Route
                    path="/resident/dashboard"
                    element={
                        <ProtectedRoute role="resident">
                            <ResidentDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/resident/payments"
                    element={
                        <ProtectedRoute role="resident">
                            <ResidentPayments />
                        </ProtectedRoute>
                    }
                />

                {/* DEFAULT */}
                <Route path="/" element={<Navigate to="/login" replace />} />
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
