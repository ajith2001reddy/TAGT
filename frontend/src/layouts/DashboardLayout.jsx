import { useState } from "react";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import SidebarContent from "../components/SidebarContent";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuth();
    const role = user?.role ?? null;

    const baseLink =
        "flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all";
    const active =
        "bg-blue-500/90 text-white shadow-lg shadow-blue-500/20";
    const idle =
        "text-gray-300 hover:bg-white/10";

    return (
        <div className="min-h-screen bg-black text-gray-100">
            {/* Navbar */}
            <Navbar onMenuClick={() => setSidebarOpen(true)} />

            <div className="flex min-h-[calc(100vh-64px)]">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-64 border-r border-white/10 bg-white/5 backdrop-blur-xl">
                    <SidebarContent
                        role={role}
                        linkClass={({ isActive }) =>
                            `${baseLink} ${isActive ? active : idle}`
                        }
                    />
                </aside>

                {/* Mobile Sidebar */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <>
                            <motion.div
                                className="fixed inset-0 bg-black/60 z-40"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSidebarOpen(false)}
                            />

                            <motion.aside
                                className="fixed left-0 top-0 bottom-0 w-64 z-50 bg-black/90 backdrop-blur-xl border-r border-white/10"
                                initial={{ x: -300 }}
                                animate={{ x: 0 }}
                                exit={{ x: -300 }}
                                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                            >
                                <SidebarContent
                                    role={role}
                                    onNavigate={() => setSidebarOpen(false)}
                                    linkClass={({ isActive }) =>
                                        `${baseLink} ${isActive ? active : idle}`
                                    }
                                />
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                {/* MAIN CONTENT (ROUTES RENDER HERE) */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 p-6 shadow-xl min-h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
