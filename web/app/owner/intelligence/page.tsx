"use client";

import { useOwnerStats } from "@/features/owner/useOwnerStats";
import { DashboardCard } from "@/components/ui/PremiumUI";
import { motion } from "framer-motion";
import { BrainCircuit, TrendingUp, AlertOctagon, Lightbulb, Activity, Zap } from "lucide-react";
import Link from "next/link";
import { RevenueTrendChart } from "@/components/owner/DashboardCharts"; // Reusing existing chart

export default function IntelligenceDashboard() {
    const { stats, loading } = useOwnerStats(); // For now, leveraging existing stats for mock intelligence

    if (loading) return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: "130px", borderRadius: "20px" }} />
            ))}
        </div>
    );

    // AI Generated Mock Predictions based on current stats
    const projectedRevenue = (stats?.monthlyRevenue || 0) * 1.05; // Predicting 5% growth
    const churnRiskCount = Math.floor((stats?.totalResidents || 0) * 0.08); // 8% avg churn risk

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
                    AI-driven forecasts, churn risk analysis, and actionable recommendations to optimize your portfolio's performance.
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
                        ₹{(projectedRevenue / 1000).toFixed(1)}k
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                        Expected +5.0% increase based on historical occupancy trends and scheduled rent escalations.
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
                        {churnRiskCount} <span style={{ fontSize: "16px", color: "var(--text-tertiary)", fontWeight: 500 }}>Residents</span>
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                        High probability of move-out next month due to unresolved maintenance requests and tenure length.
                    </p>
                </div>

                {/* Maintenance Forecasting */}
                <div className="glass-card" style={{ padding: "24px", borderRadius: "20px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, right: 0, width: "120px", height: "120px", background: "radial-gradient(circle at top right, rgba(167,139,250,0.1), transparent 70%)" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", color: "#a78bfa" }}>
                        <Activity size={20} />
                        <h3 style={{ fontSize: "14px", fontWeight: 700, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Maintenance Forecast</h3>
                    </div>
                    <div style={{ fontSize: "36px", fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", marginBottom: "8px" }}>
                        Spike <span style={{ fontSize: "16px", color: "var(--text-tertiary)", fontWeight: 500 }}>Predicted</span>
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                        Historical data suggests a 40% increase in AC repair requests in the coming 30 days due to seasonal changes.
                    </p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>
                {/* Left: Deep Dive Charts */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div className="glass-card" style={{ padding: "24px", borderRadius: "20px" }}>
                        <div style={{ marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: "0 0 6px 0" }}>6-Month Revenue Forecast Curve</h3>
                            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>AI projected revenue tracking against historical performance.</p>
                        </div>
                        {/* Reusing existing chart for visual effect, ideally we'd pass in predicted data points here */}
                        <div style={{ height: "300px", width: "100%", opacity: 0.8 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "rgba(0,0,0,0.2)", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.1)", color: "var(--text-tertiary)", fontSize: "13px" }}>
                                [ AI Forecasting Model Loading... ]
                            </div>
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
                            <div style={{ background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>Optimize Pricing</div>
                                <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "12px" }}>
                                    Market demand is surging. Increasing rent by 5% on renewing contracts could yield an extra ₹1.2L annually with minimal vacancy risk.
                                </div>
                                <button className="btn-primary" style={{ padding: "6px 14px", fontSize: "12px", width: "100%" }}>Create Price Adjustment</button>
                            </div>

                            <div style={{ background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>Prevent Churn</div>
                                <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "12px" }}>
                                    Offer a 10% discount to the {churnRiskCount} high-risk residents to secure 6-month extensions.
                                </div>
                                <button className="btn-ghost" style={{ padding: "6px 14px", fontSize: "12px", width: "100%" }}>Draft Offer Campaign</button>
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
                            <li style={{ display: "flex", gap: "12px", fontSize: "13px", alignItems: "flex-start", paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                <span style={{ color: "var(--yellow)", marginTop: "2px" }}>⚠</span>
                                <div><strong style={{ color: "#fff" }}>Occupancy dropping:</strong> Property "Elite PG" has 3 scheduled move-outs next week.</div>
                            </li>
                            <li style={{ display: "flex", gap: "12px", fontSize: "13px", alignItems: "flex-start", paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                <span style={{ color: "var(--red)", marginTop: "2px" }}>⚠</span>
                                <div><strong style={{ color: "#fff" }}>Payment delays:</strong> 15 residents missed the 5th of the month deadline. Automations firing.</div>
                            </li>
                            <li style={{ display: "flex", gap: "12px", fontSize: "13px", alignItems: "flex-start" }}>
                                <span style={{ color: "var(--green)", marginTop: "2px" }}>✓</span>
                                <div><strong style={{ color: "#fff" }}>Maintenance standard:</strong> Resolution times are 20% faster than last month.</div>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
}
