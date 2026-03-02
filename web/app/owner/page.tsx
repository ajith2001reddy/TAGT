"use client";

import { useEffect, useState } from "react";
import { useOwnerStats } from "@/features/owner/useOwnerStats";
import { api } from "@/lib/api";
import Link from "next/link";
import { RevenueTrendChart, OccupancyPieChart } from "@/components/owner/DashboardCharts";
import { ActivityTimeline } from "@/components/owner/ActivityTimeline";
import { ArrowUpRight, TrendingUp, Users, Home, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

function StatCard({ label, value, sub, color, icon }: {
    label: string; value: string | number; sub?: string; color: string; icon: React.ReactNode;
}) {
    return (
        <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-default)",
            borderRadius: "18px",
            padding: "24px",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.25s ease",
            cursor: "default",
        }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px ${color}15`;
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
                (e.currentTarget as HTMLElement).style.boxShadow = "";
            }}
        >
            {/* Gradient top edge */}
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "1px",
                background: `linear-gradient(90deg, transparent, ${color}50, transparent)`,
            }} />
            {/* Icon bg glow */}
            <div style={{
                position: "absolute", top: "16px", right: "16px",
                width: "42px", height: "42px",
                background: `${color}10`,
                border: `1px solid ${color}20`,
                borderRadius: "12px",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: color,
            }}>{icon}</div>

            <div style={{ marginBottom: "8px" }}>
                <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>{label}</div>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "30px", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)", lineHeight: 1.1 }}>{value}</div>
            {sub && <div style={{ marginTop: "6px", fontSize: "12px", color: "var(--text-tertiary)" }}>{sub}</div>}
        </div>
    );
}

function InsightCard({ type, severity, message, recommendation }: any) {
    const colors: Record<string, string> = { HIGH: "var(--red)", MEDIUM: "var(--yellow)", LOW: "var(--green)" };
    const color = colors[severity] || "var(--text-secondary)";
    return (
        <div style={{
            padding: "16px 20px",
            borderRadius: "12px",
            background: "var(--bg-card)",
            border: `1px solid ${color}20`,
            borderLeft: `3px solid ${color}`,
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>{message}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)", lineHeight: 1.5 }}>{recommendation}</div>
                </div>
                <span style={{
                    flexShrink: 0, padding: "4px 10px", borderRadius: "6px",
                    fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.08em",
                    background: `${color}12`, color, border: `1px solid ${color}25`,
                }}>{severity}</span>
            </div>
        </div>
    );
}

export default function OwnerPage() {
    const { stats, detailed, loading } = useOwnerStats();
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    if (loading) return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: "130px", borderRadius: "18px" }} />
            ))}
        </div>
    );

    const statItems = stats ? [
        { label: "Total Residents", value: stats.totalResidents, color: "var(--accent-primary)", sub: "Active tenants", icon: <Users size={18} /> },
        { label: "Total Rooms", value: stats.totalRooms, color: "#a78bfa", sub: "Configured units", icon: <Home size={18} /> },
        { label: "Occupancy Rate", value: `${stats.occupancyRate}%`, color: "#34d399", sub: "Current fill rate", icon: <TrendingUp size={18} /> },
        { label: "Pending Payments", value: stats.pendingPayments, color: "#fbbf24", sub: "Awaiting collection", icon: <Clock size={18} /> },
        { label: "Overdue Payments", value: stats.overduePayments, color: "var(--red)", sub: "Past due date", icon: <AlertTriangle size={18} /> },
        { label: "Monthly Revenue", value: `₹${((stats.monthlyRevenue || 0) / 1000).toFixed(1)}k`, color: "#34d399", sub: "Collected this month", icon: <TrendingUp size={18} /> },
    ] : [];

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ marginBottom: "36px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                        <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>
                            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                        </div>
                        <h1 className="display-text" style={{ fontSize: "32px", marginBottom: "6px" }}>
                            {greeting} 👋
                        </h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                            Here's your property portfolio at a glance.
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <Link href="/owner/residents" className="btn-ghost" style={{ fontSize: "13px", padding: "9px 18px" }}>
                            Add Resident
                        </Link>
                        <Link href="/owner/rooms" className="btn-primary" style={{ fontSize: "13px", padding: "9px 18px" }}>
                            Manage Rooms
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>

                {/* LEFT COLUMN: Charts & Stats */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {/* Stats Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
                        {statItems.map((s, i) => (
                            <div key={i} className={`animate-fade-up delay-${i + 1}`}>
                                <StatCard {...s} />
                            </div>
                        ))}
                    </div>

                    {/* Revenue Chart */}
                    <div className="glass-card" style={{ padding: "28px", borderRadius: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <div>
                                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>Revenue Trend</h3>
                                <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px" }}>Monthly rent collection performance</p>
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <span style={{ fontSize: "11px", color: "var(--green)", background: "rgba(52,211,153,0.1)", padding: "4px 8px", borderRadius: "6px", fontWeight: 600 }}>
                                    +12.5% vs last month
                                </span>
                            </div>
                        </div>
                        <RevenueTrendChart data={detailed?.trend || []} />
                    </div>
                </div>

                {/* RIGHT COLUMN: Activity & Intelligence */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {/* Occupancy Chart */}
                    <div className="glass-card" style={{ padding: "24px", borderRadius: "24px", textAlign: "center" }}>
                        <div style={{ textAlign: "left", marginBottom: "16px" }}>
                            <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>Portfolio Occupancy</h3>
                        </div>
                        <OccupancyPieChart
                            occupied={detailed?.occupiedBeds || 0}
                            total={detailed?.totalBeds || 0}
                        />
                        <div style={{ marginTop: "16px", display: "flex", justifyContent: "center", gap: "20px" }}>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "16px", fontWeight: 700 }}>{detailed?.occupiedBeds || 0}</div>
                                <div style={{ fontSize: "10px", color: "var(--text-tertiary)", textTransform: "uppercase" }}>Occupied</div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "16px", fontWeight: 700 }}>{(detailed?.totalBeds || 0) - (detailed?.occupiedBeds || 0)}</div>
                                <div style={{ fontSize: "10px", color: "var(--text-tertiary)", textTransform: "uppercase" }}>Vacant</div>
                            </div>
                        </div>
                    </div>

                    {/* Smart Alerts */}
                    <div className="glass-card" style={{ padding: "24px", borderRadius: "24px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>Smart Alerts</h3>
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--red)", boxShadow: "0 0 10px var(--red)" }} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {stats?.insights?.map((ins: any, i: number) => (
                                <InsightCard key={i} {...ins} />
                            )) || (
                                    <div style={{ color: "var(--text-tertiary)", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>
                                        No alerts at the moment.
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="glass-card" style={{ padding: "24px", borderRadius: "24px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>Activity Timeline</h3>
                            <Link href="/owner/activity" style={{ fontSize: "12px", color: "var(--accent-primary)", textDecoration: "none" }}>View All</Link>
                        </div>
                        <ActivityTimeline />
                    </div>
                </div>
            </div>
        </div>
    );
}