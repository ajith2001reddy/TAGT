import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const NAV_ADMIN = [
    { to: "/dashboard", label: "Overview", icon: "⬡" },
    { to: "/residents", label: "Residents", icon: "◈" },
    { to: "/rooms", label: "Rooms", icon: "▣" },
    { to: "/payments", label: "Payments", icon: "◎" },
    { to: "/requests", label: "Requests", icon: "◇" },
    { to: "/properties", label: "Properties", icon: "⌂" },
    { to: "/notifications", label: "Notifications", icon: "✦" },
    { to: "/bookings", label: "Bookings", icon: "☰" },
    { to: "/resident-profiles", label: "Profiles", icon: "☻" },
    { to: "/realtime", label: "Real-Time", icon: "◉" },
    { to: "/email-center", label: "Email Center", icon: "✉" },
    { to: "/analytics-plus", label: "Analytics+", icon: "△" },
    { to: "/marketplace", label: "Marketplace", icon: "⬢" },
]

const NAV_RESIDENT = [
    { to: "/resident", label: "My Dashboard", icon: "⬡" },
]

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const links = user?.role === "admin" ? NAV_ADMIN : NAV_RESIDENT

    return (
        <div className="h-full flex flex-col bg-[#0a0a0f] border-r border-white/5">
            <div className="px-6 py-7 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-black text-white">T</div>
                    <div>
                        <p className="text-white font-bold tracking-tight text-sm">TAGT</p>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest">Property Mgmt</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                <p className="px-3 mb-3 text-[10px] font-semibold text-white/20 uppercase tracking-widest">{user?.role === "admin" ? "Management" : "My Space"}</p>
                {links.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === "/dashboard" || item.to === "/resident"}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${isActive ? "bg-violet-500/15 text-violet-300 border border-violet-500/20" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`
                        }
                    >
                        <span className="text-base leading-none">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-600/30 border border-white/10 flex items-center justify-center text-xs font-bold text-white/60">{user?.name?.[0]?.toUpperCase() ?? "U"}</div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white/70 text-xs font-medium truncate">{user?.name}</p>
                        <p className="text-white/25 text-[10px] capitalize">{user?.role}</p>
                    </div>
                    <button onClick={() => { logout(); navigate("/login") }} className="text-white/20 hover:text-red-400 transition text-xs" title="Sign out">⏻</button>
                </div>
            </div>
        </div>
    )
}
