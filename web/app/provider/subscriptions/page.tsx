"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Sub { owner: { name: string; email: string } | string; plan: string; status: string; currentPeriodEnd?: string; }

const PLAN_COLOR: Record<string, string> = { free: "var(--text-tertiary)", pro: "var(--accent-primary)", enterprise: "#a78bfa" };
const STATUS_COLOR: Record<string, string> = { active: "#34d399", trialing: "#fbbf24", past_due: "#ff5252", cancelled: "var(--text-tertiary)", expired: "var(--text-tertiary)" };

export default function AdminSubscriptionsPage() {
    const [subs, setSubs] = useState<Sub[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<{ email: string; plan: string } | null>(null);

    async function fetchSubs() {
        const res = await api.get("/v2/admin/subscriptions");
        setSubs(res.data.data || []);
        setLoading(false);
    }
    useEffect(() => { fetchSubs().catch(console.error); }, []);

    const totals = { free: 0, pro: 0, enterprise: 0 };
    subs.forEach(s => { if (totals[s.plan as keyof typeof totals] !== undefined) totals[s.plan as keyof typeof totals]++; });

    async function handleSetPlan(ownerId: string, plan: string) {
        await api.patch(`/v2/admin/subscriptions/${ownerId}`, { plan });
        setEditing(null);
        fetchSubs();
    }

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "28px" }}>
                <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Platform</div>
                <h1 className="display-text" style={{ fontSize: "30px", marginBottom: "4px" }}>Subscriptions</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Manage owner billing plans</p>
            </div>

            {/* Plan summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "24px" }}>
                {[
                    { plan: "free", label: "Free", count: totals.free, color: PLAN_COLOR.free },
                    { plan: "pro", label: "Pro", count: totals.pro, color: PLAN_COLOR.pro },
                    { plan: "enterprise", label: "Enterprise", count: totals.enterprise, color: PLAN_COLOR.enterprise },
                ].map(({ label, count, color }) => (
                    <div key={label} style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "14px", padding: "18px" }}>
                        <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>{label}</div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, color }}>{count}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>owners</div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="glass-card" style={{ overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                            {["Owner", "Plan", "Status", "Renewal", "Actions"].map(h => (
                                <th key={h} style={{ padding: "13px 18px", textAlign: "left", fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", fontWeight: 500 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading
                            ? Array.from({ length: 6 }).map((_, i) => <tr key={i}><td colSpan={5} style={{ padding: "12px 18px" }}><div className="skeleton" style={{ height: "18px", borderRadius: "5px" }} /></td></tr>)
                            : subs.map((sub, i) => {
                                const owner = sub.owner as any;
                                const ownerId = owner?._id;
                                return (
                                    <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.12s" }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-card-hover)"}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}>
                                        <td style={{ padding: "14px 18px" }}>
                                            <div style={{ fontSize: "14px", fontWeight: 600 }}>{owner?.name || "—"}</div>
                                            <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{owner?.email || ""}</div>
                                        </td>
                                        <td style={{ padding: "14px 18px" }}>
                                            <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", fontWeight: 700, textTransform: "capitalize", background: (PLAN_COLOR[sub.plan] || "#666") + "15", color: PLAN_COLOR[sub.plan] || "var(--text-tertiary)", border: `1px solid ${PLAN_COLOR[sub.plan] || "#666"}25`, padding: "4px 10px", borderRadius: "6px", letterSpacing: "0.08em" }}>{sub.plan}</span>
                                        </td>
                                        <td style={{ padding: "14px 18px" }}>
                                            <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", fontWeight: 700, textTransform: "capitalize", color: STATUS_COLOR[sub.status] || "var(--text-tertiary)" }}>{sub.status || "active"}</span>
                                        </td>
                                        <td style={{ padding: "14px 18px", fontSize: "12px", color: "var(--text-tertiary)" }}>
                                            {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString("en-IN") : "—"}
                                        </td>
                                        <td style={{ padding: "14px 18px" }}>
                                            {ownerId && (
                                                <select
                                                    defaultValue={sub.plan}
                                                    onChange={e => handleSetPlan(ownerId, e.target.value)}
                                                    className="input-field"
                                                    style={{ width: "130px", fontSize: "12px", padding: "6px 10px" }}
                                                >
                                                    <option value="free">Free</option>
                                                    <option value="pro">Pro</option>
                                                    <option value="enterprise">Enterprise</option>
                                                </select>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}
