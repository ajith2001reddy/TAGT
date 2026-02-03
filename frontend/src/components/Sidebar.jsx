import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const base =
    "flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all";
const active =
    "bg-blue-500/90 text-white shadow-lg shadow-blue-500/25";
const idle =
    "text-gray-300 hover:bg-white/10";

export default function Sidebar({ onNavigate }) {
    const { user, logout } = useAuth();
    const role = user?.role;

    return (
        <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="
                h-full flex flex-col px-4 py-6 space-y-6
                bg-black/40 backdrop-blur-2xl
                border-r border-white/10
            "
        >
            {/* Brand */}
            <div className="px-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                    TAGT
                </h1>
                <p className="text-xs text-gray-400">
                    Property Management
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-6">
                <div>
                    <p className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
                        Dashboard
                    </p>

                    <NavLink
                        to={role === "admin" ? "/admin" : "/resident"}
                        end
                        onClick={onNavigate}
                        className={({ isActive }) =>
                            `${base} ${isActive ? active : idle}`
                        }
                    >
                        Overview
                    </NavLink>
                </div>

                {role === "admin" && (
                    <div>
                        <p className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
                            Management
                        </p>

                        {[
                            { to: "/admin/requests", label: "Requests" },
                            { to: "/admin/residents", label: "Residents" },
                            { to: "/admin/rooms", label: "Rooms" },
                            { to: "/payments", label: "Payments" }
                        ].map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={onNavigate}
                                className={({ isActive }) =>
                                    `${base} ${isActive ? active : idle}`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                )}

                {role === "resident" && (
                    <div>
                        <p className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
                            My Space
                        </p>

                        <NavLink
                            to="/resident"
                            end
                            onClick={onNavigate}
                            className={({ isActive }) =>
                                `${base} ${isActive ? active : idle}`
                            }
                        >
                            My Requests
                        </NavLink>

                        <NavLink
                            to="/resident/payments"
                            onClick={onNavigate}
                            className={({ isActive }) =>
                                `${base} ${isActive ? active : idle}`
                            }
                        >
                            My Payments
                        </NavLink>
                    </div>
                )}
            </nav>

            {/* Logout */}
            <button
                onClick={() => {
                    logout();
                    onNavigate?.();
                }}
                className="
                    mt-auto px-4 py-2 rounded-xl text-sm font-medium
                    text-red-400 hover:bg-red-500/10
                    transition
                "
            >
                Logout
            </button>
        </motion.div>
    );
}
