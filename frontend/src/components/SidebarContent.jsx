// frontend/src/components/SidebarContent.jsx
import { NavLink } from "react-router-dom";

export default function SidebarContent({ role, linkClass }) {
    return (
        <nav className="px-4 py-6 space-y-6">
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

            {role === "admin" && (
                <div>
                    <p className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
                        Management
                    </p>

                    {[{ to: "/admin/requests", label: "Requests" }, { to: "/admin/residents", label: "Residents" }].map((item) => (
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

            {role === "resident" && (
                <div>
                    <p className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase">
                        My Space
                    </p>

                    <NavLink to="/resident" end className={linkClass}>
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
