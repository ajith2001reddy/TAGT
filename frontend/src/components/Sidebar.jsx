import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

const base =
    "block px-4 py-2 rounded hover:bg-gray-700 transition";
const active =
    "bg-gray-800 font-semibold";

export default function Sidebar({ open, onClose }) {
    const role = localStorage.getItem("role");

    return (
        <>
            {/* Overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={onClose}
                />
            )}

            <motion.aside
                initial={false}
                animate={{ x: open ? 0 : -260 }}
                transition={{ duration: 0.25 }}
                className="fixed top-0 left-0 z-50 w-64 min-h-screen bg-gray-900 text-white"
            >
                <div className="p-4 text-xl font-bold border-b border-gray-700">
                    TAGT PMS
                </div>

                <nav className="p-4 space-y-2">
                    <NavLink
                        to={
                            role === "admin"
                                ? "/admin/dashboard"
                                : "/resident/dashboard"
                        }
                        onClick={onClose}
                        className={({ isActive }) =>
                            `${base} ${isActive ? active : ""}`
                        }
                    >
                        Dashboard
                    </NavLink>

                    {role === "admin" && (
                        <>
                            <NavLink
                                to="/admin/requests"
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `${base} ${isActive ? active : ""}`
                                }
                            >
                                Requests
                            </NavLink>
                            <NavLink
                                to="/admin/residents"
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `${base} ${isActive ? active : ""}`
                                }
                            >
                                Residents
                            </NavLink>
                        </>
                    )}

                    {role === "resident" && (
                        <NavLink
                            to="/resident/requests"
                            onClick={onClose}
                            className={({ isActive }) =>
                                `${base} ${isActive ? active : ""}`
                            }
                        >
                            My Requests
                        </NavLink>
                    )}

                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.href = "/";
                        }}
                        className="mt-6 text-left px-4 py-2 text-red-400 hover:bg-red-500/10 rounded"
                    >
                        Logout
                    </button>
                </nav>
            </motion.aside>
        </>
    );
}
