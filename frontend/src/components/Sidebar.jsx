import { NavLink } from "react-router-dom";

const base =
    "block px-4 py-2 rounded hover:bg-gray-700 transition";
const active =
    "bg-gray-800 font-semibold";

export default function Sidebar({ open, onClose }) {
    const role = localStorage.getItem("role");

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
                    <NavLink
                        to={role === "admin" ? "/admin/dashboard" : "/resident/dashboard"}
                        className={({ isActive }) =>
                            `${base} ${isActive ? active : ""}`
                        }
                        onClick={onClose}
                    >
                        Dashboard
                    </NavLink>

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
            </aside>
        </>
    );
}
