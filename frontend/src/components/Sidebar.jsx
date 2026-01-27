import { NavLink } from "react-router-dom";

/**
 * Sidebar
 * - Role-aware (admin / resident)
 * - Uses NavLink active state
 * - Safe Phase 1 improvement (no logic removed)
 */

const baseLink =
    "block px-4 py-2 rounded transition hover:bg-gray-700";

const activeLink =
    "bg-gray-800 font-semibold";

export default function Sidebar() {
    const role = localStorage.getItem("role");

    return (
        <aside className="w-64 bg-gray-900 text-white min-h-screen">
            <div className="p-4 text-xl font-bold border-b border-gray-700">
                TAGT PMS
            </div>

            <nav className="p-4 space-y-2">
                {/* ================= COMMON ================= */}
                <NavLink
                    to={role === "admin" ? "/admin" : "/resident"}
                    className={({ isActive }) =>
                        `${baseLink} ${isActive ? activeLink : ""}`
                    }
                >
                    Dashboard
                </NavLink>

                {/* ================= ADMIN ================= */}
                {role === "admin" && (
                    <>
                        <NavLink
                            to="/admin/requests"
                            className={({ isActive }) =>
                                `${baseLink} ${isActive ? activeLink : ""}`
                            }
                        >
                            Requests
                        </NavLink>

                        <NavLink
                            to="/admin/residents"
                            className={({ isActive }) =>
                                `${baseLink} ${isActive ? activeLink : ""}`
                            }
                        >
                            Residents
                        </NavLink>
                    </>
                )}

                {/* ================= RESIDENT ================= */}
                {role === "resident" && (
                    <NavLink
                        to="/resident"
                        className={({ isActive }) =>
                            `${baseLink} ${isActive ? activeLink : ""}`
                        }
                    >
                        My Requests
                    </NavLink>
                )}
            </nav>
        </aside>
    );
}
