"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { motion } from "framer-motion";

export function DashboardShell({ children }: { children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div style={{
            display: "flex", minHeight: "100vh",
            background: "var(--bg-base)", color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
        }}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <motion.main
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="dashboard-main"
                >
                    {children}
                </motion.main>
            </div>
        </div>
    );
}