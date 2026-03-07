"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface PlatformStats {
    totalProperties: number;
    totalOwners: number;
    totalResidents: number;
    totalRentCollected: number;
    totalLateFeesCollected: number;
    activeUnpaidBills: number;
    platformOccupancyRate: number;
    totalBeds: number;
    occupiedBeds: number;
    platformMRR: number;
    activeSubs: number;
    topProperties: { id: string; name: string; revenue: number }[];
    recentActivity: { id: string; action: string; userName: string; createdAt: string; details: { propertyId?: string } }[];
}

interface BigStatProps { label: string; value: string | number; color: string; sub: string; icon: string; }

function BigStat({ label, value, color, sub, icon }: BigStatProps) {
    return (
        <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "18px",
            padding: "24px", position: "relative", overflow: "hidden",
            transition: "all 0.25s ease",
        }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px ${color}15`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
        >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>{label}</div>
                <div style={{ width: "36px", height: "36px", background: `${color}12`, border: `1px solid ${color}20`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>{icon}</div>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "32px", fontWeight: 700, letterSpacing: "-0.04em", color }}>{value}</div>
            {sub && <div style={{ marginTop: "6px", fontSize: "12px", color: "var(--text-tertiary)" }}>{sub}</div>}
        </div>
    );
}

export default function ProviderPage() {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.resolve().then(() => {
            api.get("/v2/admin/platform-stats")
                .then(r => setStats(r.data.data))
                .catch(() => { })
                .finally(() => setLoading(false));
        });
    }, []);

    if (loading) return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ height: "140px", borderRadius: "18px" }} />)}
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ paddingBottom: "40px" }}>
            <div style={{ marginBottom: "36px" }}>
                <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>TAGT Control Room</div>
                <h1 className="display-text" style={{ fontSize: "32px", marginBottom: "6px" }}>Platform Overview</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Global metrics across all properties and tenants</p>
            </div>

            {stats && (
                <>
                    {/* Occupancy header bar */}
                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "18px", padding: "24px", marginBottom: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Platform Occupancy</span>
                            <span style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, color: stats.platformOccupancyRate >= 80 ? "#34d399" : stats.platformOccupancyRate >= 60 ? "#fbbf24" : "var(--red)" }}>{stats.platformOccupancyRate}%</span>
                        </div>
                        <div style={{ height: "6px", background: "var(--border-subtle)", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${stats.platformOccupancyRate}%`, background: "linear-gradient(90deg, var(--accent-primary), #34d399)", borderRadius: "3px", transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)", boxShadow: "0 0 12px rgba(0,212,255,0.4)" }} />
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                        <BigStat label="Platform MRR" value={`₹${stats.platformMRR.toLocaleString()}`} color="#00d4ff" sub="Total from subscriptions" icon="📈" />
                        <BigStat label="Active Subs" value={stats.activeSubs} color="#a78bfa" sub="Pro + Enterprise" icon="💎" />
                        <BigStat label="Total Properties" value={stats.totalProperties} color="var(--accent-primary)" sub="On the platform" icon="🏢" />
                        <BigStat label="Total Residents" value={stats.totalResidents} color="#34d399" sub="Active tenants" icon="👥" />
                        <BigStat label="Rent Collected" value={`₹${(stats.totalRentCollected / 1000).toFixed(0)}k`} color="#34d399" sub="All-time processed" icon="💰" />
                        <BigStat label="Late Fees" value={`₹${stats.totalLateFeesCollected.toLocaleString()}`} color="#fbbf24" sub="All-time" icon="⏰" />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "20px", alignItems: "start" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {/* Top Properties Table */}
                            <div className="glass-card" style={{ padding: "24px" }}>
                                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
                                    <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: "var(--accent-primary)" }}></span>
                                    Top Revenue Generating Properties
                                </h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {stats.topProperties.map((p, i) => (
                                        <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <span style={{ fontSize: "12px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", width: "20px" }}>0{i + 1}</span>
                                                <span style={{ fontSize: "14px", fontWeight: 600 }}>{p.name}</span>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <div style={{ fontSize: "14px", fontWeight: 700, color: "#34d399" }}>₹{p.revenue.toLocaleString()}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {stats.topProperties.length === 0 && (
                                        <div style={{ padding: "30px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "13px" }}>No revenue data yet.</div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Activity Feed */}
                            <div className="glass-card" style={{ padding: "24px" }}>
                                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
                                    <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#f472b6" }}></span>
                                    Living Feed: Platform Activity
                                </h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    {stats.recentActivity?.map((act) => (
                                        <div key={act.id} style={{ display: "flex", gap: "16px", paddingBottom: "16px", borderBottom: "1px solid var(--border-subtle)" }}>
                                            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>⚡</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{act.userName}</span>
                                                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{new Date(act.createdAt).toLocaleTimeString()}</span>
                                                </div>
                                                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{act.action.replace(/_/g, " ")}: {act.details?.propertyId || "System"}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!stats.recentActivity || stats.recentActivity.length === 0) && (
                                        <div style={{ padding: "20px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "12px" }}>No recent activity.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {/* Subscription Info */}
                            <div style={{ padding: "24px", background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.1)", borderRadius: "20px" }}>
                                <div style={{ fontSize: "32px", marginBottom: "12px" }}>💸</div>
                                <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Platform Economics</h3>
                                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "16px" }}>
                                    Your platform currently supports <strong>{stats.activeSubs} premium partners</strong>. Revenue is calculated based on the current monthly subscription tiers.
                                </p>
                                <div style={{ paddingTop: "16px", borderTop: "1px solid rgba(0,212,255,0.1)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "8px" }}>
                                        <span style={{ color: "var(--text-tertiary)" }}>Conversion Rate</span>
                                        <span>{((stats.activeSubs / (stats.totalOwners || 1)) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px" }}>
                                        <div style={{ height: "100%", width: `${(stats.activeSubs / (stats.totalOwners || 1)) * 100}%`, background: "#00d4ff", borderRadius: "2px" }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="glass-card" style={{ padding: "24px" }}>
                                <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px" }}>Quick Controls</h3>
                                <div style={{ display: "grid", gap: "8px" }}>
                                    <button onClick={() => window.location.href = '/provider/owners'} style={{ padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)", fontSize: "12px", textAlign: "left", cursor: "pointer" }}>Manage Owners</button>
                                    <button onClick={() => window.location.href = '/provider/subscriptions'} style={{ padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)", fontSize: "12px", textAlign: "left", cursor: "pointer" }}>Billing Control</button>
                                    <button onClick={() => window.location.href = '/provider/support'} style={{ padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)", fontSize: "12px", textAlign: "left", cursor: "pointer" }}>Support Tickets</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

