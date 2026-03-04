"use client";

import { useAuth } from "@/context/AuthContext";
import { PropertySwitcher } from "./PropertySwitcher";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, Search, Plus } from "lucide-react";
import { useState, useEffect } from "react";

const pageTitles: Record<string, { title: string; sub: string }> = {
    "/owner": { title: "Dashboard", sub: "Property performance overview" },
    "/owner/rooms": { title: "Rooms", sub: "Manage beds & availability" },
    "/owner/residents": { title: "Residents", sub: "Tenant management" },
    "/owner/payments": { title: "Payments", sub: "Billing & collections" },
    "/owner/analytics": { title: "Analytics", sub: "Revenue & performance insights" },
    "/owner/intelligence": { title: "Intelligence", sub: "AI-powered property insights" },
    "/owner/reports": { title: "Reports", sub: "Export & download data" },
    "/owner/requests": { title: "Requests", sub: "Maintenance & support" },
    "/owner/settings": { title: "Settings", sub: "Account & preferences" },
    "/owner/property": { title: "Property", sub: "Property details" },
    "/owner/subscription": { title: "Subscription", sub: "Plan & billing" },
    "/owner/onboarding": { title: "Onboarding", sub: "Manage resident requests" },
    "/resident": { title: "My Dashboard", sub: "Your living space overview" },
    "/resident/payments": { title: "My Payments", sub: "Payment history & upcoming dues" },
    "/resident/requests": { title: "My Requests", sub: "Maintenance history" },
    "/resident/discover": { title: "Discover", sub: "Find a property to call home" },
    "/provider": { title: "Platform Overview", sub: "Global platform stats" },
    "/provider/properties": { title: "Properties", sub: "All registered properties" },
    "/provider/owners": { title: "Owners", sub: "Manage property owners" },
    "/provider/subscriptions": { title: "Subscriptions", sub: "Plan management" },
    "/provider/activity": { title: "Activity Logs", sub: "Full audit trail" },
};

export function Navbar() {
    const { role, user } = useAuth();
    const pathname = usePathname();
    const [time, setTime] = useState("");

    const page = pageTitles[pathname] || { title: "Dashboard", sub: "" };

    useEffect(() => {
        const update = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }));
        };
        update();
        const t = setInterval(update, 30000);
        return () => clearInterval(t);
    }, []);

    const initials = user?.email
        ? user.email.split("@")[0].slice(0, 2).toUpperCase()
        : "U";

    return (
        <header style={{
            height: "64px",
            borderBottom: "1px solid var(--border-subtle)",
            background: "rgba(6,12,19,0.85)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 24px",
            position: "sticky", top: 0, zIndex: 50,
            flexShrink: 0,
        }}>
            {/* Left: Page title */}
            <motion.div
                key={pathname}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                style={{ display: "flex", alignItems: "center", gap: "14px" }}
            >
                <div>
                    <div style={{
                        fontFamily: "var(--font-display)", fontSize: "16px",
                        fontWeight: 700, letterSpacing: "-0.025em",
                        color: "var(--text-primary)", lineHeight: 1.2,
                    }}>
                        {page.title}
                    </div>
                    {page.sub && (
                        <div style={{
                            fontSize: "11px", color: "var(--text-tertiary)",
                            letterSpacing: "0.01em", lineHeight: 1,
                        }}>
                            {page.sub}
                        </div>
                    )}
                </div>

                <div style={{
                    height: "20px", width: "1px",
                    background: "var(--border-default)",
                    opacity: 0.6,
                }} />

                <div style={{
                    fontSize: "11.5px", fontFamily: "var(--font-mono)",
                    color: "var(--text-tertiary)", letterSpacing: "0.04em",
                }}>
                    {time}
                </div>
            </motion.div>

            {/* Right: Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {role === "owner" && <PropertySwitcher />}

                {/* Notification Bell */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        width: "36px", height: "36px", borderRadius: "10px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid var(--border-subtle)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", position: "relative",
                        color: "var(--text-secondary)",
                        transition: "all 0.15s ease",
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
                        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
                        (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                        (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                    }}
                >
                    <Bell size={15} />
                </motion.button>

                {/* Avatar */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: "linear-gradient(135deg, rgba(0,212,255,0.3), rgba(0,104,160,0.6))",
                        border: "1.5px solid rgba(0,212,255,0.25)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "12px", fontWeight: 700, fontFamily: "var(--font-display)",
                        color: "var(--accent-primary)", cursor: "pointer", flexShrink: 0,
                    }}
                >
                    {initials}
                </motion.div>
            </div>
        </header>
    );
}