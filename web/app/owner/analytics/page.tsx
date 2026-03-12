import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useOwnerStats } from "@/features/owner/useOwnerStats";
import { fetchIntelligenceSummary, IntelligenceSummary } from "@/features/owner/owner.service";
import { RevenueTrendChart, OccupancyPieChart } from "@/components/owner/DashboardCharts";
import { ChartCard } from "@/components/ui/PremiumUI";
import { TrendingUp, Users, TrendingDown, Clock, Download, Filter, Building } from "lucide-react";

export default function OwnerAnalyticsPage() {
    const { detailed, stats, loading: statsLoading } = useOwnerStats();
    const [intelligence, setIntelligence] = useState<IntelligenceSummary | null>(null);
    const [aiLoading, setAiLoading] = useState(true);
    const [activeSection, setActiveSection] = useState("revenue");

    useEffect(() => {
        fetchIntelligenceSummary().then(data => {
            setIntelligence(data);
            setAiLoading(false);
        });
    }, []);

    const sections = [
        { id: "revenue", label: "Financials", icon: <TrendingUp size={16} /> },
        { id: "occupancy", label: "Occupancy", icon: <Users size={16} /> },
        { id: "churn", label: "Intelligence", icon: <TrendingDown size={16} /> },
    ];

    if (statsLoading || aiLoading) return <div className="skeleton" style={{ height: "600px", borderRadius: "24px" }} />;

    return (
        <div className="animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
                <div>
                    <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "8px" }}>Analytics Intelligence</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Deep insights into your property performance and financial growth.</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "32px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" }}>
                {sections.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setActiveSection(s.id)}
                        style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "8px 16px", borderRadius: "10px",
                            background: activeSection === s.id ? "rgba(0,212,255,0.08)" : "transparent",
                            color: activeSection === s.id ? "var(--accent-primary)" : "var(--text-secondary)",
                            border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600,
                            transition: "all 0.2s"
                        }}
                    >
                        {s.icon} {s.label}
                    </button>
                ))}
            </div>

            {activeSection === "revenue" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                    <ChartCard title="Revenue Growth" sub="Monthly collection comparison (Last 6 Months)" delay={0.1}>
                        <RevenueTrendChart data={detailed?.trend || []} />
                    </ChartCard>
                    <div className="glass-card" style={{ padding: "32px", borderRadius: "24px" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "24px" }}>Financial Breakdown</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {[
                                { label: "Total Collected", val: `₹${((detailed?.monthly.collected || 0) / 1000).toFixed(1)}k`, change: "Actual", color: "var(--green)" },
                                { label: "Pending Dues", val: `₹${((detailed?.monthly.outstanding || 0) / 1000).toFixed(1)}k`, change: "Awaiting", color: "var(--yellow)" },
                                { label: "Late Fee Revenue", val: `₹${((detailed?.lateFeesEarned || 0) / 1000).toFixed(1)}k`, change: "Collected", color: "var(--accent-primary)" },
                                { label: "Est. Collection Rate", val: `${detailed?.collectionRate || 0}%`, change: "Efficiency", color: "var(--text-tertiary)" }
                            ].map(item => (
                                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <div style={{ fontSize: "12px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</div>
                                        <div style={{ fontSize: "20px", fontWeight: 700 }}>{item.val}</div>
                                    </div>
                                    <span style={{ fontSize: "12px", fontWeight: 600, color: item.color }}>{item.change}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeSection === "occupancy" && (
                <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "24px" }}>
                    <div className="glass-card" style={{ padding: "32px", borderRadius: "24px", textAlign: "center" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 700, textAlign: "left", marginBottom: "20px" }}>Current Capacity</h3>
                        <OccupancyPieChart occupied={detailed?.occupiedBeds || 0} total={detailed?.totalBeds || 0} />
                        <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "12px" }}>
                                <div style={{ fontSize: "20px", fontWeight: 700 }}>{detailed?.occupiedBeds}</div>
                                <div style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>OCCUPIED</div>
                            </div>
                            <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "12px" }}>
                                <div style={{ fontSize: "20px", fontWeight: 700 }}>{(detailed?.totalBeds || 0) - (detailed?.occupiedBeds || 0)}</div>
                                <div style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>VACANT</div>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: "32px", borderRadius: "24px" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "24px" }}>Asset Efficiency</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            {[
                                { label: "Investment Yield (Est.)", value: `${(detailed?.collectionRate || 0).toFixed(1)}%`, desc: "Collection vs Potential" },
                                { label: "Churn Velocity", value: intelligence?.churn?.totalAtRisk || 0, desc: "Residents at risk of move-out" },
                                { label: "Property Count", value: stats?.totalRooms || 0, desc: "Active units managed" }
                            ].map((item, idx) => (
                                <div key={idx} style={{ padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                        <span style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>{item.label}</span>
                                        <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--accent-primary)" }}>{item.value}</span>
                                    </div>
                                    <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0 }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeSection === "churn" && (
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <div className="glass-card" style={{ padding: "40px", borderRadius: "32px", textAlign: "center", border: "1px solid rgba(167,139,250,0.2)", background: "linear-gradient(135deg, rgba(167,139,250,0.05), transparent)" }}>
                        <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "rgba(167,139,250,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a78bfa", margin: "0 auto 24px" }}>
                            <TrendingDown size={32} />
                        </div>
                        <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "12px" }}>Risk Intelligence Engine</h2>
                        <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>Automated anomaly detection across your portfolio.</p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
                            {intelligence && intelligence.alerts?.length > 0 ? intelligence.alerts.map((alert: any, i: number) => (
                                <div key={i} style={{ padding: "20px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", display: "flex", gap: "16px", alignItems: "center" }}>
                                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: alert.severity === "high" ? "var(--red)" : "var(--yellow)" }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 600 }}>{alert.source || "Intelligence Alert"}</div>
                                        <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{alert.message}</div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ padding: "40px", textAlign: "center", color: "var(--text-tertiary)" }}>
                                    No critical risks detected by AI at this time.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}