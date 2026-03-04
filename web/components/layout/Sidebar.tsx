"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; icon: React.ReactNode; badge?: string };

const icons = {
    dashboard: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
    ),
    rooms: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    ),
    residents: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    payments: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
        </svg>
    ),
    analytics: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
    ),
    requests: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    ),
    properties: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
    ),
    overview: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    ),
    logout: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    ),
    reports: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
        </svg>
    ),
    settings: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
        </svg>
    ),
    subscription: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    ),
    activity: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
    ),
    intelligence: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
    ),
    owners: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    onboarding: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" />
        </svg>
    ),
};

export function Sidebar() {
    const { role, logout } = useAuth();
    const pathname = usePathname();

    const links: Record<string, NavItem[]> = {
        super_admin: [
            { href: "/provider", label: "Overview", icon: icons.overview },
            { href: "/provider/properties", label: "Properties", icon: icons.properties },
            { href: "/provider/owners", label: "Owners", icon: icons.owners },
            { href: "/provider/subscriptions", label: "Subscriptions", icon: icons.subscription },
            { href: "/provider/activity", label: "Activity Logs", icon: icons.activity },
        ],
        owner: [
            { href: "/owner", label: "Dashboard", icon: icons.dashboard },
            { href: "/owner/onboarding", label: "Onboarding", icon: icons.onboarding },
            { href: "/owner/property", label: "Property Details", icon: icons.properties },
            { href: "/owner/rooms", label: "Rooms", icon: icons.rooms },
            { href: "/owner/residents", label: "Residents", icon: icons.residents },
            { href: "/owner/payments", label: "Payments", icon: icons.payments },
            { href: "/owner/requests", label: "Requests", icon: icons.requests },
            { href: "/owner/analytics", label: "Analytics", icon: icons.analytics },
            { href: "/owner/intelligence", label: "Intelligence", icon: icons.intelligence },
            { href: "/owner/reports", label: "Reports", icon: icons.reports },
            { href: "/owner/subscription", label: "Subscription", icon: icons.subscription },
            { href: "/owner/settings", label: "Settings", icon: icons.settings },
        ],
        resident: [
            { href: "/resident", label: "Dashboard", icon: icons.dashboard },
            { href: "/resident/payments", label: "My Payments", icon: icons.payments },
            { href: "/resident/requests", label: "My Requests", icon: icons.requests },
        ],
    };

    const roleLinks = role ? links[role as keyof typeof links] || [] : [];

    return (
        <aside style={{
            width: "240px",
            minWidth: "240px",
            height: "100vh",
            position: "sticky",
            top: 0,
            borderRight: "1px solid var(--border-subtle)",
            background: "linear-gradient(180deg, #060c13 0%, #040a10 100%)",
            display: "flex",
            flexDirection: "column",
            padding: "0",
            overflow: "hidden",
        }}>
            {/* Logo area */}
            <div style={{
                padding: "24px 20px 20px",
                borderBottom: "1px solid var(--border-subtle)",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                        width: "32px", height: "32px",
                        background: "linear-gradient(135deg, var(--accent-primary), #0068a0)",
                        borderRadius: "9px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 0 20px rgba(0,212,255,0.3)",
                        fontSize: "14px", fontWeight: 700,
                        color: "#000",
                        fontFamily: "var(--font-display)",
                    }}>T</div>
                    <div>
                        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "15px", letterSpacing: "-0.02em" }}>TAGT</div>
                        <div style={{ fontSize: "10px", color: "var(--text-tertiary)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "1px" }}>
                            {role === "owner" ? "Owner Portal" : role === "super_admin" ? "Admin Portal" : "Resident Portal"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
                <div style={{ marginBottom: "8px", padding: "0 8px" }}>
                    <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                        Navigation
                    </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {roleLinks.map((link) => {
                        const active = pathname === link.href || (link.href !== "/owner" && link.href !== "/resident" && link.href !== "/provider" && pathname.startsWith(link.href + "/"));

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "11px",
                                    padding: "10px 12px",
                                    borderRadius: "10px",
                                    color: active ? "var(--accent-primary)" : "var(--text-secondary)",
                                    fontSize: "13.5px",
                                    fontWeight: active ? 600 : 400,
                                    textDecoration: "none",
                                    transition: "all 0.18s ease",
                                    background: active ? "rgba(0,212,255,0.07)" : "transparent",
                                    border: active ? "1px solid rgba(0,212,255,0.1)" : "1px solid transparent",
                                    position: "relative",
                                    letterSpacing: active ? "0" : "0",
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
                                    <span style={{
                                        position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                                        width: "3px", height: "55%", background: "var(--accent-primary)",
                                        borderRadius: "0 2px 2px 0", boxShadow: "0 0 8px rgba(0,212,255,0.6)",
                                    }} />
                                )}
                                <span style={{ opacity: active ? 1 : 0.6, flexShrink: 0 }}>{link.icon}</span>
                                {link.label}
                                {link.badge && (
                                    <span style={{
                                        marginLeft: "auto", fontSize: "10px", fontWeight: 700,
                                        background: "var(--red-bg)", color: "var(--red)",
                                        border: "1px solid rgba(255,82,82,0.2)", borderRadius: "5px",
                                        padding: "1px 6px", fontFamily: "var(--font-mono)",
                                    }}>{link.badge}</span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Footer */}
            <div style={{ padding: "12px", borderTop: "1px solid var(--border-subtle)" }}>
                <button
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
                    {icons.logout}
                    Sign Out
                </button>
            </div>
        </aside>
    );
}