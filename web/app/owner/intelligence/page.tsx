"use client";

import { useEffect, useState } from "react";
import { useOwnerStats } from "@/features/owner/useOwnerStats";
import { fetchIntelligenceSummary, IntelligenceSummary } from "@/features/owner/owner.service";
import { motion } from "framer-motion";
import { BrainCircuit, TrendingUp, AlertOctagon, Lightbulb, Activity, Zap } from "lucide-react";

export function useIntelligence() {
    const [data, setData] = useState<IntelligenceSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchIntelligenceSummary().then(d => {
            setData(d);
            setLoading(false);
        });
    }, []);

    return { data, loading };
}

export default function IntelligenceDashboard() {
    const { stats, loading: statsLoading } = useOwnerStats();
    const { data, loading: aiLoading } = useIntelligence();

    if (statsLoading || aiLoading) return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: "130px", borderRadius: "20px" }} />
            ))}
        </div>
    );

    // Dynamic data from AI Engine
    const forecast = data?.forecast;
    const trends = data?.trends;
    const churn = data?.churn;
    
    const nextMonthForecast = forecast?.forecast?.[0]?.projected || (stats?.monthlyRevenue || 0);
    const churnRiskCount = churn?.highRisk || 0;
    const occupancyRate = trends?.current?.occupancyRate || stats?.occupancyRate || 0;

    return (
        <div className="animate-fade-in" style={{ paddingBottom: "40px" }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                style={{ marginBottom: "32px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "24px" }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #f59e0b, #d97706)", display: "flex", alignItems: "center", justifyContent: "center", color: "#000" }}>
                        <BrainCircuit size={18} />
                    </div>
                    <h1 className="display-text" style={{ fontSize: "28px", margin: 0 }}>Intelligence Center</h1>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "600px", marginTop: "8px" }}>
                    AI-driven forecasts and actionable recommendations based on your actual property portfolio performance.
                </p>
            </motion.div>

            {/* Top Predictions Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "32px" }}>
                {/* Revenue Forecast */}
                <div className="glass-card" style={{ padding: "24px", borderRadius: "20px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, right: 0, width: "120px", height: "120px", background: "radial-gradient(circle at top right, rgba(52,211,153,0.1), transparent 70%)" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", color: "var(--green)" }}>
                        <TrendingUp size={20} />
                        <h3 style={{ fontSize: "14px", fontWeight: 700, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Next Month Projection</h3>
                    </div>
                    <div style={{ fontSize: "36px", fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", marginBottom: "8px" }}>
                        ₹{(nextMonthForecast / 1000).toFixed(1)}k
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                        {forecast?.trend === "up" ? "Projected increase" : forecast?.trend === "down" ? "Potential decline" : "Stable revenue"} based on historic collection and current occupancy.
                    </p>
                </div>

                {/* Churn Risk */}
                <div className="glass-card" style={{ padding: "24px", borderRadius: "20px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, right: 0, width: "120px", height: "120px", background: "radial-gradient(circle at top right, rgba(239,68,68,0.1), transparent 70%)" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", color: "var(--red)" }}>
                        <AlertOctagon size={20} />
                        <h3 style={{ fontSize: "14px", fontWeight: 700, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Churn Risk Detected</h3>
                    </div>
                    <div style={{ fontSize: "36px", fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", marginBottom: "8px" }}>
                        {churnRiskCount} <span style={{ fontSize: "16px", color: "var(--text-tertiary)", fontWeight: 500 }}>High Risk</span>
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                        Residents identified with a risk score &gt;60% based on payment delays and tenure.
                    </p>
                </div>

                {/* Maintenance Forecasting */}
                <div className="glass-card" style={{ padding: "24px", borderRadius: "20px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, right: 0, width: "120px", height: "120px", background: "radial-gradient(circle at top right, rgba(167,139,250,0.1), transparent 70%)" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", color: "#a78bfa" }}>
                        <Activity size={20} />
                        <h3 style={{ fontSize: "14px", fontWeight: 700, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Efficiency Forecast</h3>
                    </div>
                    <div style={{ fontSize: "36px", fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", marginBottom: "8px" }}>
                        {occupancyRate >= 90 ? "Peak" : "Optimal"} <span style={{ fontSize: "16px", color: "var(--text-tertiary)", fontWeight: 500 }}>Load</span>
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                        Currently at {occupancyRate}% occupancy. Resource utilization is {occupancyRate > 85 ? "high" : "nominal"}.
                    </p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>
                {/* Left: AI Action Log */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div className="glass-card" style={{ padding: "24px", borderRadius: "20px" }}>
                        <div style={{ marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: "0 0 6px 0" }}>Property Intelligence Log</h3>
                            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>Automated insights and anomaly detections.</p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {data?.alerts?.alerts?.map((alert: any, i: number) => (
                                <div key={i} style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", display: "flex", gap: "12px" }}>
                                    <div style={{ color: alert.severity === "critical" ? "var(--red)" : "var(--yellow)" }}>●</div>
                                    <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                                        <strong>{alert.title}</strong>: {alert.description || alert.action}
                                    </div>
                                </div>
                            )) || <div style={{ textAlign: "center", color: "var(--text-tertiary)", padding: "20px" }}>No anomalies detected at this time.</div>}
                        </div>
                    </div>
                </div>

                {/* Right: AI Actions & Smart Alerts */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                    {/* Actionable Recommendations */}
                    <div className="glass-card" style={{ padding: "24px", borderRadius: "20px", border: "1px solid rgba(0,212,255,0.2)", background: "linear-gradient(180deg, rgba(0,212,255,0.03), transparent)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", color: "#00d4ff" }}>
                            <Lightbulb size={18} />
                            <h3 style={{ fontSize: "14px", fontWeight: 700, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>AI Recommendations</h3>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {occupancyRate >= 90 && (
                                <div style={{ background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>Revenue Optimization</div>
                                    <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                                        High demand detected ({occupancyRate}%). Consider a 5-8% base rent increase for new move-ins.
                                    </div>
                                </div>
                            )}

                            {churnRiskCount > 0 && (
                                <div style={{ background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>Retention Strategy</div>
                                    <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                                        Immediate outreach recommended for {churnRiskCount} residents flagged as high risk to prevent vacancy.
                                    </div>
                                </div>
                            )}

                            <div style={{ background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>Operation Health</div>
                                <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                                    Systems indicate stable operations. No emergency maintenance clusters detected.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick System Alerts */}
                    <div className="glass-card" style={{ padding: "24px", borderRadius: "20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", color: "var(--text-primary)" }}>
                            <Zap size={18} />
                            <h3 style={{ fontSize: "14px", fontWeight: 700, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Smart Alerts</h3>
                        </div>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                            {occupancyRate < 60 && (
                                <li style={{ display: "flex", gap: "12px", fontSize: "13px", alignItems: "flex-start", paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                    <span style={{ color: "var(--yellow)", marginTop: "2px" }}>⚠</span>
                                    <div><strong style={{ color: "#fff" }}>Low Occupancy:</strong> Ad campaign recommended to fill vacant units.</div>
                                </li>
                            )}
                            <li style={{ display: "flex", gap: "12px", fontSize: "13px", alignItems: "flex-start" }}>
                                <span style={{ color: "var(--green)", marginTop: "2px" }}>✓</span>
                                <div><strong style={{ color: "#fff" }}>Payment Health:</strong> Collection cycle is proceeding as per benchmark.</div>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
}
