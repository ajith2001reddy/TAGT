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
}

function BigStat({ label, value, color, sub, icon }: any) {
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
        api.get("/v2/admin/platform-stats").then(r => setStats(r.data.data)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ height: "140px", borderRadius: "18px" }} />)}
        </div>
    );

    return (
        <div className="animate-fade-in">
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
                            <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Platform Occupancy Rate</span>
                            <span style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, color: stats.platformOccupancyRate >= 80 ? "#34d399" : stats.platformOccupancyRate >= 60 ? "#fbbf24" : "var(--red)" }}>{stats.platformOccupancyRate}%</span>
                        </div>
                        <div style={{ height: "6px", background: "var(--border-subtle)", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${stats.platformOccupancyRate}%`, background: "linear-gradient(90deg, var(--accent-primary), #34d399)", borderRadius: "3px", transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)", boxShadow: "0 0 12px rgba(0,212,255,0.4)" }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "12px", color: "var(--text-tertiary)" }}>
                            <span>{stats.occupiedBeds} beds occupied</span>
                            <span>{stats.totalBeds} total beds</span>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                        <BigStat label="Platform MRR" value={`₹${stats.platformMRR.toLocaleString()}`} color="#00d4ff" sub="Total from subscriptions" icon="📈" />
                        <BigStat label="Active Subscriptions" value={stats.activeSubs} color="#a78bfa" sub="Pro + Enterprise" icon="💎" />
                        <BigStat label="Total Properties" value={stats.totalProperties} color="var(--accent-primary)" sub="On the platform" icon="🏢" />
                        <BigStat label="Total Owners" value={stats.totalOwners} color="#a78bfa" sub="Active accounts" icon="👤" />
                        <BigStat label="Total Residents" value={stats.totalResidents} color="#34d399" sub="Active tenants" icon="👥" />
                        <BigStat label="Rent Collected" value={`₹${(stats.totalRentCollected / 1000).toFixed(0)}k`} color="#34d399" sub="All-time processed" icon="💰" />
                        <BigStat label="Late Fees Earned" value={`₹${stats.totalLateFeesCollected.toLocaleString()}`} color="#fbbf24" sub="All-time" icon="⏰" />
                        <BigStat label="Unpaid Bills" value={stats.activeUnpaidBills} color="var(--red)" sub="Pending + overdue" icon="⚠" />
                    </div>

                    {/* Subscription breakdown note */}
                    <div style={{ padding: "20px 24px", background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.1)", borderRadius: "14px", display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ fontSize: "28px" }}>💰</div>
                        <div>
                            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>Revenue Attribution</div>
                            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Your platform is currently generating monthly revenue from {stats.activeSubs} premium partners. Visit the billing tab to manage tiered limits.</div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}