"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, Cell,
} from "recharts";

interface ForecastData { history: { month: string; collected: number }[]; forecast: { month: string; projected: number; isForecast: true }[]; trend: string; avgMonthlyRevenue: number; }
interface TrendsData { current: { totalBeds: number; occupiedBeds: number; occupancyRate: number }; monthlyRevenueTrend: { month: string; billed: number; paid: number; collectionRate: number; newResidents: number }[]; roomBreakdown: { roomNumber: string; totalBeds: number; occupiedBeds: number; occupancyRate: number; rent: number }[]; }
interface ChurnData { totalResidents: number; highRisk: number; mediumRisk: number; lowRisk: number; residents: { residentId: string; name: string; email: string; score: number; riskLevel: string; reasons: string[] }[]; }
interface AlertData { alerts: { id: string; severity: string; title: string; description: string; action: string }[]; totalAlerts: number; }

interface SummaryData { forecast: ForecastData | null; trends: TrendsData | null; churn: ChurnData | null; alerts: AlertData | null; }

const CHART_COLORS = { primary: "#00d4ff", green: "#34d399", yellow: "#fbbf24", red: "#ff5252", purple: "#a78bfa" };
const RISK_COLOR = { HIGH: "#ff5252", MEDIUM: "#fbbf24", LOW: "#34d399" };
const ALERT_COLOR: Record<string, { bg: string; border: string; icon: string; text: string }> = {
    critical: { bg: "rgba(255,82,82,0.06)", border: "rgba(255,82,82,0.2)", icon: "🔴", text: "#ff5252" },
    warning: { bg: "rgba(251,191,36,0.06)", border: "rgba(251,191,36,0.2)", icon: "🟡", text: "#fbbf24" },
    info: { bg: "rgba(0,212,255,0.06)", border: "rgba(0,212,255,0.15)", icon: "🔵", text: "var(--accent-primary)" },
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: "#0d1520", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px 16px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
            <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", marginBottom: "6px" }}>{label}</div>
            {payload.map((p: any) => (
                <div key={p.dataKey} style={{ fontSize: "13px", fontWeight: 600, color: p.color }}>
                    {p.name}: {typeof p.value === "number" ? (p.dataKey?.includes("Rate") ? `${p.value}%` : `₹${Number(p.value).toLocaleString()}`) : p.value}
                </div>
            ))}
        </div>
    );
};

const SectionHeader = ({ title, sub }: { title: string; sub?: string }) => (
    <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "4px" }}>{sub || "Intelligence"}</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, margin: 0 }}>{title}</h2>
    </div>
);

const TREND_ICON: Record<string, string> = { up: "📈", down: "📉", stable: "➡️" };
const TREND_COLOR: Record<string, string> = { up: "#34d399", down: "#ff5252", stable: "var(--accent-primary)" };

export default function IntelligencePage() {
    const [data, setData] = useState<SummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"revenue" | "occupancy" | "churn" | "alerts">("revenue");

    useEffect(() => {
        api.get("/v2/intelligence/summary").then(r => setData(r.data.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    const TabBtn = ({ id, label }: { id: typeof tab; label: string }) => (
        <button onClick={() => setTab(id)} style={{ padding: "9px 18px", borderRadius: "9px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: tab === id ? 700 : 400, background: tab === id ? "var(--accent-primary)" : "transparent", color: tab === id ? "#000" : "var(--text-secondary)", transition: "all 0.15s", fontFamily: "var(--font-display)" }}>{label}</button>
    );

    const combinedRevenueData = data?.forecast ? [
        ...data.forecast.history.map(h => ({ month: h.month, collected: h.collected })),
        ...data.forecast.forecast.map(f => ({ month: f.month, projected: f.projected })),
    ] : [];

    if (loading) return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: "280px", borderRadius: "18px" }} />)}
        </div>
    );

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px" }}>
                <div>
                    <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>AI-Powered</div>
                    <h1 className="display-text" style={{ fontSize: "30px", marginBottom: "4px" }}>Property Intelligence</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Insights, forecasts and churn risk — powered by your data</p>
                </div>
                {data?.alerts && data.alerts.alerts.filter(a => a.severity === "critical").length > 0 && (
                    <div style={{ background: "rgba(255,82,82,0.08)", border: "1px solid rgba(255,82,82,0.2)", borderRadius: "12px", padding: "10px 16px", fontSize: "13px", color: "#ff5252", fontWeight: 600, display: "flex", gap: "8px", alignItems: "center", cursor: "pointer" }} onClick={() => setTab("alerts")}>
                        🔴 {data.alerts.alerts.filter(a => a.severity === "critical").length} Critical Alert{data.alerts.alerts.filter(a => a.severity === "critical").length > 1 ? "s" : ""}
                    </div>
                )}
            </div>

            {/* Top stats */}
            {data && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "14px", marginBottom: "24px" }}>
                    {[
                        { label: "Avg Monthly Revenue", value: `₹${(data.forecast?.avgMonthlyRevenue || 0).toLocaleString()}`, color: CHART_COLORS.green },
                        { label: "Occupancy Rate", value: `${data.trends?.current.occupancyRate || 0}%`, color: (data.trends?.current.occupancyRate || 0) >= 80 ? CHART_COLORS.green : CHART_COLORS.yellow },
                        { label: "Revenue Trend", value: `${TREND_ICON[data.forecast?.trend || "stable"]} ${data.forecast?.trend || "—"}`, color: TREND_COLOR[data.forecast?.trend || "stable"] },
                        { label: "High Risk Residents", value: data.churn?.highRisk || 0, color: (data.churn?.highRisk || 0) > 0 ? CHART_COLORS.red : CHART_COLORS.green },
                        { label: "Alerts", value: data.alerts?.totalAlerts || 0, color: (data.alerts?.alerts || []).some(a => a.severity === "critical") ? CHART_COLORS.red : CHART_COLORS.yellow },
                    ].map(({ label, value, color }) => (
                        <div key={label} style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "14px", padding: "18px" }}>
                            <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>{label}</div>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, color }}>{value}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tab bar */}
            <div style={{ display: "flex", background: "var(--bg-card)", borderRadius: "12px", padding: "5px", gap: "3px", marginBottom: "24px", width: "fit-content" }}>
                <TabBtn id="revenue" label="Revenue Forecast" />
                <TabBtn id="occupancy" label="Occupancy Trends" />
                <TabBtn id="churn" label="Churn Analysis" />
                <TabBtn id="alerts" label={`Smart Alerts${data?.alerts?.totalAlerts ? ` (${data.alerts.totalAlerts})` : ""}`} />
            </div>

            {/* Revenue Forecast tab */}
            {tab === "revenue" && data?.forecast && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "18px", padding: "24px" }}>
                        <SectionHeader title="Revenue Forecast" sub="Linear Regression · 6 months history · 3 months projected" />
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={combinedRevenueData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={CHART_COLORS.green} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={CHART_COLORS.green} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.2} />
                                        <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" tick={{ fill: "var(--text-tertiary)", fontSize: 11, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Area type="monotone" dataKey="collected" name="Collected" stroke={CHART_COLORS.green} fill="url(#colorCollected)" strokeWidth={2} dot={{ fill: CHART_COLORS.green, r: 4 }} />
                                <Area type="monotone" dataKey="projected" name="Projected" stroke={CHART_COLORS.primary} fill="url(#colorProjected)" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: CHART_COLORS.primary, r: 4 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Occupancy Trends tab */}
            {tab === "occupancy" && data?.trends && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {/* Collection Rate over time */}
                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "18px", padding: "24px" }}>
                        <SectionHeader title="Billing vs Collection" sub="Monthly · Billed vs Paid" />
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={data.trends.monthlyRevenueTrend} margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" tick={{ fill: "var(--text-tertiary)", fontSize: 11, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="billed" name="Billed" fill={CHART_COLORS.yellow + "60"} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="paid" name="Collected" fill={CHART_COLORS.green} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Room breakdown */}
                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "18px", padding: "24px" }}>
                        <SectionHeader title="Room Occupancy Breakdown" sub="Per room · Current status" />
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {data.trends.roomBreakdown.map(r => (
                                <div key={r.roomNumber} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                    <div style={{ width: "70px", fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 700, flexShrink: 0 }}>Room {r.roomNumber}</div>
                                    <div style={{ flex: 1, height: "6px", background: "var(--border-subtle)", borderRadius: "3px", overflow: "hidden" }}>
                                        <div style={{ height: "100%", width: `${r.occupancyRate}%`, background: r.occupancyRate === 100 ? CHART_COLORS.green : r.occupancyRate >= 50 ? CHART_COLORS.primary : CHART_COLORS.red, borderRadius: "3px", transition: "width 0.8s ease" }} />
                                    </div>
                                    <div style={{ width: "42px", textAlign: "right", fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 700, color: r.occupancyRate === 100 ? CHART_COLORS.green : r.occupancyRate >= 50 ? CHART_COLORS.primary : CHART_COLORS.red, flexShrink: 0 }}>{r.occupancyRate}%</div>
                                    <div style={{ width: "70px", textAlign: "right", fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>{r.occupiedBeds}/{r.totalBeds} beds</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Churn Analysis tab */}
            {tab === "churn" && data?.churn && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {/* Summary pills */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                        {[{ label: "High Risk", count: data.churn.highRisk, color: CHART_COLORS.red }, { label: "Medium Risk", count: data.churn.mediumRisk, color: CHART_COLORS.yellow }, { label: "Low Risk", count: data.churn.lowRisk, color: CHART_COLORS.green }].map(({ label, count, color }) => (
                            <div key={label} style={{ background: `${color}08`, border: `1px solid ${color}20`, borderRadius: "14px", padding: "18px", textAlign: "center" }}>
                                <div style={{ fontFamily: "var(--font-display)", fontSize: "32px", fontWeight: 700, color }}>{count}</div>
                                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Resident churn table */}
                    <div className="glass-card" style={{ overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                                    {["Resident", "Risk Score", "Level", "Signals"].map(h => (
                                        <th key={h} style={{ padding: "13px 18px", textAlign: "left", fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", fontWeight: 500 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.churn.residents.map(r => (
                                    <tr key={r.residentId} style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.12s" }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-card-hover)"}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}>
                                        <td style={{ padding: "13px 18px" }}>
                                            <div style={{ fontSize: "14px", fontWeight: 600 }}>{r.name}</div>
                                            <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{r.email}</div>
                                        </td>
                                        <td style={{ padding: "13px 18px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <div style={{ flex: 1, maxWidth: "100px", height: "5px", background: "var(--border-subtle)", borderRadius: "3px", overflow: "hidden" }}>
                                                    <div style={{ height: "100%", width: `${r.score}%`, background: (RISK_COLOR as any)[r.riskLevel], borderRadius: "3px" }} />
                                                </div>
                                                <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 700, color: (RISK_COLOR as any)[r.riskLevel] }}>{r.score}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: "13px 18px" }}>
                                            <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.08em", padding: "4px 9px", borderRadius: "6px", textTransform: "uppercase", background: (RISK_COLOR as any)[r.riskLevel] + "15", color: (RISK_COLOR as any)[r.riskLevel], border: `1px solid ${(RISK_COLOR as any)[r.riskLevel]}25` }}>{r.riskLevel}</span>
                                        </td>
                                        <td style={{ padding: "13px 18px" }}>
                                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                                {r.reasons.map(reason => (
                                                    <span key={reason} style={{ fontSize: "10px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "5px", padding: "2px 7px", color: "var(--text-secondary)" }}>{reason}</span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Smart Alerts tab */}
            {tab === "alerts" && data?.alerts && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {data.alerts.alerts.map(alert => {
                        const style = ALERT_COLOR[alert.severity] || ALERT_COLOR.info;
                        return (
                            <div key={alert.id} className="animate-fade-up" style={{ background: style.bg, border: `1px solid ${style.border}`, borderRadius: "16px", padding: "20px 24px", display: "flex", gap: "16px" }}>
                                <div style={{ fontSize: "22px", flexShrink: 0 }}>{style.icon}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "15px", color: style.text, marginBottom: "4px" }}>{alert.title}</div>
                                    <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "10px" }}>{alert.description}</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: style.text, opacity: 0.8 }}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                                        {alert.action}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
