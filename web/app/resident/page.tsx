"use client";

import { useResidentDashboard } from "@/features/resident/useResidentDashboard";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function ResidentPage() {
    const { payments, requests, loading } = useResidentDashboard();

    if (loading) {
        return (
            <div>
                <div className="skeleton" style={{ height: "32px", width: "200px", marginBottom: "28px" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: "72px", borderRadius: "12px" }} />
                    ))}
                </div>
            </div>
        );
    }

    const totalDue = payments.filter(p => p.status === "pending" || p.status === "overdue")
        .reduce((sum, p) => sum + (p.amount || 0), 0);

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "32px" }}>
                <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "6px" }}>My Dashboard</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                    Track your payments and maintenance requests
                </p>
            </div>

            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "14px", marginBottom: "36px" }}>
                {[
                    { label: "Total Payments", value: payments.length, accent: "var(--accent-primary)" },
                    { label: "Outstanding", value: `₹${totalDue.toLocaleString()}`, accent: "var(--yellow)" },
                    { label: "Open Requests", value: requests.filter(r => r.status !== "resolved").length, accent: "#7c3aed" },
                ].map(card => (
                    <div key={card.label} className="stat-card" style={{ padding: "20px" }}>
                        <div className="label-text" style={{ marginBottom: "12px" }}>{card.label}</div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 700, color: card.accent, letterSpacing: "-0.03em" }}>
                            {card.value}
                        </div>
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, ${card.accent}40, transparent)`, borderRadius: "0 0 16px 16px" }} />
                    </div>
                ))}
            </div>

            {/* Payments section */}
            <section style={{ marginBottom: "36px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 600 }}>Payment History</h2>
                    <span style={{ padding: "2px 8px", borderRadius: "6px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", fontSize: "12px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                        {payments.length}
                    </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {payments.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-tertiary)", fontSize: "14px", border: "1px dashed var(--border-subtle)", borderRadius: "12px" }}>
                            No payment records yet
                        </div>
                    ) : payments.map((payment, i) => (
                        <div
                            key={payment._id}
                            className="data-row animate-fade-up"
                            style={{ gridTemplateColumns: "1fr 140px 100px", animationDelay: `${i * 0.04}s` }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{
                                    width: "36px", height: "36px", borderRadius: "10px",
                                    background: payment.status === "paid" ? "var(--green-bg)" : payment.status === "overdue" ? "var(--red-bg)" : "var(--yellow-bg)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "16px", flexShrink: 0,
                                }}>
                                    {payment.status === "paid" ? "✓" : payment.status === "overdue" ? "!" : "○"}
                                </div>
                                <div>
                                    <div style={{ fontSize: "14px", fontWeight: 500 }}>Monthly Rent</div>
                                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{payment.month}</div>
                                </div>
                            </div>

                            <div style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600, letterSpacing: "-0.02em" }}>
                                ₹{(payment.amount || 0).toLocaleString()}
                            </div>

                            <StatusBadge status={payment.status} />
                        </div>
                    ))}
                </div>
            </section>

            {/* Requests section */}
            <section>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 600 }}>Maintenance Requests</h2>
                    <span style={{ padding: "2px 8px", borderRadius: "6px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", fontSize: "12px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                        {requests.length}
                    </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {requests.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-tertiary)", fontSize: "14px", border: "1px dashed var(--border-subtle)", borderRadius: "12px" }}>
                            No maintenance requests
                        </div>
                    ) : requests.map((req, i) => (
                        <div
                            key={req._id}
                            className="glass-card animate-fade-up"
                            style={{ padding: "18px 20px", animationDelay: `${i * 0.04}s` }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>{req.title}</div>
                                    <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{req.description}</div>
                                    <div style={{ marginTop: "8px", fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                                        {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </div>
                                </div>
                                <StatusBadge status={req.status} />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}