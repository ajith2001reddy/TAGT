"use client";

import { useAuth } from "@/context/AuthContext";
import { PropertySwitcher } from "./PropertySwitcher";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
    "/owner": "Dashboard",
    "/owner/rooms": "Rooms",
    "/owner/payments": "Payments",
    "/owner/analytics": "Analytics",
    "/resident": "My Dashboard",
    "/resident/payments": "My Payments",
    "/resident/requests": "My Requests",
    "/provider": "Platform Overview",
    "/provider/properties": "Properties",
};

export function Navbar() {
    const { role, user } = useAuth();
    const pathname = usePathname();

    const title = pageTitles[pathname] || "Dashboard";
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const dateStr = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

    return (
        <header style={{
            height: "60px",
            borderBottom: "1px solid var(--border-subtle)",
            background: "rgba(8,13,18,0.8)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 24px",
            position: "sticky", top: 0, zIndex: 50,
            flexShrink: 0,
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <h1 style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "17px", fontWeight: 600,
                    letterSpacing: "-0.02em",
                    color: "var(--text-primary)",
                }}>
                    {title}
                </h1>
                <span style={{
                    height: "16px", width: "1px",
                    background: "var(--border-default)",
                }} />
                <span className="mono-text" style={{ color: "var(--text-tertiary)" }}>
                    {dateStr} · {timeStr}
                </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {role === "owner" && <PropertySwitcher />}

                {/* Avatar */}
                <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--accent-tertiary), var(--accent-primary))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", fontWeight: 700, fontFamily: "var(--font-display)",
                    color: "#fff", cursor: "pointer", flexShrink: 0,
                    border: "1px solid rgba(0,212,255,0.2)",
                }}>
                    {user?.email?.[0]?.toUpperCase() || "U"}
                </div>
            </div>
        </header>
    );
}