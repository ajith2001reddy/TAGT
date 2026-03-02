"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Request {
    _id: string;
    message?: string;
    description?: string;
    priority: string;
    status: string;
    createdAt: string;
    title?: string;
}

const PRIORITY_COLOR: Record<string, { bg: string; text: string; border: string }> = {
    low: { bg: "rgba(52,211,153,0.1)", text: "#34d399", border: "rgba(52,211,153,0.2)" },
    medium: { bg: "rgba(251,191,36,0.1)", text: "#fbbf24", border: "rgba(251,191,36,0.2)" },
    high: { bg: "rgba(255,82,82,0.1)", text: "#ff5252", border: "rgba(255,82,82,0.2)" },
};

const STATUS_COLOR: Record<string, string> = {
    pending: "#fbbf24",
    open: "var(--accent-primary)",
    resolved: "#34d399",
    closed: "var(--text-tertiary)",
};

const STATUS_ICON: Record<string, string> = {
    pending: "🕐", open: "🔧", resolved: "✅", closed: "🔒",
};

export default function ResidentRequestsPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState("");
    const [priority, setPriority] = useState("medium");
    const [successMsg, setSuccessMsg] = useState("");
    const [error, setError] = useState("");

    async function fetchRequests() {
        try {
            const res = await api.get("/v2/requests");
            setRequests(res.data.data || []);
        } catch { }
        finally { setLoading(false); }
    }

    useEffect(() => { fetchRequests(); }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!message.trim()) { setError("Please describe your request"); return; }
        setSubmitting(true);
        setError("");
        try {
            await api.post("/v2/resident/requests", { message: message.trim(), priority });
            setMessage("");
            setPriority("medium");
            setShowForm(false);
            setSuccessMsg("Request submitted! Your property manager will review it.");
            setTimeout(() => setSuccessMsg(""), 5000);
            fetchRequests();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to submit request");
        } finally { setSubmitting(false); }
    }

    const pending = requests.filter(r => r.status === "pending" || r.status === "open").length;
    const resolved = requests.filter(r => r.status === "resolved").length;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                    <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Maintenance</div>
                    <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "4px" }}>My Requests</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{pending} open · {resolved} resolved</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => { setShowForm(!showForm); setError(""); }}
                    style={{ gap: "8px", fontSize: "13.5px" }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    New Request
                </button>
            </div>

            {/* Success banner */}
            {successMsg && (
                <div className="animate-fade-in" style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: "12px", padding: "14px 18px", marginBottom: "20px", color: "#34d399", fontSize: "13px", display: "flex", gap: "10px", alignItems: "center" }}>
                    ✅ {successMsg}
                </div>
            )}

            {/* Submit form */}
            {showForm && (
                <div className="animate-fade-up glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 700, marginBottom: "20px" }}>Submit a Maintenance Request</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: "16px" }}>
                            <label style={{ display: "block", fontSize: "12px", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Priority</label>
                            <div style={{ display: "flex", gap: "8px" }}>
                                {(["low", "medium", "high"] as const).map(p => {
                                    const c = PRIORITY_COLOR[p];
                                    const active = priority === p;
                                    return (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPriority(p)}
                                            style={{ padding: "8px 16px", borderRadius: "8px", border: `1px solid ${active ? c.border : "var(--border-default)"}`, background: active ? c.bg : "transparent", color: active ? c.text : "var(--text-secondary)", fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: active ? 700 : 400, cursor: "pointer", textTransform: "capitalize", transition: "all 0.15s" }}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ marginBottom: "16px" }}>
                            <label style={{ display: "block", fontSize: "12px", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Describe your issue</label>
                            <textarea
                                className="input-field"
                                placeholder="e.g. The bathroom tap is leaking. It started 2 days ago and is getting worse…"
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                rows={4}
                                style={{ width: "100%", resize: "vertical", fontSize: "13px" }}
                            />
                        </div>

                        {error && <div style={{ marginBottom: "12px", fontSize: "13px", color: "#ff5252" }}>⚠ {error}</div>}

                        <div style={{ display: "flex", gap: "10px" }}>
                            <button type="submit" className="btn-primary" disabled={submitting} style={{ fontSize: "13px" }}>
                                {submitting ? "Submitting…" : "Submit Request"}
                            </button>
                            <button type="button" className="btn-ghost" onClick={() => { setShowForm(false); setError(""); }} style={{ fontSize: "13px" }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Request list */}
            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: "90px", borderRadius: "14px" }} />
                    ))}
                </div>
            ) : requests.length === 0 ? (
                <div className="glass-card" style={{ padding: "60px", textAlign: "center" }}>
                    <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔧</div>
                    <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "6px" }}>No requests yet</div>
                    <div style={{ color: "var(--text-tertiary)", fontSize: "13px", marginBottom: "20px" }}>Submit your first maintenance request and your manager will be notified.</div>
                    <button className="btn-primary" onClick={() => setShowForm(true)}>Submit a Request</button>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {requests.map((r, i) => {
                        const pColor = PRIORITY_COLOR[r.priority] || PRIORITY_COLOR.medium;
                        const sColor = STATUS_COLOR[r.status] || "var(--text-tertiary)";
                        const text = r.description || r.message || "—";
                        return (
                            <div key={r._id} className="animate-fade-up glass-card" style={{ padding: "18px 22px", animationDelay: `${i * 0.04}s`, display: "flex", gap: "16px", alignItems: "flex-start" }}>
                                {/* Status icon */}
                                <div style={{ fontSize: "22px", flexShrink: 0, marginTop: "2px" }}>{STATUS_ICON[r.status] || "📋"}</div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "6px", flexWrap: "wrap" }}>
                                        <div style={{ fontSize: "14px", fontWeight: 600, flex: 1 }}>{text.length > 120 ? text.slice(0, 120) + "…" : text}</div>
                                        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                                            <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase", background: pColor.bg, color: pColor.text, border: `1px solid ${pColor.border}`, padding: "3px 9px", borderRadius: "6px", fontWeight: 700 }}>{r.priority}</span>
                                            <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase", background: sColor + "18", color: sColor, border: `1px solid ${sColor}28`, padding: "3px 9px", borderRadius: "6px", fontWeight: 700 }}>{r.status}</span>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                                        Submitted {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
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
