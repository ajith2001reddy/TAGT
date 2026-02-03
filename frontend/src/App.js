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
import AdminRooms from "./pages/AdminRooms";

import ProtectedRoute from "./routes/ProtectedRoute";
import ToastProvider from "./components/ToastProvider";

function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* PUBLIC */}
                <Route path="/login" element={<Login />} />

                {/* ================= ADMIN ROUTES ================= */}
                <Route element={<ProtectedRoute adminOnly />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/requests" element={<AdminRequests />} />
                    <Route path="/admin/history" element={<RequestHistory />} />
                    <Route path="/admin/residents" element={<AdminResidents />} />
                    <Route path="/admin/rooms" element={<AdminRooms />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                </Route>

                {/* ================= RESIDENT ROUTES ================= */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/resident/dashboard" element={<ResidentDashboard />} />
                    <Route path="/resident/payments" element={<ResidentPayments />} />
                    <Route path="/resident" element={<Navigate to="/resident/dashboard" replace />} />
                </Route>

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
