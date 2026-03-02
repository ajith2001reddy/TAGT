"use client";

import { useState } from "react";
import { api } from "@/lib/api";

const reports = [
    {
        id: "monthly-revenue",
        title: "Monthly Revenue Report",
        desc: "All paid rent for a given month including late fees.",
        icon: "💰",
        color: "#34d399",
        endpoint: "/v2/reports/monthly-revenue.csv",
        hasMonthPicker: true,
    },
    {
        id: "outstanding",
        title: "Outstanding Payments",
        desc: "All pending and overdue bills with days overdue.",
        icon: "⏳",
        color: "#fbbf24",
        endpoint: "/v2/reports/outstanding.csv",
        hasMonthPicker: false,
    },
    {
        id: "resident-ledger",
        title: "Resident Ledger",
        desc: "Full payment history per resident — rent, late fees, totals.",
        icon: "📒",
        color: "var(--accent-primary)",
        endpoint: "/v2/reports/resident-ledger.csv",
        hasMonthPicker: false,
    },
];

export default function ReportsPage() {
    const [months, setMonths] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});

    async function download(report: typeof reports[0]) {
        setLoading(l => ({ ...l, [report.id]: true }));
        try {
            const params = report.hasMonthPicker && months[report.id] ? `?month=${months[report.id]}` : "";
            const res = await api.get(`${report.endpoint}${params}`, { responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
            const a = document.createElement("a");
            a.href = url;
            a.download = `${report.id}-${months[report.id] || new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (e) {
            console.error("Download failed", e);
        } finally {
            setLoading(l => ({ ...l, [report.id]: false }));
        }
    }

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "36px" }}>
                <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Exports</div>
                <h1 className="display-text" style={{ fontSize: "30px", marginBottom: "4px" }}>Reports</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Download business-ready CSV reports for your records</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                {reports.map((report, i) => (
                    <div key={report.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
                        <div style={{
                            background: "var(--bg-card)", border: "1px solid var(--border-default)",
                            borderRadius: "18px", padding: "24px", position: "relative", overflow: "hidden",
                            transition: "all 0.25s ease",
                        }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)"; (e.currentTarget as HTMLElement).style.transform = ""; }}
                        >
                            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${report.color}60, transparent)` }} />

                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                                <span style={{ fontSize: "28px" }}>{report.icon}</span>
                                <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", background: `${report.color}15`, color: report.color, border: `1px solid ${report.color}30`, padding: "3px 9px", borderRadius: "6px", letterSpacing: "0.08em" }}>CSV</span>
                            </div>

                            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>{report.title}</h3>
                            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px", lineHeight: 1.5 }}>{report.desc}</p>

                            {report.hasMonthPicker && (
                                <div style={{ marginBottom: "14px" }}>
                                    <label style={{ display: "block", fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "6px" }}>Month (optional)</label>
                                    <input
                                        type="month"
                                        className="input-field"
                                        style={{ padding: "9px 12px", fontSize: "13px" }}
                                        value={months[report.id] || ""}
                                        onChange={e => setMonths(m => ({ ...m, [report.id]: e.target.value }))}
                                    />
                                </div>
                            )}

                            <button
                                className="btn-primary"
                                style={{ width: "100%", gap: "8px", fontSize: "13px" }}
                                onClick={() => download(report)}
                                disabled={loading[report.id]}
                            >
                                {loading[report.id] ? (
                                    <div style={{ width: "14px", height: "14px", border: "2px solid #000", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                                ) : (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                )}
                                {loading[report.id] ? "Generating…" : "Download CSV"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Info note */}
            <div style={{ marginTop: "28px", padding: "16px 20px", background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.1)", borderRadius: "12px", fontSize: "13px", color: "var(--text-secondary)", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" style={{ marginTop: "1px", flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Reports are scoped to your property. Data is real-time. These CSVs are compatible with Excel, Google Sheets, and accounting software.
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
