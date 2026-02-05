import { NavLink } from "react-router-dom";

export default function SidebarContent({ role, linkClass }) {
    return (
        <nav className="px-4 py-6 space-y-6">
            {/* DASHBOARD */}
            <div>
                <p className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
                    Dashboard
                </p>

                <NavLink
                    to={role === "admin" ? "/admin/dashboard" : "/resident/dashboard"}
                    end
                    className={linkClass}
                >
                    Overview
                </NavLink>
            </div>

            {/* ADMIN MENU */}
            {role === "admin" && (
                <div>
                    <p className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
                        Management
                    </p>

                    {[
                        { to: "/admin/requests", label: "Requests" },
                        { to: "/admin/residents", label: "Residents" },
                        { to: "/admin/rooms", label: "Rooms" },
                        { to: "/admin/payments", label: "Payments" },
                    ].map((item) => (
                        <NavLink key={item.to} to={item.to} className={linkClass}>
                            {item.label}
                        </NavLink>
                    ))}

                    <p className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase">
                        Analytics
                    </p>

                    <NavLink to="/admin/dashboard" className={linkClass}>
                        AI Insights
                    </NavLink>
                </div>
            )}

            {/* RESIDENT MENU */}
            {role === "resident" && (
                <div>
                    <p className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
                        My Space
                    </p>

                    <NavLink to="/resident/dashboard" end className={linkClass}>
                        My Requests
                    </NavLink>

                    <NavLink to="/resident/payments" className={linkClass}>
                        My Payments
                    </NavLink>
                </div>
            )}
        </nav>
    );
}
