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
import DashboardLayout from "./layouts/DashboardLayout";
import ToastProvider from "./components/ToastProvider";

function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* PUBLIC */}
                <Route path="/login" element={<Login />} />

                {/* ADMIN */}
                <Route path="/admin" element={<AdminRoute />}>
                    <Route element={<DashboardLayout />}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="requests" element={<AdminRequests />} />
                        <Route path="history" element={<RequestHistory />} />
                        <Route path="residents" element={<AdminResidents />} />
                        <Route path="rooms" element={<AdminRooms />} />
                        <Route path="payments" element={<Payments />} />
                    </Route>
                </Route>

                {/* RESIDENT */}
                <Route path="/resident" element={<ProtectedRoute />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<ResidentDashboard />} />
                    <Route path="payments" element={<ResidentPayments />} />
                </Route>

                {/* FALLBACK */}
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
