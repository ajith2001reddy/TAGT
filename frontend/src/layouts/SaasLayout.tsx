import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const menuByRole: Record<string, { to: string; label: string }[]> = {
  super_admin: [
    { to: "/provider-dashboard", label: "Overview" },
    { to: "/provider-dashboard/properties", label: "Properties" },
    { to: "/provider-dashboard/users", label: "Users" },
    { to: "/provider-dashboard/revenue", label: "Revenue" },
    { to: "/provider-dashboard/settings", label: "Settings" },
  ],
  owner: [
    { to: "/owner-dashboard", label: "Overview" },
    { to: "/owner-dashboard/rooms", label: "Rooms" },
    { to: "/owner-dashboard/residents", label: "Residents" },
    { to: "/owner-dashboard/payments", label: "Payments" },
    { to: "/owner-dashboard/requests", label: "Requests" },
    { to: "/owner-dashboard/analytics", label: "Analytics" },
  ],
  resident: [
    { to: "/resident-dashboard", label: "My Dashboard" },
    { to: "/resident-dashboard/payments", label: "My Payments" },
    { to: "/resident-dashboard/requests", label: "My Requests" },
    { to: "/resident-dashboard/profile", label: "Profile" },
  ],
}

export default function SaasLayout() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const items = menuByRole[user?.role || "resident"] || []

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      <aside className="w-64 border-r border-white/10 p-4 space-y-2 hidden md:block">
        <h2 className="font-bold text-lg mb-4">MultiTenant SaaS</h2>
        {items.map((item) => (
          <Link key={item.to} to={item.to} className={`block px-3 py-2 rounded-lg ${loc.pathname === item.to ? "bg-violet-500/20 text-violet-200" : "text-white/70 hover:bg-white/5"}`}>
            {item.label}
          </Link>
        ))}
      </aside>
      <main className="flex-1">
        <header className="h-16 border-b border-white/10 px-6 flex items-center justify-between">
          <p className="text-white/70 text-sm">{user?.name} · {user?.role}</p>
          <button onClick={() => { logout(); nav("/login") }} className="px-3 py-1.5 rounded bg-white/10 text-sm">Logout</button>
        </header>
        <div className="p-6"><Outlet /></div>
      </main>
    </div>
  )
}
