"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Payment {
    _id: string; month: string; amount: number; status: string;
    lateFee?: number; totalPayable?: number; paidAt?: string; dueDate?: string; method?: string;
}

const STATUS_COLOR: Record<string, string> = {
    paid: "#34d399", pending: "#fbbf24", overdue: "#ff5252", failed: "#ff1744",
};

function InvoiceBtn({ paymentId }: { paymentId: string }) {
    const [loading, setLoading] = useState(false);
    async function download() {
        setLoading(true);
        try {
            const res = await api.get(`/v2/payments/${paymentId}/invoice`, { responseType: "blob" });
            const url = URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement("a"); a.href = url; a.download = `invoice-${paymentId}.pdf`;
            document.body.appendChild(a); a.click(); a.remove();
        } finally { setLoading(false); }
    }
    return (
        <button onClick={download} disabled={loading} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "var(--text-secondary)", fontSize: "12px", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-primary)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)"}>
            {loading ? <div style={{ width: "11px", height: "11px", border: "1.5px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} /> : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>}
            Invoice
        </button>
    );
}

function PayOnlineBtn({ payment, onPaid }: { payment: Payment; onPaid: () => void }) {
    const [loading, setLoading] = useState(false);
    const [stripeReady, setStripeReady] = useState<boolean | null>(null);

    useEffect(() => {
        api.get("/v2/stripe/status").then(r => setStripeReady(r.data.data.enabled)).catch(() => setStripeReady(false));
    }, []);

    async function pay() {
        setLoading(true);
        try {
            const res = await api.post("/v2/stripe/checkout-session", { paymentId: payment._id });
            window.location.href = res.data.data.url;
        } catch (err: any) {
            alert(err.response?.data?.message || "Unable to start payment. Contact your manager.");
            setLoading(false);
        }
    }

    if (stripeReady === null) return null;

    if (!stripeReady) return (
        <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)", padding: "4px 9px", borderRadius: "6px", letterSpacing: "0.08em" }}>PAY OFFLINE</span>
    );

    return (
        <button onClick={pay} disabled={loading} className="btn-primary" style={{ fontSize: "12px", padding: "7px 14px", gap: "6px" }}>
            {loading ? <div style={{ width: "11px", height: "11px", border: "1.5px solid #000", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} /> : "💳"}
            {loading ? "Redirecting…" : "Pay Online"}
        </button>
    );
}

export default function ResidentPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            if (params.get("success")) setSuccessMsg("Payment successful! Your receipt will be emailed.");
        }
        api.get("/v2/payments").then(r => setPayments(r.data.data || [])).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const totalPaid = payments.filter(p => p.status === "paid").reduce((s, p) => s + (p.totalPayable || p.amount || 0), 0);
    const totalDue = payments.filter(p => p.status !== "paid").reduce((s, p) => s + (p.amount || 0), 0);
    const overdue = payments.filter(p => p.status === "overdue").length;

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "28px" }}>
                <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Billing</div>
                <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "4px" }}>My Payments</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>View your rent history and pay online</p>
            </div>

            {successMsg && (
                <div className="animate-fade-in" style={{ background: "var(--green-bg)", border: "1px solid rgba(0,230,118,0.2)", borderRadius: "12px", padding: "14px 18px", marginBottom: "20px", color: "var(--green)", fontSize: "13px", display: "flex", gap: "10px" }}>
                    <span>✅</span> {successMsg}
                    <button onClick={() => setSuccessMsg("")} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--green)", cursor: "pointer", fontSize: "16px" }}>×</button>
                </div>
            )}

            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "14px", marginBottom: "28px" }}>
                {[
                    { label: "Total Paid", value: `₹${totalPaid.toLocaleString()}`, color: "#34d399" },
                    { label: "Currently Due", value: `₹${totalDue.toLocaleString()}`, color: totalDue > 0 ? "#fbbf24" : "#34d399" },
                    { label: "Overdue Bills", value: overdue, color: overdue > 0 ? "#ff5252" : "#34d399" },
                    { label: "Total Bills", value: payments.length, color: "var(--text-primary)" },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "14px", padding: "18px" }}>
                        <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>{label}</div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, color }}>{value}</div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="glass-card" style={{ overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                            {["Month", "Rent", "Late Fee", "Total", "Status", "Paid On", ""].map(h => (
                                <th key={h} style={{ padding: "13px 18px", textAlign: "left", fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", fontWeight: 500 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading
                            ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={7} style={{ padding: "12px 18px" }}><div className="skeleton" style={{ height: "18px", borderRadius: "5px" }} /></td></tr>)
                            : payments.length === 0
                                ? <tr><td colSpan={7} style={{ padding: "60px", textAlign: "center", color: "var(--text-tertiary)" }}>No payment records yet</td></tr>
                                : payments.map(p => (
                                    <tr key={p._id} style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.15s" }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-card-hover)"}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}>
                                        <td style={{ padding: "14px 18px", fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600 }}>{p.month}</td>
                                        <td style={{ padding: "14px 18px", fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 700 }}>₹{(p.amount || 0).toLocaleString()}</td>
                                        <td style={{ padding: "14px 18px", fontSize: "13px", color: p.lateFee ? "#ff5252" : "var(--text-tertiary)" }}>{p.lateFee ? `₹${p.lateFee}` : "—"}</td>
                                        <td style={{ padding: "14px 18px", fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 700 }}>₹{(p.totalPayable || p.amount || 0).toLocaleString()}</td>
                                        <td style={{ padding: "14px 18px" }}>
                                            <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.08em", padding: "4px 9px", borderRadius: "6px", textTransform: "uppercase", background: STATUS_COLOR[p.status] + "15", color: STATUS_COLOR[p.status], border: `1px solid ${STATUS_COLOR[p.status]}25` }}>{p.status}</span>
                                        </td>
                                        <td style={{ padding: "14px 18px", fontSize: "12px", color: "var(--text-tertiary)" }}>{p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-IN") : "—"}</td>
                                        <td style={{ padding: "14px 18px" }}>
                                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                {p.status === "paid" && <InvoiceBtn paymentId={p._id} />}
                                                {(p.status === "pending" || p.status === "overdue") && <PayOnlineBtn payment={p} onPaid={() => { }} />}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                        }
                    </tbody>
                </table>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
