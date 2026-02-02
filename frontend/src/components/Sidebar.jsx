import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const base =
    "block px-4 py-2 rounded hover:bg-gray-700 transition";
const active =
    "bg-gray-800 font-semibold";

export default function Sidebar({ open, onClose }) {
    const { user, logout } = useAuth();
    const role = user?.role;

    return (
        <>
            {/* Overlay – mobile only */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
                    fixed top-0 left-0 z-50
                    w-64 min-h-screen
                    bg-gray-900 text-white
                    transform transition-transform duration-300
                    ${open ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0
                `}
            >
                <div className="p-4 text-xl font-bold border-b border-gray-700">
                    TAGT PMS
                </div>

                <nav className="p-4 space-y-2">
                    {/* Dashboard */}
                    <NavLink
                        to={
                            role === "admin"
                                ? "/admin/dashboard"
                                : "/resident/dashboard"
                        }
                        className={({ isActive }) =>
                            `${base} ${isActive ? active : ""}`
                        }
                        onClick={onClose}
                    >
                        Dashboard
                    </NavLink>

                    {/* Admin Links */}
                    {role === "admin" && (
                        <>
                            <NavLink
                                to="/admin/requests"
                                className={({ isActive }) =>
                                    `${base} ${isActive ? active : ""}`
                                }
                                onClick={onClose}
                            >
                                Requests
                            </NavLink>

                            <NavLink
                                to="/admin/residents"
                                className={({ isActive }) =>
                                    `${base} ${isActive ? active : ""}`
                                }
                                onClick={onClose}
                            >
                                Residents
                            </NavLink>
                        </>
                    )}

                    {/* Resident Links */}
                    {role === "resident" && (
                        <NavLink
                            to="/resident/requests"
                            className={({ isActive }) =>
                                `${base} ${isActive ? active : ""}`
                            }
                            onClick={onClose}
                        >
                            My Requests
                        </NavLink>
                    )}

                    {/* Logout */}
                    <button
                        onClick={logout}
                        className="mt-6 text-left px-4 py-2 text-red-400 hover:bg-red-500/10 rounded"
                    >
                        Logout
                    </button>
                </nav>
            </aside>
        </>
    );
}
