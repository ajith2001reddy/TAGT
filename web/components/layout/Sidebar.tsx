"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; icon: React.ReactNode };

const icons = {
    dashboard: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
    ),
    rooms: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    ),
    payments: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
        </svg>
    ),
    analytics: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    ),
    requests: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    ),
    properties: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
    ),
    overview: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
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
        ],
        owner: [
            { href: "/owner", label: "Dashboard", icon: icons.dashboard },
            { href: "/owner/rooms", label: "Rooms", icon: icons.rooms },
            { href: "/owner/payments", label: "Payments", icon: icons.payments },
            { href: "/owner/analytics", label: "Analytics", icon: icons.analytics },
        ],
        resident: [
            { href: "/resident", label: "Dashboard", icon: icons.dashboard },
            { href: "/resident/payments", label: "My Payments", icon: icons.payments },
            { href: "/resident/requests", label: "My Requests", icon: icons.requests },
        ],
    };

    const roleLinks = role ? (links[role as keyof typeof links] || []) : [];

    const roleLabel: Record<string, string> = {
        super_admin: "Platform Admin",
        owner: "Property Owner",
        resident: "Resident",
    };

    return (
        <aside style={{
            width: "240px",
            minWidth: "240px",
            height: "100vh",
            position: "sticky",
            top: 0,
            borderRight: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)",
            display: "flex",
            flexDirection: "column",
            padding: "0",
            overflow: "hidden",
        }}>
            {/* Logo area */}
            <div style={{
                padding: "20px 20px 16px",
                borderBottom: "1px solid var(--border-subtle)",
                display: "flex", alignItems: "center", gap: "10px",
            }}>
                <div style={{
                    width: "30px", height: "30px", borderRadius: "8px",
                    background: "var(--accent-primary)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                }}>
                    <span style={{ color: "#000", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "14px" }}>T</span>
                </div>
                <div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", letterSpacing: "-0.02em", lineHeight: 1 }}>
                        TAGT
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", marginTop: "2px", letterSpacing: "0.06em" }}>
                        {role ? roleLabel[role] || role.toUpperCase() : "—"}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
                <div className="label-text" style={{ padding: "0 8px", marginBottom: "8px" }}>Navigation</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {roleLinks.map((link) => {
                        const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href + "/") && link.href !== "/owner" && link.href !== "/resident" && link.href !== "/provider");
                        const exactActive = pathname === link.href;
                        const active = exactActive || isActive;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`sidebar-link ${active ? "active" : ""}`}
                            >
                                <span style={{ opacity: active ? 1 : 0.6 }}>{link.icon}</span>
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Footer */}
            <div style={{
                padding: "12px",
                borderTop: "1px solid var(--border-subtle)",
            }}>
                <button
                    onClick={logout}
                    style={{
                        width: "100%",
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "10px 14px", borderRadius: "10px",
                        background: "transparent",
                        border: "none",
                        color: "var(--text-tertiary)",
                        fontSize: "13px", cursor: "pointer",
                        transition: "all 0.18s ease",
                        fontFamily: "var(--font-body)",
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,82,82,0.08)";
                        (e.currentTarget as HTMLButtonElement).style.color = "var(--red)";
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-tertiary)";
                    }}
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                </button>
            </div>
        </aside>
    );
}