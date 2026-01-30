import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ResidentDashboard from "./pages/ResidentDashboard";
import AdminResidents from "./pages/AdminResidents";
import AdminRequests from "./pages/AdminRequests";
import RequestHistory from "./pages/RequestHistory"; // ✅ ADD THIS
import Payments from "./pages/Payments";
import ResidentPayments from "./pages/ResidentPayments";
import Rooms from "./pages/Rooms";

import AdminRoute from "./routes/AdminRoute";
import ResidentRoute from "./routes/ResidentRoute";
import ToastProvider from "./components/ToastProvider";

function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* PUBLIC */}
                <Route path="/" element={<Login />} />

                {/* ADMIN */}
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/admin/requests"
                    element={
                        <AdminRoute>
                            <AdminRequests />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/admin/history"
                    element={
                        <AdminRoute>
                            <RequestHistory />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/admin/residents"
                    element={
                        <AdminRoute>
                            <AdminResidents />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/admin/rooms"
                    element={
                        <AdminRoute>
                            <Rooms />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/payments"
                    element={
                        <AdminRoute>
                            <Payments />
                        </AdminRoute>
                    }
                />

                {/* RESIDENT */}
                <Route
                    path="/resident"
                    element={
                        <ResidentRoute>
                            <ResidentDashboard />
                        </ResidentRoute>
                    }
                />

                <Route
                    path="/resident/payments"
                    element={
                        <ResidentRoute>
                            <ResidentPayments />
                        </ResidentRoute>
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