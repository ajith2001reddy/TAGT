"use client";

import { useAuth } from "@/context/AuthContext";
import { PropertySwitcher } from "./PropertySwitcher";
import { NotificationBell } from "./NotificationBell";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";

const pageTitles: Record<string, { title: string; sub: string }> = {
    "/owner": { title: "Dashboard", sub: "Property performance overview" },
    "/owner/rooms": { title: "Rooms", sub: "Manage beds & availability" },
    "/owner/residents": { title: "Residents", sub: "Tenant management" },
    "/owner/payments": { title: "Payments", sub: "Billing & collections" },
    "/owner/analytics": { title: "Analytics", sub: "Revenue & performance insights" },
    "/owner/intelligence": { title: "Intelligence", sub: "AI-powered property insights" },
    "/owner/reports": { title: "Reports", sub: "Export & download data" },
    "/owner/requests": { title: "Requests", sub: "Maintenance & support" },
    "/owner/staff": { title: "Staff & Permissions", sub: "Manage team access" },
    "/owner/billing": { title: "Billing", sub: "Plan & subscription" },
    "/owner/invite": { title: "Invitation System", sub: "Onboard new residents" },
    "/resident/announcements": { title: "Announcements", sub: "Stay updated" },
    "/resident/lease": { title: "Lease & Documents", sub: "View your agreement" },
    "/notifications": { title: "Notification Hub", sub: "System activity" },
    "/provider": { title: "Platform Overview", sub: "Global platform stats" },
    "/provider/properties": { title: "Properties", sub: "All registered properties" },
    "/provider/owners": { title: "Owners", sub: "Manage property owners" },
    "/provider/subscriptions": { title: "Subscriptions", sub: "Plan management" },
    "/provider/activity": { title: "Activity Logs", sub: "Full audit trail" },
    "/provider/support": { title: "Support Dashboard", sub: "Manage all support tickets" },
};

interface NavbarProps {
    onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
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
            padding: "0 16px",
            position: "sticky", top: 0, zIndex: 50,
            flexShrink: 0,
        }}>
            {/* Left: Hamburger (mobile) + page title */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                {/* Hamburger — hidden on desktop via CSS */}
                <button
                    className="navbar-hamburger"
                    onClick={onMenuClick}
                    aria-label="Open navigation"
                    style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        display: "none", // shown via CSS on mobile
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "6px",
                        borderRadius: "8px",
                        flexShrink: 0,
                    }}
                >
                    <Menu size={20} />
                </button>

                <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}
                >
                    <div style={{ minWidth: 0 }}>
                        <div style={{
                            fontFamily: "var(--font-display)", fontSize: "16px",
                            fontWeight: 700, letterSpacing: "-0.025em",
                            color: "var(--text-primary)", lineHeight: 1.2,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                            {page.title}
                        </div>
                        {page.sub && (
                            <div className="navbar-sub" style={{
                                fontSize: "11px", color: "var(--text-tertiary)",
                                letterSpacing: "0.01em", lineHeight: 1,
                            }}>
                                {page.sub}
                            </div>
                        )}
                    </div>

                    <div className="navbar-divider" style={{
                        height: "20px", width: "1px",
                        background: "var(--border-default)",
                        opacity: 0.6,
                        flexShrink: 0,
                    }} />

                    <div className="navbar-clock" style={{
                        fontSize: "11.5px", fontFamily: "var(--font-mono)",
                        color: "var(--text-tertiary)", letterSpacing: "0.04em",
                        flexShrink: 0,
                    }}>
                        {time}
                    </div>
                </motion.div>
            </div>

            {/* Right: Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                {role === "owner" && (
                    <div className="navbar-property-switcher">
                        <PropertySwitcher />
                    </div>
                )}

                {/* Notification Bell */}
                <NotificationBell />

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