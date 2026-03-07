"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard, Building2, BedDouble, Users, CreditCard,
    MessageSquare, BarChart2, Cpu, FileText, Star, Settings,
    LogOut, Globe, UserCog, Activity, ChevronRight, UserCheck, LifeBuoy, X,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: React.ReactNode; badge?: string };

const ownerNav: NavItem[] = [
    { href: "/owner", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { href: "/owner/onboarding", label: "Onboarding", icon: <UserCheck size={16} /> },
    { href: "/owner/property", label: "Property", icon: <Building2 size={16} /> },
    { href: "/owner/rooms", label: "Rooms", icon: <BedDouble size={16} /> },
    { href: "/owner/residents", label: "Residents", icon: <Users size={16} /> },
    { href: "/owner/payments", label: "Payments", icon: <CreditCard size={16} /> },
    { href: "/owner/requests", label: "Requests", icon: <MessageSquare size={16} /> },
];

const ownerSecondaryNav: NavItem[] = [
    { href: "/owner/analytics", label: "Analytics", icon: <BarChart2 size={16} /> },
    { href: "/owner/intelligence", label: "Intelligence", icon: <Cpu size={16} /> },
    { href: "/owner/reports", label: "Reports", icon: <FileText size={16} /> },
    { href: "/owner/subscription", label: "Subscription", icon: <Star size={16} /> },
    { href: "/owner/settings", label: "Settings", icon: <Settings size={16} /> },
    { href: "/owner/support", label: "Support", icon: <LifeBuoy size={16} /> },
];

const adminNav: NavItem[] = [
    { href: "/provider", label: "Overview", icon: <Globe size={16} /> },
    { href: "/provider/properties", label: "Properties", icon: <Building2 size={16} /> },
    { href: "/provider/owners", label: "Owners", icon: <UserCog size={16} /> },
    { href: "/provider/residents", label: "Residents", icon: <Users size={16} /> },
    { href: "/provider/subscriptions", label: "Subscriptions", icon: <Star size={16} /> },
    { href: "/provider/activity", label: "Activity Logs", icon: <Activity size={16} /> },
    { href: "/provider/support", label: "Support Desk", icon: <LifeBuoy size={16} /> },
];

const residentNav: NavItem[] = [
    { href: "/resident", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { href: "/resident/payments", label: "My Payments", icon: <CreditCard size={16} /> },
    { href: "/resident/requests", label: "My Requests", icon: <MessageSquare size={16} /> },
    { href: "/resident/support", label: "Support", icon: <LifeBuoy size={16} /> },
];

// Root-level hub routes should only activate on exact match
const ROOT_HUBS = ["/owner", "/resident", "/provider"];

function isActiveRoute(href: string, pathname: string): boolean {
    if (pathname === href) return true;
    if (ROOT_HUBS.includes(href)) return false;
    return pathname.startsWith(href + "/");
}

function NavGroup({
    title, items, pathname, onNavigate,
}: {
    title?: string;
    items: NavItem[];
    pathname: string;
    onNavigate?: () => void;
}) {
    return (
        <div style={{ marginBottom: "6px" }}>
            {title && (
                <div style={{
                    fontSize: "9.5px", fontFamily: "var(--font-mono)", letterSpacing: "0.15em",
                    color: "var(--text-tertiary)", textTransform: "uppercase",
                    padding: "8px 12px 4px", marginBottom: "2px",
                }}>
                    {title}
                </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                {items.map((link, i) => {
                    const active = isActiveRoute(link.href, pathname);
                    return (
                        <motion.div
                            key={link.href}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04, duration: 0.3, ease: "easeOut" }}
                        >
                            <Link
                                href={link.href}
                                onClick={onNavigate}
                                style={{
                                    display: "flex", alignItems: "center", gap: "10px",
                                    padding: "9px 12px", borderRadius: "10px",
                                    color: active ? "var(--accent-primary)" : "var(--text-secondary)",
                                    fontSize: "13.5px", fontWeight: active ? 600 : 400,
                                    textDecoration: "none",
                                    background: active ? "rgba(0,212,255,0.08)" : "transparent",
                                    border: `1px solid ${active ? "rgba(0,212,255,0.12)" : "transparent"}`,
                                    position: "relative", transition: "all 0.15s ease",
                                    letterSpacing: "-0.01em",
                                }}
                                onMouseEnter={e => {
                                    if (!active) {
                                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                                        (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!active) {
                                        (e.currentTarget as HTMLElement).style.background = "transparent";
                                        (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                                    }
                                }}
                            >
                                {active && (
                                    <motion.span
                                        layoutId="activeIndicator"
                                        style={{
                                            position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                                            width: "3px", height: "55%",
                                            background: "var(--accent-primary)",
                                            borderRadius: "0 2px 2px 0",
                                            boxShadow: "0 0 8px rgba(0,212,255,0.6)",
                                        }}
                                        transition={{ duration: 0.25, ease: "easeInOut" }}
                                    />
                                )}
                                <span style={{ opacity: active ? 1 : 0.55, flexShrink: 0, display: "flex" }}>
                                    {link.icon}
                                </span>
                                <span style={{ flex: 1 }}>{link.label}</span>
                                {link.badge && (
                                    <span style={{
                                        fontSize: "10px", fontWeight: 700,
                                        background: "var(--red-bg)", color: "var(--red)",
                                        border: "1px solid rgba(255,82,82,0.2)", borderRadius: "5px",
                                        padding: "1px 6px", fontFamily: "var(--font-mono)",
                                    }}>{link.badge}</span>
                                )}
                                {active && <ChevronRight size={12} style={{ opacity: 0.4, marginLeft: "auto" }} />}
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { role, logout, user } = useAuth();
    const pathname = usePathname();

    const initials = user?.email
        ? user.email.split("@")[0].slice(0, 2).toUpperCase()
        : "U";

    const roleLabel =
        role === "owner" ? "Property Owner" :
            role === "super_admin" ? "Super Admin" :
                "Resident";

    const sidebarContent = (
        <aside style={{
            width: "240px", minWidth: "240px", height: "100vh",
            borderRight: "1px solid var(--border-subtle)",
            background: "linear-gradient(180deg, #060c13 0%, #040a10 100%)",
            display: "flex", flexDirection: "column",
            overflow: "hidden",
            position: "relative",
        }}>
            {/* Logo + Close Button */}
            <div style={{
                padding: "20px 20px 18px",
                borderBottom: "1px solid var(--border-subtle)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                    <div style={{
                        width: "34px", height: "34px",
                        background: "linear-gradient(135deg, #00d4ff, #0068a0)",
                        borderRadius: "10px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 0 20px rgba(0,212,255,0.25)",
                        fontSize: "15px", fontWeight: 800,
                        color: "#000", fontFamily: "var(--font-display)",
                        flexShrink: 0,
                    }}>T</div>
                    <div>
                        <div style={{
                            fontFamily: "var(--font-display)", fontWeight: 700,
                            fontSize: "16px", letterSpacing: "-0.03em",
                        }}>TAGT</div>
                        <div style={{
                            fontSize: "9.5px", color: "var(--text-tertiary)",
                            letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "1px",
                        }}>Property OS</div>
                    </div>
                </motion.div>

                {/* Close button — only visible on mobile */}
                <button
                    className="sidebar-close-btn"
                    onClick={onClose}
                    aria-label="Close navigation"
                    style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "8px",
                        color: "var(--text-tertiary)",
                        cursor: "pointer",
                        display: "none", // shown via CSS on mobile
                        alignItems: "center",
                        justifyContent: "center",
                        width: "32px",
                        height: "32px",
                        flexShrink: 0,
                    }}
                >
                    <X size={16} />
                </button>
            </div>

            {/* User Profile */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                style={{
                    padding: "14px 16px",
                    margin: "10px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex", alignItems: "center", gap: "10px",
                }}
            >
                <div style={{
                    width: "34px", height: "34px", borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(0,212,255,0.25), rgba(0,104,160,0.5))",
                    border: "1.5px solid rgba(0,212,255,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", fontWeight: 700, fontFamily: "var(--font-display)",
                    color: "var(--accent-primary)", flexShrink: 0,
                }}>{initials}</div>
                <div style={{ minWidth: 0 }}>
                    <div style={{
                        fontSize: "12.5px", fontWeight: 600,
                        color: "var(--text-primary)", letterSpacing: "-0.01em",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                        {user?.email?.split("@")[0] || "User"}
                    </div>
                    <div style={{
                        fontSize: "10px", color: "var(--text-tertiary)",
                        textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "1px",
                    }}>{roleLabel}</div>
                </div>
            </motion.div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: "8px 10px", overflowY: "auto" }}>
                {role === "owner" && (
                    <>
                        <NavGroup items={ownerNav} pathname={pathname} onNavigate={onClose} />
                        <div style={{ height: "1px", background: "var(--border-subtle)", margin: "8px 2px" }} />
                        <NavGroup title="Insights" items={ownerSecondaryNav} pathname={pathname} onNavigate={onClose} />
                    </>
                )}
                {role === "super_admin" && (
                    <NavGroup title="Platform" items={adminNav} pathname={pathname} onNavigate={onClose} />
                )}
                {role === "resident" && (
                    <NavGroup items={residentNav} pathname={pathname} onNavigate={onClose} />
                )}
            </nav>

            {/* Logout */}
            <div style={{ padding: "10px", borderTop: "1px solid var(--border-subtle)" }}>
                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={logout}
                    style={{
                        width: "100%", padding: "10px 12px", borderRadius: "10px",
                        background: "transparent", border: "1px solid transparent",
                        cursor: "pointer", color: "var(--text-tertiary)",
                        display: "flex", alignItems: "center", gap: "10px",
                        fontSize: "13.5px", fontFamily: "var(--font-body)",
                        transition: "all 0.18s ease",
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,82,82,0.06)";
                        (e.currentTarget as HTMLElement).style.color = "var(--red)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,82,82,0.15)";
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
                        (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                    }}
                >
                    <LogOut size={14} style={{ opacity: 0.6 }} />
                    Sign Out
                </motion.button>
            </div>
        </aside>
    );

    return (
        <>
            {/* Desktop: always visible, sticky */}
            <div className="sidebar-desktop">
                <div style={{ position: "sticky", top: 0, height: "100vh" }}>
                    {sidebarContent}
                </div>
            </div>

            {/* Mobile: slide-in drawer with backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="sidebar-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={onClose}
                        />
                        {/* Drawer */}
                        <motion.div
                            className="sidebar-mobile"
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
                        >
                            {sidebarContent}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}