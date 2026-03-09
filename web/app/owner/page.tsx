"use client";

import { useEffect, useState } from "react";
import { useOwnerStats } from "@/features/owner/useOwnerStats";
import { api } from "@/lib/api";
import Link from "next/link";
import { RevenueTrendChart, OccupancyPieChart } from "@/components/owner/DashboardCharts";
import { ActivityTimeline } from "@/components/owner/ActivityTimeline";
import { DashboardCard, ChartCard } from "@/components/ui/PremiumUI";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { ArrowUpRight, TrendingUp, Users, Home, Clock, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

interface Insight {
    message: string;
    recommendation: string;
    severity: string;
    type?: string;
}

function InsightCard({ severity, message, recommendation }: Insight) {
    const colors: Record<string, string> = { HIGH: "var(--red)", MEDIUM: "var(--yellow)", LOW: "var(--green)" };
    const color = colors[severity] || "var(--text-secondary)";
    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
                padding: "14px 18px",
                borderRadius: "12px",
                background: "var(--bg-card)",
                border: `1px solid ${color}20`,
                borderLeft: `3px solid ${color}`,
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>{message}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)", lineHeight: 1.5 }}>{recommendation}</div>
                </div>
                <span style={{
                    flexShrink: 0, padding: "3px 9px", borderRadius: "6px",
                    fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.08em",
                    background: `${color}12`, color, border: `1px solid ${color}25`,
                }}>{severity}</span>
            </div>
        </motion.div>
    );
}

export default function OwnerPage() {
    const { stats, detailed, loading } = useOwnerStats();
    const { dbUser } = useAuth();
    const verificationStatus = dbUser?.verification?.status || "pending";

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    if (loading) return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: "130px", borderRadius: "20px" }} />
            ))}
        </div>
    );

    const statItems = stats ? [
        { label: "Active Residents", value: stats.totalResidents, color: "var(--accent-primary)", sub: "Active tenants", icon: <Users size={17} />, trend: "up" as const, trendValue: "+2 this month" },
        { label: "Total Rooms", value: stats.totalRooms, color: "#a78bfa", sub: "Configured units", icon: <Home size={17} /> },
        { label: "Occupancy Rate", value: stats.occupancyRate, color: "#34d399", sub: "Current fill rate", icon: <TrendingUp size={17} />, trend: stats.occupancyRate >= 80 ? "up" as const : "down" as const, trendValue: stats.occupancyRate >= 80 ? "Healthy" : "Below target" },
        { label: "Pending Payments", value: stats.pendingPayments, color: "#fbbf24", sub: "Awaiting collection", icon: <Clock size={17} /> },
        { label: "Overdue Payments", value: stats.overduePayments, color: "var(--red)", sub: "Past due date", icon: <AlertTriangle size={17} />, trend: stats.overduePayments > 0 ? "down" as const : "stable" as const, trendValue: stats.overduePayments > 0 ? "Action needed" : "All clear" },
        { label: "Monthly Revenue", value: `₹${(((stats?.monthlyRevenue || 0) || 0) / 1000).toFixed(1)}k`, color: "#34d399", sub: "Collected this month", icon: <TrendingUp size={17} /> },
    ] : [];

    return (
        <div className="animate-fade-in">
            {/* Verification Alert */}
            {verificationStatus !== "approved" && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        marginBottom: "24px",
                        padding: "16px 20px",
                        background: verificationStatus === "rejected" ? "rgba(255,82,82,0.1)" : "rgba(251,191,36,0.1)",
                        border: `1px solid ${verificationStatus === "rejected" ? "rgba(255,82,82,0.2)" : "rgba(251,191,36,0.2)"}`,
                        borderRadius: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px"
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                            width: "36px", height: "36px", borderRadius: "10px",
                            background: verificationStatus === "rejected" ? "rgba(255,82,82,0.2)" : "rgba(251,191,36,0.2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: verificationStatus === "rejected" ? "#ff5252" : "#fbbf24"
                        }}>
                            <ShieldAlert size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                                {verificationStatus === "rejected" ? "Verification Rejected" : "Identity Verification Required"}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                {verificationStatus === "rejected"
                                    ? "Your documents were not accepted. Please re-upload clear copies."
                                    : "Please upload your ID and property documents to complete your profile."}
                            </div>
                        </div>
                    </div>
                    <Link href="/verify" className="btn-primary" style={{ fontSize: "12px", padding: "8px 16px", borderRadius: "10px" }}>
                        Verify Now
                    </Link>
                </motion.div>
            )}

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                style={{ marginBottom: "32px" }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                        <div style={{
                            fontSize: "10.5px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em",
                            textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "6px",
                        }}>
                            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                        </div>
                        <h1 className="display-text" style={{ fontSize: "30px", marginBottom: "6px" }}>
                            {greeting} 👋
                        </h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "13.5px" }}>
                            Here&apos;s your property portfolio at a glance.
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
            </motion.div>

            {/* Main Content Layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>

                {/* LEFT COLUMN: Charts & Stats */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {/* Stats Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
                        {statItems.map((s, i) => (
                            <DashboardCard key={i} {...s} delay={i * 0.06} />
                        ))}
                    </div>

                    {/* Revenue Chart */}
                    <ChartCard
                        title="Revenue Trend"
                        sub="Monthly collection"
                        delay={0.3}
                        actions={
                            <span style={{
                                fontSize: "11px", color: "var(--green)", background: "rgba(52,211,153,0.1)",
                                padding: "4px 10px", borderRadius: "6px", fontWeight: 600,
                            }}>+12.5% vs last month</span>
                        }
                    >
                        <RevenueTrendChart data={detailed?.trend || []} />
                    </ChartCard>
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
                            {stats?.insights?.map((ins: Insight, i: number) => (
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