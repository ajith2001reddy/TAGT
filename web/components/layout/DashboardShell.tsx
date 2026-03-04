"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { motion } from "framer-motion";

export function DashboardShell({ children }: { children: ReactNode }) {
    return (
        <div style={{
            display: "flex", minHeight: "100vh",
            background: "var(--bg-base)", color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
        }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <Navbar />
                <motion.main
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    style={{
                        flex: 1,
                        padding: "28px 32px",
                        overflowY: "auto",
                        maxWidth: "1400px",
                        width: "100%",
                        margin: "0 auto",
                    }}
                >
                    {children}
                </motion.main>
            </div>
        </div>
    );
}