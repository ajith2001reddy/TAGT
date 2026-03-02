"use client";

import { useOwnerStats } from "@/features/owner/useOwnerStats";
import { StatCard } from "@/components/ui/StatCard";

const icons = {
    residents: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    rooms: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    occupancy: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
    pending: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    overdue: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
    revenue: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
};

export default function OwnerPage() {
    const { stats, loading } = useOwnerStats();

    if (loading) {
        return (
            <div>
                <div style={{ marginBottom: "28px" }}>
                    <div className="skeleton" style={{ height: "28px", width: "200px", marginBottom: "8px" }} />
                    <div className="skeleton" style={{ height: "16px", width: "300px" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: "120px", borderRadius: "16px" }} />
                    ))}
                </div>
            </div>
        );
    }

    if (!stats) return (
        <div style={{ color: "var(--text-secondary)", textAlign: "center", paddingTop: "60px" }}>
            <p>Failed to load dashboard data.</p>
        </div>
    );

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
                <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "6px" }}>
                    Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"} 👋
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                    Here's what's happening across your properties today.
                </p>
            </div>

            {/* Stats grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "40px",
            }}>
                <StatCard label="Total Residents" value={stats.totalResidents} icon={icons.residents} accent="var(--accent-primary)" />
                <StatCard label="Total Rooms" value={stats.totalRooms} icon={icons.rooms} accent="#7c3aed" />
                <StatCard label="Occupancy Rate" value={`${stats.occupancyRate}%`} icon={icons.occupancy} accent="#059669" />
                <StatCard label="Pending Payments" value={stats.pendingPayments} icon={icons.pending} accent="#d97706" />
                <StatCard label="Overdue Payments" value={stats.overduePayments} icon={icons.overdue} accent="var(--red)" />
                <StatCard label="Monthly Revenue" value={`₹${(stats.monthlyRevenue / 1000).toFixed(1)}k`} icon={icons.revenue} accent="var(--green)" />
            </div>

            {/* Quick links */}
            <div style={{ marginBottom: "8px" }}>
                <div className="label-text" style={{ marginBottom: "14px" }}>QUICK ACTIONS</div>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    {[
                        { href: "/owner/rooms", label: "Manage Rooms", desc: "Add or configure rooms" },
                        { href: "/owner/payments", label: "View Payments", desc: "Billing & collections" },
                        { href: "/owner/analytics", label: "Analytics", desc: "KPIs & forecasts" },
                    ].map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            style={{
                                display: "flex", alignItems: "center", gap: "12px",
                                padding: "14px 18px",
                                background: "var(--bg-card)",
                                border: "1px solid var(--border-default)",
                                borderRadius: "12px",
                                textDecoration: "none",
                                color: "var(--text-primary)",
                                transition: "all 0.18s ease",
                                minWidth: "200px",
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-strong)";
                                (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-card-hover)";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-default)";
                                (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-card)";
                            }}
                        >
                            <div>
                                <div style={{ fontSize: "14px", fontWeight: 500 }}>{item.label}</div>
                                <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>{item.desc}</div>
                            </div>
                            <svg style={{ marginLeft: "auto", color: "var(--text-tertiary)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}