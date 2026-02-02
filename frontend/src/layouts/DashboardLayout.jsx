import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

export default function DashboardLayout({ children }) {
    const token = localStorage.getItem("token");

    let role = null;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        role = payload.role;
    } catch {
        role = null;
    }

    const baseLink =
        "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium";

    const linkClass = ({ isActive }) =>
        isActive
            ? `${baseLink} bg-blue-600 text-white shadow`
            : `${baseLink} text-gray-300 hover:bg-white/10`;

    return (
        <div className="min-h-screen text-gray-100">
            <Navbar />

            <div className="flex backdrop-blur-xl bg-black/40 min-h-[calc(100vh-64px)]">
                <motion.aside
                    initial={false}
                    whileHover={{ x: 2 }}
                    transition={{ type: "spring", stiffness: 120, damping: 18 }}
                    className="w-64 px-4 py-6 border-r border-white/10 bg-white/5 backdrop-blur-xl"
                >
                    <div className="mb-8 px-2">
                        <h1 className="text-2xl font-bold text-blue-400">
                            TAGT
                        </h1>
                        <p className="text-xs text-gray-400">
                            Property Management
                        </p>
                    </div>

                    <nav className="space-y-6">
                        {/* COMMON */}
                        <div>
                            <p className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
                                Dashboard
                            </p>

                            <NavLink
                                to={role === "admin" ? "/admin" : "/resident"}
                                end
                                className={linkClass}
                            >
                                Overview
                            </NavLink>

                        </div>

                        {/* ADMIN */}
                        {role === "admin" && (
                            <div>
                                <p className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
                                    Management
                                </p>

                                {[
                                    { to: "/admin/requests", label: "Requests" },
                                    { to: "/admin/history", label: "History" },
                                    { to: "/admin/residents", label: "Residents" },
                                    { to: "/admin/roomss", label: "roomss" },
                                    { to: "/payments", label: "Payments" }
                                ].map((item) => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        className={linkClass}
                                    >
                                        {item.label}
                                    </NavLink>
                                ))}
                            </div>
                        )}

                        {/* RESIDENT */}
                        {role === "resident" && (
                            <div>
                                <p className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
                                    My Space
                                </p>

                                <NavLink
                                    to="/resident"
                                    end
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
                </motion.aside>

                <main className="flex-1 p-8 overflow-y-auto">
                    <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 p-6 shadow-xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
