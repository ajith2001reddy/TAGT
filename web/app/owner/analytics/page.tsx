"use client";

import { motion } from "framer-motion";
import { useOwnerStats } from "@/features/owner/useOwnerStats";
import { RevenueTrendChart, OccupancyPieChart } from "@/components/owner/DashboardCharts";
import { ChartCard } from "@/components/ui/PremiumUI";
import { TrendingUp, Users, TrendingDown, Clock, Download, Filter } from "lucide-react";
import { useState } from "react";

export default function OwnerAnalyticsPage() {
    const { detailed, loading } = useOwnerStats();
    const [activeSection, setActiveSection] = useState("revenue");

    const sections = [
        { id: "revenue", label: "Financials", icon: <TrendingUp size={16} /> },
        { id: "occupancy", label: "Occupancy", icon: <Users size={16} /> },
        { id: "churn", label: "Churn Prediction", icon: <TrendingDown size={16} /> },
    ];

    if (loading) return <div className="skeleton" style={{ height: "600px", borderRadius: "24px" }} />;

    return (
        <div className="animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
                <div>
                    <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "8px" }}>Analytics Intelligence</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Deep insights into your property performance and financial growth.</p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button className="btn-ghost" style={{ fontSize: "12px", gap: "8px" }}>
                        <Filter size={14} /> Last 6 Months
                    </button>
                    <button className="btn-primary" style={{ fontSize: "12px", gap: "8px" }}>
                        <Download size={14} /> Export Report
                    </button>
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
                    <ChartCard title="Revenue Growth" sub="Monthly collection comparison" delay={0.1}>
                        <RevenueTrendChart data={detailed?.trend || []} />
                    </ChartCard>
                    <div className="glass-card" style={{ padding: "32px", borderRadius: "24px" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "24px" }}>Financial Breakdown</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {[
                                { label: "Total Collected", val: "₹1,24,000", change: "+12%", color: "var(--green)" },
                                { label: "Pending Dues", val: "₹18,500", change: "-5%", color: "var(--yellow)" },
                                { label: "Late Fee Revenue", val: "₹2,400", change: "+20%", color: "var(--accent-primary)" },
                                { label: "Projected Next Month", val: "₹1,45,000", change: "Forecast", color: "var(--text-tertiary)" }
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
                        <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "24px" }}>Room-wise Performance</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {/* Mockup room performance list */}
                            {[101, 102, 103, 201, 202].map(room => (
                                <div key={room} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", borderBottom: "1px solid var(--border-subtle)" }}>
                                    <span style={{ fontWeight: 600 }}>Room {room}</span>
                                    <div style={{ display: "flex", gap: "4px" }}>
                                        {[1, 2, 3].map(bed => (
                                            <div key={bed} style={{ width: "12px", height: "12px", borderRadius: "3px", background: bed < 3 ? "var(--accent-primary)" : "rgba(255,255,255,0.05)" }} />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{room < 200 ? "Highly Profitable" : "Steady"}</span>
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
                        <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "12px" }}>Churn Prediction Engine</h2>
                        <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>Our AI analyzes payment patterns and maintenance requests to predict which residents are most likely to leave in the next 30 days.</p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
                            {[
                                { name: "Aditi Sharma", risk: "HIGH", reason: "3 late payments in a row", prob: "82%" },
                                { name: "Rahul Verma", risk: "MEDIUM", reason: "Multiple unresolved issues", prob: "45%" }
                            ].map(resident => (
                                <div key={resident.name} style={{ padding: "20px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{resident.name}</div>
                                        <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{resident.reason}</div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: "14px", fontWeight: 800, color: resident.risk === "HIGH" ? "var(--red)" : "var(--yellow)" }}>{resident.prob} Probability</div>
                                        <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em" }}>CHURN RISK</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}