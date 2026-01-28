import { NavLink } from "react-router-dom";
import Navbar from "../components/Navbar";

/**
 * DASHBOARD LAYOUT (PRODUCTION GRADE)
 * - Clean SaaS-style sidebar
 * - Role-aware navigation
 * - Clear visual hierarchy
 * - Scales well as app grows
 */

export default function DashboardLayout({ children }) {
    const token = localStorage.getItem("token");

    // Decode role safely from JWT
    let role = null;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        role = payload.role;
    } catch {
        role = null;
    }

    const baseLink =
        "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition";

    const linkClass = ({ isActive }) =>
        isActive
            ? `${baseLink} bg-blue-600 text-white shadow`
            : `${baseLink} text-gray-600 hover:bg-gray-100`;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top Navbar */}
            <Navbar />

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r min-h-[calc(100vh-64px)] px-4 py-6">
                    {/* Brand */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-blue-600">
                            TAGT
                        </h1>
                        <p className="text-xs text-gray-500">
                            Property Management
                        </p>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-6">
                        {/* ===== COMMON ===== */}
                        <div>
                            <p className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
                                Dashboard
                            </p>
                            <NavLink
                                to={role === "admin" ? "/admin" : "/resident"}
                                className={linkClass}
                            >
                                Overview
                            </NavLink>
                        </div>

                        {/* ===== ADMIN ===== */}
                        {role === "admin" && (
                            <div>
                                <p className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
                                    Management
                                </p>

                                <NavLink
                                    to="/admin/requests"
                                    className={linkClass}
                                >
                                    Requests
                                </NavLink>

                                <NavLink
                                    to="/admin/history"
                                    className={linkClass}
                                >
                                    History
                                </NavLink>

                                <NavLink
                                    to="/admin/residents"
                                    className={linkClass}
                                >
                                    Residents
                                </NavLink>

                                <NavLink
                                    to="/admin/rooms"
                                    className={linkClass}
                                >
                                    Rooms
                                </NavLink>

                                <NavLink
                                    to="/payments"
                                    className={linkClass}
                                >
                                    Payments
                                </NavLink>
                            </div>
                        )}

                        {/* ===== RESIDENT ===== */}
                        {role === "resident" && (
                            <div>
                                <p className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
                                    My Space
                                </p>

                                <NavLink
                                    to="/resident"
                                    className={linkClass}
                                >
                                    My Requests
                                </NavLink>

                                <NavLink
                                    to="/resident/payments"
                                    className={linkClass}
                                >
                                    My Payments
                                </NavLink>
                            </div>
                        )}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
