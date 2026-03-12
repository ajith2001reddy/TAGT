"use client";

import { useOwnerStats } from "@/features/owner/useOwnerStats";
import { DashboardCard } from "@/components/ui/PremiumUI";
import { motion } from "framer-motion";
import { TrendingUp, PieChart, Activity, Building, ArrowUpRight, ArrowDownRight, DownloadCloud, LineChart } from "lucide-react";

export default function InvestorDashboard() {
    const { stats, detailed, loading } = useOwnerStats();

    if (loading) return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: "130px", borderRadius: "20px" }} />
            ))}
        </div>
    );

    // Dynamic Investor Metrics
    const annualYield = detailed?.collectionRate ? `${detailed.collectionRate.toFixed(1)}%` : "0%";
    const portfolioValue = `₹${((stats?.totalResidents || 0) * 12 * 12000 / 100000).toFixed(1)} L`; // Simple valuation based on resident count * avg rent * 12
    const netOperatingIncome = `₹${((detailed?.profitEstimate || 0) / 1000).toFixed(1)}k`;

    const statItems = [
        { label: "Est. Portfolio Value", value: portfolioValue, color: "#fff", sub: "Est. annual run rate", icon: <Building size={17} />, trend: "up" as const, trendValue: "Dynamic" },
        { label: "Collection Rate", value: annualYield, color: "#34d399", sub: "Actual vs Expected", icon: <TrendingUp size={17} />, trend: "up" as const, trendValue: "Healthy" },
        { label: "Net Operating Income (NOI)", value: netOperatingIncome, color: "#00d4ff", sub: "This month collected", icon: <PieChart size={17} /> },
        { label: "Total Occupancy", value: `${stats?.occupancyRate || 0}%`, color: "#a78bfa", sub: "Portfolio-wide", icon: <Activity size={17} />, trend: (stats?.occupancyRate || 0) > 80 ? "up" as const : "down" as const, trendValue: `${stats?.occupancyRate}%` },
    ];

    return (
        <div className="animate-fade-in" style={{ paddingBottom: "40px" }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                style={{ marginBottom: "32px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}
            >
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #10b981, #047857)", display: "flex", alignItems: "center", justifyContent: "center", color: "#000" }}>
                            <LineChart size={18} />
                        </div>
                        <h1 className="display-text" style={{ fontSize: "28px", margin: 0 }}>Investor Relations</h1>
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "600px", marginTop: "8px" }}>
                        Real-time financial performance reaching your property data. No more mock values.
                    </p>
                </div>
            </motion.div>

            {/* Investor KPI Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px", marginBottom: "32px" }}>
                {statItems.map((s, i) => (
                    <DashboardCard key={i} {...s} delay={i * 0.05} />
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
                {/* Left: Financial Growth Chart */}
                <div className="glass-card" style={{ padding: "24px", borderRadius: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <div>
                            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>Revenue Collection Trend</h3>
                            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>Last 6 months trailing</p>
                        </div>
                    </div>
                    <div style={{ height: "280px", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "flex-end", gap: "8%", height: "200px", padding: "0 20px" }}>
                            {detailed?.trend && detailed.trend.length > 0 ? detailed.trend.map((t, i) => {
                                const max = Math.max(...detailed.trend.map(x => x.collected), 1);
                                const height = (t.collected / max) * 100;
                                return (
                                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                                        <div style={{ width: "100%", height: `${height}%`, background: "linear-gradient(180deg, var(--accent-primary), transparent)", borderRadius: "6px 6px 0 0", minHeight: "4px" }} />
                                        <span style={{ fontSize: "10px", color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>{t.month}</span>
                                    </div>
                                );
                            }) : (
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", color: "var(--text-tertiary)", fontSize: "13px" }}>Insufficient historical data</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Portfolio Asset Breakdown */}
                <div className="glass-card" style={{ padding: "24px", borderRadius: "20px" }}>
                    <div style={{ marginBottom: "20px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>Operational Efficiency</h3>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>Key performance indicators</p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {[
                            { label: "Occupied Beds", value: detailed?.occupiedBeds || 0, total: detailed?.totalBeds || 0, color: "var(--accent-primary)" },
                            { label: "Collection Progress", value: detailed?.monthly.collected || 0, total: detailed?.monthly.expected || 1, color: "var(--green)" },
                            { label: "Outstanding Recovery", value: detailed?.overdueAmount || 0, total: (detailed?.overdueAmount || 0) + (detailed?.monthly.collected || 0), color: "var(--red)" },
                        ].map((item, idx) => {
                            const pct = Math.min(100, (item.value / item.total) * 100);
                            return (
                                <div key={idx}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px" }}>
                                        <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                                        <span style={{ color: "#fff", fontWeight: 600 }}>{item.label.includes("Beds") ? `${item.value}/${item.total}` : `₹${(item.value / 1000).toFixed(1)}k`}</span>
                                    </div>
                                    <div style={{ height: "4px", width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                                        <div style={{ height: "100%", width: `${pct}%`, background: item.color, borderRadius: "2px" }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
