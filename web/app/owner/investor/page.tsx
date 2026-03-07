"use client";

import { useOwnerStats } from "@/features/owner/useOwnerStats";
import { DashboardCard, ChartCard } from "@/components/ui/PremiumUI";
import { motion } from "framer-motion";
import { TrendingUp, PieChart, Activity, Building, ArrowUpRight, ArrowDownRight, DownloadCloud, LineChart } from "lucide-react";

export default function InvestorDashboard() {
    const { stats, detailed, loading } = useOwnerStats(); // For now, leveraging existing stats for mock investor view

    if (loading) return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: "130px", borderRadius: "20px" }} />
            ))}
        </div>
    );

    // Mock Investor Metrics
    const annualYield = "8.4%";
    const portfolioValue = "₹4.2 Cr";
    const netOperatingIncome = `₹${(((stats?.monthlyRevenue || 0) * 0.8) / 1000).toFixed(1)}k`; // Rough mock NOI

    const statItems = [
        { label: "Est. Portfolio Value", value: portfolioValue, color: "#fff", sub: "Market valuation", icon: <Building size={17} />, trend: "up" as const, trendValue: "+4.2% YTD" },
        { label: "Annual Yield", value: annualYield, color: "#34d399", sub: "Projected ROI", icon: <TrendingUp size={17} />, trend: "up" as const, trendValue: "Healthy" },
        { label: "Net Operating Income (NOI)", value: netOperatingIncome, color: "#00d4ff", sub: "This month (EBITDA)", icon: <PieChart size={17} /> },
        { label: "Total Occupancy", value: `${stats?.occupancyRate || 0}%`, color: "#a78bfa", sub: "Portfolio-wide", icon: <Activity size={17} />, trend: "up" as const, trendValue: "+2.1% MoM" },
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
                        High-level financial performance, asset valuation, and return on investment analytics for stakeholders.
                    </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button className="btn-ghost" style={{ fontSize: "13px", padding: "8px 16px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <DownloadCloud size={16} /> Export Q3 Report
                    </button>
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
                            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>Revenue vs NOI Margins</h3>
                            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>12-month trailing performance</p>
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--green)", background: "rgba(52,211,153,0.1)", padding: "4px 8px", borderRadius: "6px" }}>
                            Margin +1.2%
                        </span>
                    </div>
                    <div style={{ height: "280px", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "rgba(0,0,0,0.2)", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.05)", color: "var(--text-tertiary)", fontSize: "13px" }}>
                            [ Detailed Financial Chart Loading... ]
                        </div>
                    </div>
                </div>

                {/* Right: Portfolio Asset Breakdown */}
                <div className="glass-card" style={{ padding: "24px", borderRadius: "20px" }}>
                    <div style={{ marginBottom: "20px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>Asset Performance Breakdown</h3>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>Yield analysis by property tier</p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                        <div style={{ padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "rgba(0,212,255,0.1)", color: "#00d4ff", display: "flex", alignItems: "center", justifyContent: "center" }}><Building size={20} /></div>
                                <div>
                                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>Premium PGs (Tier 1)</div>
                                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>4 Properties • 92% Occ.</div>
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>9.2% Yield</div>
                                <div style={{ fontSize: "11px", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "2px" }}><ArrowUpRight size={12} /> 0.4%</div>
                            </div>
                        </div>

                        <div style={{ padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "rgba(167,139,250,0.1)", color: "#a78bfa", display: "flex", alignItems: "center", justifyContent: "center" }}><Building size={20} /></div>
                                <div>
                                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>Standard Coliving (Tier 2)</div>
                                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>2 Properties • 85% Occ.</div>
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>7.8% Yield</div>
                                <div style={{ fontSize: "11px", color: "var(--red)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "2px" }}><ArrowDownRight size={12} /> 0.1%</div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
