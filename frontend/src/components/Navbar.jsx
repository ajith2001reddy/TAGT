import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

const baseLink =
    "block px-4 py-2 rounded transition hover:bg-gray-700";

const activeLink =
    "bg-gray-800 font-semibold";

export default function Sidebar({ open, onClose }) {
    const role = localStorage.getItem("role");

    return (
        <>
            {/* Overlay (mobile only) */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    x: open ? 0 : -260
                }}
                transition={{ duration: 0.25 }}
                className="
                    fixed md:static
                    top-0 left-0 z-50
                    w-64 min-h-screen
                    bg-gray-900 text-white
                    md:translate-x-0
                "
            >
                <div className="p-4 text-xl font-bold border-b border-gray-700">
                    TAGT PMS
                </div>

                <nav className="p-4 space-y-2">
                    <NavLink
                        to={role === "admin" ? "/admin" : "/resident"}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `${baseLink} ${isActive ? activeLink : ""}`
                        }
                    >
                        Dashboard
                    </NavLink>

                    {role === "admin" && (
                        <>
                            <NavLink to="/admin/requests" onClick={onClose}
                                className={({ isActive }) =>
                                    `${baseLink} ${isActive ? activeLink : ""}`
                                }>
                                Requests
                            </NavLink>
                            <NavLink to="/admin/residents" onClick={onClose}
                                className={({ isActive }) =>
                                    `${baseLink} ${isActive ? activeLink : ""}`
                                }>
                                Residents
                            </NavLink>
                        </>
                    )}

                    {role === "resident" && (
                        <NavLink to="/resident/requests" onClick={onClose}
                            className={({ isActive }) =>
                                `${baseLink} ${isActive ? activeLink : ""}`
                            }>
                            My Requests
                        </NavLink>
                    )}

                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.href = "/";
                        }}
                        className="mt-6 w-full text-left px-4 py-2 rounded text-red-400 hover:bg-red-500/10"
                    >
                        Logout
                    </button>
                </nav>
            </motion.aside>
        </>
    );
}
