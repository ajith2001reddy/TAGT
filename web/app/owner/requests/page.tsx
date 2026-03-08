"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

interface Request {
    _id: string;
    message?: string;
    description?: string;
    priority: string;
    status: string;
    createdAt: string;
    resident?: { name: string; email: string };
    title?: string;
}

const PRIORITY_COLOR: Record<string, { bg: string; text: string }> = {
    low: { bg: "rgba(52,211,153,0.1)", text: "#34d399" },
    medium: { bg: "rgba(251,191,36,0.1)", text: "#fbbf24" },
    high: { bg: "rgba(255,82,82,0.1)", text: "#ff5252" },
};

const STATUS_OPTS = ["pending", "in-progress", "resolved"] as const;
const STATUS_COLOR: Record<string, string> = {
    pending: "#fbbf24",
    "in-progress": "var(--accent-primary)",
    resolved: "#34d399",
};
const STATUS_ICON: Record<string, string> = {
    pending: "🕐", "in-progress": "🔧", resolved: "✅",
};

function StatusSelector({ requestId, current, onChanged }: { requestId: string; current: string; onChanged: () => void }) {
    const [saving, setSaving] = useState(false);

    async function update(newStatus: string) {
        if (newStatus === current) return;
        setSaving(true);
        try {
            await api.patch(`/v2/requests/${requestId}`, { status: newStatus });
            onChanged();
        } catch { } finally { setSaving(false); }
    }

    return (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {STATUS_OPTS.map(s => {
                const active = s === current;
                const col = STATUS_COLOR[s];
                return (
                    <button
                        key={s}
                        onClick={() => update(s)}
                        disabled={saving || active}
                        style={{
                            fontSize: "10px", fontFamily: "var(--font-mono)", fontWeight: active ? 700 : 400,
                            letterSpacing: "0.08em", textTransform: "capitalize", padding: "4px 10px",
                            borderRadius: "6px", border: `1px solid ${active ? col + "40" : "var(--border-subtle)"}`,
                            background: active ? col + "18" : "transparent",
                            color: active ? col : "var(--text-tertiary)",
                            cursor: active ? "default" : "pointer", transition: "all 0.15s",
                        }}
                    >
                        {STATUS_ICON[s]} {s}
                    </button>
                );
            })}
        </div>
    );
}

export default function OwnerRequestsPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [filterPriority, setFilterPriority] = useState<string>("");

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/v2/requests");
            setRequests(res.data.data || []);
        } catch { } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchRequests(); }, [fetchRequests]);

    const filtered = requests.filter(r => {
        if (filterStatus && r.status !== filterStatus) return false;
        if (filterPriority && r.priority !== filterPriority) return false;
        return true;
    });

    const pending = requests.filter(r => r.status === "pending").length;
    const inProgress = requests.filter(r => r.status === "in-progress").length;
    const resolved = requests.filter(r => r.status === "resolved").length;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ marginBottom: "28px" }}>
                <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Maintenance</div>
                <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "4px" }}>Resident Requests</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{requests.length} total · {pending + inProgress} need attention</p>
            </div>

            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px", marginBottom: "24px" }}>
                {[
                    { label: "Pending", count: pending, color: "#fbbf24" },
                    { label: "Processing", count: inProgress, color: "var(--accent-primary)" },
                    { label: "Resolved", count: resolved, color: "#34d399" },
                    { label: "Total", count: requests.length, color: "var(--text-primary)" },
                ].map(({ label, count, color }) => (
                    <div key={label} style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "14px", padding: "16px" }}>
                        <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "6px" }}>{label}</div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 700, color }}>{count}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
                <select
                    className="input-field"
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    style={{ width: "160px", fontSize: "13px", padding: "9px 12px" }}
                >
                    <option value="">All statuses</option>
                    {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                    className="input-field"
                    value={filterPriority}
                    onChange={e => setFilterPriority(e.target.value)}
                    style={{ width: "160px", fontSize: "13px", padding: "9px 12px" }}
                >
                    <option value="">All priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
                {(filterStatus || filterPriority) && (
                    <button className="btn-ghost" onClick={() => { setFilterStatus(""); setFilterPriority(""); }} style={{ fontSize: "12px", padding: "9px 14px" }}>
                        Clear filters
                    </button>
                )}
            </div>

            {/* Request cards */}
            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: "110px", borderRadius: "14px" }} />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-card" style={{ padding: "60px", textAlign: "center" }}>
                    <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</div>
                    <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "6px" }}>{requests.length === 0 ? "No requests yet" : "No matches"}</div>
                    <div style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>
                        {requests.length === 0 ? "Residents haven't submitted any requests." : "Try clearing your filters."}
                    </div>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {filtered.map((r, i) => {
                        const text = r.description || r.message || "—";
                        const pColor = PRIORITY_COLOR[r.priority] || PRIORITY_COLOR.medium;
                        return (
                            <div
                                key={r._id}
                                className="animate-fade-up glass-card"
                                style={{ padding: "20px 24px", animationDelay: `${i * 0.03}s` }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "10px", flexWrap: "wrap" }}>
                                    {/* Resident + message */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px", flexWrap: "wrap" }}>
                                            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "14px" }}>
                                                {r.resident?.name || "Unknown resident"}
                                            </span>
                                            <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{r.resident?.email || ""}</span>
                                        </div>
                                        <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                                            {text.length > 200 ? text.slice(0, 200) + "…" : text}
                                        </div>
                                    </div>

                                    {/* Priority badge */}
                                    <span style={{
                                        fontSize: "10px", fontFamily: "var(--font-mono)", fontWeight: 700,
                                        letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 10px",
                                        borderRadius: "6px", background: pColor.bg, color: pColor.text, flexShrink: 0,
                                    }}>
                                        {r.priority}
                                    </span>
                                </div>

                                {/* Status controls + timestamp */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                                    <StatusSelector requestId={r._id} current={r.status} onChanged={fetchRequests} />
                                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                                        {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
