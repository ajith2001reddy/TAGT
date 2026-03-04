"use client";

import { useEffect, useState } from "react";
import { fetchPayments, markPaymentPaid, Payment } from "@/features/owner/payments.service";
import { api } from "@/lib/api";

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
    paid: { color: "var(--green)", bg: "var(--green-bg)", border: "rgba(0,230,118,0.2)", label: "Paid" },
    pending: { color: "var(--yellow)", bg: "var(--yellow-bg)", border: "rgba(255,215,64,0.2)", label: "Pending" },
    overdue: { color: "var(--red)", bg: "var(--red-bg)", border: "rgba(255,82,82,0.2)", label: "Overdue" },
    failed: { color: "#ff1744", bg: "rgba(255,23,68,0.06)", border: "rgba(255,23,68,0.2)", label: "Failed" },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            fontSize: "10px", fontFamily: "var(--font-mono)", fontWeight: 700,
            letterSpacing: "0.08em", textTransform: "uppercase",
            padding: "4px 10px", borderRadius: "6px",
            color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
        }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: cfg.color, display: "inline-block" }} />
            {cfg.label}
        </span>
    );
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [markingId, setMarkingId] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    async function load() {
        const data = await fetchPayments();
        setPayments(data);
    }
    useEffect(() => { load().finally(() => setLoading(false)); }, []);

    async function handleMarkPaid(id: string) {
        setMarkingId(id);
        try { await markPaymentPaid(id); await load(); }
        finally { setMarkingId(null); }
    }

    async function handleDownload(payment: Payment) {
        setDownloadingId(payment._id);
        try {
            const response = await api.get(`/v2/payments/${payment._id}/invoice`, { responseType: "blob" });
            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = `invoice-${payment._id}.pdf`;
            document.body.appendChild(a); a.click(); a.remove();
        } catch { /* silent */ }
        finally { setDownloadingId(null); }
    }

    const filtered = payments.filter(p => filter === "all" || p.status === filter);

    const totalCollected = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
    const totalPending = payments.filter(p => p.status !== "paid").reduce((s, p) => s + p.amount, 0);
    const overdueCount = payments.filter(p => p.status === "overdue").length;

    const filters = [
        { key: "all", label: "All", count: payments.length },
        { key: "pending", label: "Pending", count: payments.filter(p => p.status === "pending").length },
        { key: "overdue", label: "Overdue", count: payments.filter(p => p.status === "overdue").length },
        { key: "paid", label: "Paid", count: payments.filter(p => p.status === "paid").length },
    ];

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
                <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Finance</div>
                <h1 className="display-text" style={{ fontSize: "30px", marginBottom: "4px" }}>Payments</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Track rent collection and download invoices</p>
            </div>

            {/* Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "28px" }}>
                {[
                    { label: "Collected", value: `₹${(totalCollected / 1000).toFixed(1)}k`, color: "#34d399", icon: "↑" },
                    { label: "Outstanding", value: `₹${(totalPending / 1000).toFixed(1)}k`, color: "#fbbf24", icon: "⏳" },
                    { label: "Overdue", value: overdueCount, color: "var(--red)", suffix: " bills", icon: "⚠" },
                ].map(({ label, value, color, icon, suffix }) => (
                    <div key={label} style={{
                        background: "var(--bg-card)", border: "1px solid var(--border-default)",
                        borderRadius: "16px", padding: "20px 24px", position: "relative", overflow: "hidden",
                    }}>
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }} />
                        <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>{label}</div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 700, letterSpacing: "-0.03em", color }}>
                            {value}{suffix}
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Tabs */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "20px", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "5px" }}>
                {filters.map(({ key, label, count }) => (
                    <button key={key} onClick={() => setFilter(key)} style={{
                        flex: 1, padding: "8px 12px", borderRadius: "8px", border: "none", cursor: "pointer",
                        background: filter === key ? "var(--accent-primary)" : "transparent",
                        color: filter === key ? "#000" : "var(--text-secondary)",
                        fontSize: "13px", fontWeight: filter === key ? 700 : 400,
                        fontFamily: filter === key ? "var(--font-display)" : "var(--font-body)",
                        transition: "all 0.18s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                    }}>
                        {label}
                        <span style={{
                            fontSize: "10px", fontFamily: "var(--font-mono)", fontWeight: 700,
                            background: filter === key ? "rgba(0,0,0,0.15)" : "var(--bg-elevated)",
                            color: filter === key ? "#000" : "var(--text-tertiary)",
                            padding: "1px 7px", borderRadius: "4px",
                        }}>{count}</span>
                    </button>
                ))}
            </div>

            {/* Payments Table */}
            <div className="glass-card" style={{ overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                            {["Resident", "Month", "Amount", "Status", "Actions"].map(h => (
                                <th key={h} style={{
                                    padding: "14px 20px", textAlign: h === "Actions" ? "right" : "left",
                                    fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em",
                                    textTransform: "uppercase", color: "var(--text-tertiary)", fontWeight: 500,
                                }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}><td colSpan={5} style={{ padding: "12px 20px" }}>
                                    <div className="skeleton" style={{ height: "20px", borderRadius: "6px" }} />
                                </td></tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "14px" }}>
                                No {filter === "all" ? "" : filter} payments found
                            </td></tr>
                        ) : filtered.map(payment => (
                            <tr key={payment._id} style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.15s" }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-card-hover)"}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}>
                                <td style={{ padding: "16px 20px" }}>
                                    <div style={{ fontWeight: 500, fontSize: "14px" }}>{payment.resident?.name || "—"}</div>
                                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>{payment.resident?.email}</div>
                                </td>
                                <td style={{ padding: "16px 20px" }}>
                                    <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "3px 9px" }}>
                                        {payment.month}
                                    </span>
                                </td>
                                <td style={{ padding: "16px 20px" }}>
                                    <div style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 700, letterSpacing: "-0.02em" }}>
                                        ₹{(payment.amount ?? 0).toLocaleString()}
                                    </div>
                                </td>
                                <td style={{ padding: "16px 20px" }}>
                                    <StatusBadge status={payment.status} />
                                </td>
                                <td style={{ padding: "16px 20px" }}>
                                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                        {payment.status !== "paid" && (
                                            <button
                                                onClick={() => handleMarkPaid(payment._id)}
                                                disabled={markingId === payment._id}
                                                style={{
                                                    padding: "7px 14px", borderRadius: "8px", border: "1px solid rgba(0,230,118,0.25)",
                                                    background: "var(--green-bg)", color: "var(--green)",
                                                    fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s ease",
                                                    opacity: markingId === payment._id ? 0.6 : 1,
                                                }}
                                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(0,230,118,0.14)"}
                                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--green-bg)"}
                                            >
                                                {markingId === payment._id ? "…" : "Mark Paid"}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDownload(payment)}
                                            disabled={downloadingId === payment._id}
                                            style={{
                                                padding: "7px 14px", borderRadius: "8px", border: "1px solid var(--border-default)",
                                                background: "transparent", color: "var(--text-secondary)",
                                                fontSize: "12px", fontWeight: 500, cursor: "pointer", transition: "all 0.15s ease",
                                                display: "flex", alignItems: "center", gap: "6px",
                                            }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-primary)"; (e.currentTarget as HTMLElement).style.color = "var(--accent-primary)"; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
                                        >
                                            {downloadingId === payment._id
                                                ? <div style={{ width: "11px", height: "11px", border: "2px solid var(--accent-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                                                : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                            }
                                            Invoice
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}