"use client";

import { useEffect, useState } from "react";
import { fetchFinancialDashboard, fetchRevenueLeak, FinancialData, LeakData } from "@/features/owner/analytics.service";

function MiniSparkline({ data }: { data: { month: string; collected: number }[] }) {
    if (!data?.length) return null;
    const max = Math.max(...data.map(d => d.collected), 1);
    const w = 200, h = 48;
    const pts = data.map((d, i) => {
        const x = (i / Math.max(data.length - 1, 1)) * w;
        const y = h - (d.collected / max) * (h - 8) - 4;
        return `${x},${y}`;
    });
    return (
        <svg width={w} height={h} style={{ overflow: "visible" }}>
            <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                </linearGradient>
            </defs>
            <polyline points={pts.join(" ")} fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function KpiCard({ label, value, sub, color, sparkline }: any) {
    return (
        <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "18px",
            padding: "24px", position: "relative", overflow: "hidden",
            transition: "all 0.25s ease",
        }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 48px rgba(0,0,0,0.4)`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
        >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />
            <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "12px" }}>{label}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, letterSpacing: "-0.03em", color }}>{value}</div>
            {sub && <div style={{ marginTop: "6px", fontSize: "12px", color: "var(--text-tertiary)" }}>{sub}</div>}
            {sparkline && <div style={{ marginTop: "16px", opacity: 0.8 }}><MiniSparkline data={sparkline} /></div>}
        </div>
    );
}

function CollectionBar({ collected, expected }: { collected: number; expected: number }) {
    const pct = expected > 0 ? Math.min(100, Math.round((collected / expected) * 100)) : 0;
    const color = pct >= 90 ? "#34d399" : pct >= 70 ? "#fbbf24" : "var(--red)";
    return (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "18px", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Collection Progress</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 700, color }}>{pct}%</span>
            </div>
            <div style={{ height: "8px", background: "var(--border-subtle)", borderRadius: "4px", overflow: "hidden", marginBottom: "12px" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}99)`, borderRadius: "4px", transition: "width 1s cubic-bezier(0.4,0,0.2,1)", boxShadow: `0 0 10px ${color}50` }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div><div style={{ fontSize: "10px", color: "var(--text-tertiary)", marginBottom: "2px" }}>Collected</div><div style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700, color: "#34d399" }}>₹{collected.toLocaleString()}</div></div>
                <div style={{ textAlign: "right" }}><div style={{ fontSize: "10px", color: "var(--text-tertiary)", marginBottom: "2px" }}>Expected</div><div style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700 }}>₹{expected.toLocaleString()}</div></div>
            </div>
        </div>
    );
}

export default function AnalyticsPage() {
    const [fin, setFin] = useState<FinancialData | null>(null);
    const [leak, setLeak] = useState<LeakData | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"financial" | "leak">("financial");

    useEffect(() => {
        Promise.all([
            fetchFinancialDashboard(),
            fetchRevenueLeak(),
        ]).then(([f, l]) => {
            setFin(f);
            setLeak(l);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "32px" }}>
                <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Intelligence</div>
                <h1 className="display-text" style={{ fontSize: "30px", marginBottom: "4px" }}>Analytics</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Revenue performance, intelligence, and risk signals</p>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "6px", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "5px", marginBottom: "28px", width: "fit-content" }}>
                {[{ key: "financial", label: "📊 Financial Overview" }, { key: "leak", label: "🔍 Revenue Leak" }].map(({ key, label }) => (
                    <button key={key} onClick={() => setTab(key as any)} style={{
                        padding: "9px 20px", borderRadius: "8px", border: "none", cursor: "pointer",
                        background: tab === key ? "var(--accent-primary)" : "transparent",
                        color: tab === key ? "#000" : "var(--text-secondary)",
                        fontSize: "13px", fontWeight: tab === key ? 700 : 400,
                        fontFamily: tab === key ? "var(--font-display)" : "var(--font-body)",
                        transition: "all 0.18s ease",
                    }}>{label}</button>
                ))}
            </div>

            {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
                    {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: "140px", borderRadius: "18px" }} />)}
                </div>
            ) : tab === "financial" && fin ? (
                <div>
                    {/* Collection bar */}
                    <div style={{ marginBottom: "20px" }}>
                        <CollectionBar collected={fin.monthly.collected} expected={fin.monthly.expected} />
                    </div>

                    {/* KPI grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
                        <KpiCard label="Occupancy Rate" value={`${fin.occupancyRate}%`} sub={`${fin.occupiedBeds}/${fin.totalBeds} beds`} color="var(--accent-primary)" />
                        <KpiCard label="Outstanding" value={`₹${(fin.monthly.outstanding / 1000).toFixed(1)}k`} sub="Unpaid across all residents" color="#fbbf24" />
                        <KpiCard label="Late Fees Earned" value={`₹${fin.lateFeesEarned.toLocaleString()}`} sub="All-time" color="#a78bfa" />
                        <KpiCard label="Overdue Amount" value={`₹${(fin.overdueAmount / 1000).toFixed(1)}k`} sub={`${fin.overdueCount} overdue bills`} color="var(--red)" />
                        <KpiCard label="Profit Estimate" value={`₹${(fin.profitEstimate / 1000).toFixed(1)}k`} sub="Collected + late fees" color="#34d399" />
                        <KpiCard label="Collection Rate" value={`${fin.collectionRate}%`} sub="This month" color={fin.collectionRate >= 90 ? "#34d399" : fin.collectionRate >= 70 ? "#fbbf24" : "var(--red)"} />
                    </div>

                    {/* 6-month trend */}
                    {fin.trend.length > 0 && (
                        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "18px", padding: "24px" }}>
                            <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "20px" }}>6-Month Revenue Trend</div>
                            <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "80px" }}>
                                {fin.trend.map((t, i) => {
                                    const max = Math.max(...fin.trend.map(d => d.collected), 1);
                                    const pct = max ? (t.collected / max) * 100 : 0;
                                    return (
                                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                                            <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}>₹{(t.collected / 1000).toFixed(0)}k</div>
                                            <div style={{ width: "100%", background: "var(--border-subtle)", borderRadius: "4px", height: "48px", display: "flex", alignItems: "flex-end" }}>
                                                <div style={{ width: "100%", height: `${pct}%`, background: "linear-gradient(0deg, #34d399, #34d39960)", borderRadius: "4px", minHeight: "4px", transition: "height 0.8s ease" }} />
                                            </div>
                                            <div style={{ fontSize: "9px", fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}>{t.month}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            ) : tab === "leak" && leak ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {/* Total leak */}
                    <div style={{ background: "var(--red-bg)", border: "1px solid rgba(255,82,82,0.2)", borderRadius: "18px", padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--red)", marginBottom: "8px" }}>Estimated Revenue Leak</div>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: "36px", fontWeight: 700, letterSpacing: "-0.04em", color: "var(--red)" }}>₹{leak.totalLeakEstimate.toLocaleString()}</div>
                            <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px" }}>per month at current occupancy</div>
                        </div>
                        <div style={{ fontSize: "48px" }}>🔴</div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        {/* Empty beds */}
                        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "16px", padding: "20px" }}>
                            <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "16px" }}>
                                🛏 Empty Beds — ₹{leak.emptyBedCostTotal.toLocaleString()}/mo loss
                            </div>
                            {leak.emptyBeds.length === 0
                                ? <div style={{ color: "var(--green)", fontSize: "13px" }}>✅ All rooms fully occupied</div>
                                : leak.emptyBeds.map((r, i) => (
                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border-subtle)", fontSize: "13px" }}>
                                        <span>Room {r.roomNumber} — {r.emptyBeds} empty bed{r.emptyBeds > 1 ? "s" : ""}</span>
                                        <span style={{ color: "var(--red)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>-₹{r.costPerMonth.toLocaleString()}</span>
                                    </div>
                                ))
                            }
                        </div>

                        {/* Chronic late payers */}
                        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "16px", padding: "20px" }}>
                            <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "16px" }}>
                                ⏰ Chronic Late Payers
                            </div>
                            {leak.chronicLatePayers.length === 0
                                ? <div style={{ color: "var(--green)", fontSize: "13px" }}>✅ No chronic late payers</div>
                                : leak.chronicLatePayers.map((r, i) => (
                                    <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                                        <div style={{ fontSize: "13px", fontWeight: 600 }}>{r.name}</div>
                                        <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{r.email} · {r.lateCount} unpaid</div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    {/* Underpriced Rooms */}
                    {leak.underpricedRooms.length > 0 && (
                        <div style={{ background: "var(--bg-card)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: "16px", padding: "20px", borderLeft: "3px solid #fbbf24" }}>
                            <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "#fbbf24", marginBottom: "16px" }}>
                                💰 Underpriced Rooms (avg ₹{leak.avgRent}/mo)
                            </div>
                            {leak.underpricedRooms.map((r, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border-subtle)", fontSize: "13px" }}>
                                    <span>Room {r.roomNumber}</span>
                                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                        <span style={{ color: "var(--text-tertiary)" }}>Current: ₹{r.currentRent}</span>
                                        <span style={{ color: "#fbbf24", fontWeight: 700 }}>→ Suggested: ₹{r.suggestedRent}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
}