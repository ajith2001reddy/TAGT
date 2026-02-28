import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="relative flex h-screen overflow-hidden bg-[#05060a] text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.14),transparent_30%),radial-gradient(circle_at_80%_100%,rgba(6,182,212,0.1),transparent_35%)]" />

            <div className="hidden w-60 flex-shrink-0 lg:flex lg:flex-col">
                <Sidebar />
            </div>

            {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div className="w-60 flex-col">
                        <Sidebar onNavigate={() => setSidebarOpen(false)} />
                    </div>
                    <div className="flex-1 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                </div>
            )}

            <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto px-5 pb-8 pt-5 lg:px-8">
                    <div className="mx-auto w-full max-w-7xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
