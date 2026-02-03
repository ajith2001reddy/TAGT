import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const base =
    "block px-4 py-3 rounded-lg hover:bg-gray-700 transition";
const active =
    "bg-gray-800 font-semibold";

export default function Sidebar({ open, onClose }) {
    const { user, logout } = useAuth();
    const role = user?.role;

    const handleLogout = () => {
        onClose();
        logout();
    };

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
                    w-64 h-full
                    bg-gray-900 text-white
                    transform transition-transform duration-300
                    ${open ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0
                    flex flex-col
                `}
            >
                {/* Header */}
                <div className="p-4 text-xl font-bold border-b border-gray-700 pt-safe">
                    TAGT PMS
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
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
                        onClick={handleLogout}
                        className="mt-6 w-full text-left px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition"
                    >
                        Logout
                    </button>
                </nav>
            </aside>
        </>
    );
}
