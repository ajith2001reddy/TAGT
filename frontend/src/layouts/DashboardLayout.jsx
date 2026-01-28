import Navbar from "../components/Navbar";
import { NavLink } from "react-router-dom";

/**
 * DashboardLayout – Phase 4 FINAL
 * - Single source of truth for sidebar
 * - Role-based navigation
 * - Active link highlighting
 */

export default function DashboardLayout({ children }) {
    const role = localStorage.getItem("role");

    const linkClass = ({ isActive }) =>
        `block px-3 py-2 rounded transition ${isActive
            ? "bg-blue-600 text-white"
            : "hover:bg-gray-200 text-gray-800"
        }`;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top Navbar */}
            <Navbar />

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white shadow-md min-h-screen p-4">
                    <h2 className="text-xl font-bold mb-6">TAGT</h2>

                    <nav className="space-y-2">
                        {/* ================= COMMON ================= */}
                        <NavLink
                            to={role === "admin" ? "/admin" : "/resident"}
                            className={linkClass}
                        >
                            Dashboard
                        </NavLink>

                        {/* ================= ADMIN ================= */}
                        {role === "admin" && (
                            <>
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
                            </>
                        )}

                        {/* ================= RESIDENT ================= */}
                        {role === "resident" && (
                            <>
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
                            </>
                        )}
                    </nav>
                </aside>

                {/* Main content */}
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}
