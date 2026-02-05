import {
    Routes,
    Route,
    Navigate,
    useLocation,
} from "react-router-dom";
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
import AdminRoute from "./routes/AdminRoute";
import ToastProvider from "./components/ToastProvider";

function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* ================= PUBLIC ================= */}
                <Route path="/login" element={<Login />} />

                {/* ================= ADMIN ================= */}
                <Route element={<AdminRoute />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/requests" element={<AdminRequests />} />
                    <Route path="/admin/history" element={<RequestHistory />} />
                    <Route path="/admin/residents" element={<AdminResidents />} />
                    <Route path="/admin/rooms" element={<AdminRooms />} />
                    <Route path="/admin/payments" element={<Payments />} />
                    <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                </Route>

                {/* ================= RESIDENT ================= */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/resident/dashboard" element={<ResidentDashboard />} />
                    <Route path="/resident/payments" element={<ResidentPayments />} />
                    <Route path="/resident" element={<Navigate to="/resident/dashboard" replace />} />
                </Route>

                {/* ================= FALLBACK ================= */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </AnimatePresence>
    );
}

export default function App() {
    return (
        <>
            <ToastProvider />
            <AnimatedRoutes />
        </>
    );
}
