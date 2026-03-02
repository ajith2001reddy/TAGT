"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

export function DashboardShell({ children }: { children: ReactNode }) {
    return (
        <div style={{
            display: "flex",
            minHeight: "100vh",
            background: "var(--bg-base)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
        }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <Navbar />
                <main style={{
                    flex: 1,
                    padding: "28px 32px",
                    overflowY: "auto",
                }}>
                    {children}
                </main>
            </div>
        </div>
    );
}