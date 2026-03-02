"use client";

import { usePayments } from "@/features/owner/usePayments";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useState } from "react";

export default function PaymentsPage() {
    const { payments, loading } = usePayments();
    const [filter, setFilter] = useState<string>("all");

    const filtered = filter === "all" ? payments : payments.filter(p => p.status === filter);

    const tabs = [
        { key: "all", label: "All" },
        { key: "pending", label: "Pending" },
        { key: "paid", label: "Paid" },
        { key: "overdue", label: "Overdue" },
    ];

    if (loading) {
        return (
            <div>
                <div className="skeleton" style={{ height: "32px", width: "180px", marginBottom: "24px" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: "64px", borderRadius: "12px" }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                    <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "6px" }}>Payments</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                        {payments.length} total records
                    </p>
                </div>
                <div style={{
                    display: "flex", gap: "2px", padding: "4px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "10px",
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            style={{
                                padding: "6px 14px", borderRadius: "7px", border: "none",
                                background: filter === tab.key ? "rgba(0,212,255,0.12)" : "transparent",
                                color: filter === tab.key ? "var(--accent-primary)" : "var(--text-secondary)",
                                fontSize: "12px", fontWeight: filter === tab.key ? 600 : 400,
                                cursor: "pointer", fontFamily: "var(--font-body)",
                                transition: "all 0.15s ease",
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table header */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 120px 100px",
                padding: "8px 20px",
                marginBottom: "4px",
                gap: "16px",
            }}>
                {["Resident", "Period", "Amount", "Status"].map(h => (
                    <span key={h} className="label-text">{h}</span>
                ))}
            </div>

            {/* Rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {filtered.length === 0 ? (
                    <div style={{
                        textAlign: "center", padding: "60px",
                        color: "var(--text-tertiary)", fontSize: "14px",
                        border: "1px dashed var(--border-subtle)", borderRadius: "12px",
                    }}>
                        No {filter !== "all" ? filter : ""} payments found
                    </div>
                ) : filtered.map((payment, i) => (
                    <div
                        key={payment._id}
                        className="data-row animate-fade-up"
                        style={{
                            gridTemplateColumns: "1fr 1fr 120px 100px",
                            animationDelay: `${i * 0.03}s`,
                        }}
                    >
                        <div>
                            <div style={{ fontSize: "14px", fontWeight: 500 }}>
                                {payment.resident?.name || "—"}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                                {payment.resident?.email || "—"}
                            </div>
                        </div>

                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-secondary)" }}>
                            {payment.month}
                        </div>

                        <div style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "16px", fontWeight: 600,
                            letterSpacing: "-0.02em",
                        }}>
                            ₹{(payment.amount || 0).toLocaleString()}
                        </div>

                        <div>
                            <StatusBadge status={payment.status} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}