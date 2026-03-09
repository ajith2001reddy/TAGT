"use client";

import { FileText, Download, ShieldCheck, Info } from "lucide-react";

export default function LeaseClient() {
    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "32px" }}>
                <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "8px" }}>Lease & Documents</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Access your rental agreement and property guidelines.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }}>
                <div>
                    <div className="glass-card" style={{ padding: "32px", borderRadius: "24px", marginBottom: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <div style={{
                                    width: "48px", height: "48px", borderRadius: "14px",
                                    background: "rgba(0,212,255,0.1)", display: "flex",
                                    alignItems: "center", justifyContent: "center", color: "var(--accent-primary)"
                                }}>
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>Rental Agreement</h2>
                                    <div style={{ fontSize: "13px", color: "var(--text-tertiary)", marginTop: "4px" }}>Standard Residential Lease v2.4</div>
                                </div>
                            </div>
                            <button className="btn-ghost" style={{ gap: "10px" }}>
                                <Download size={16} /> Download PDF
                            </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
                            <div>
                                <div style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Start Date</div>
                                <div style={{ fontSize: "16px", fontWeight: 600 }}>Dec 01, 2025</div>
                            </div>
                            <div>
                                <div style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>End Date</div>
                                <div style={{ fontSize: "16px", fontWeight: 600 }}>Nov 30, 2026</div>
                            </div>
                            <div>
                                <div style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Security Deposit</div>
                                <div style={{ fontSize: "16px", fontWeight: 600 }}>₹15,000</div>
                            </div>
                            <div>
                                <div style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Notice Period</div>
                                <div style={{ fontSize: "16px", fontWeight: 600 }}>30 Days</div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: "32px", borderRadius: "24px" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>Property Rules</h3>
                        <ul style={{ display: "flex", flexDirection: "column", gap: "16px", padding: 0, margin: 0, listStyle: "none" }}>
                            {[
                                "Quiet hours observed from 11 PM to 7 AM.",
                                "No smoking allowed within the premises.",
                                "Trash must be segregated and disposed of daily.",
                                "Visitors are allowed until 10 PM."
                            ].map((rule, i) => (
                                <li key={i} style={{ display: "flex", gap: "12px", fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                                    <ShieldCheck size={16} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
                                    {rule}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div className="glass-card" style={{ padding: "24px", borderRadius: "24px", background: "rgba(0,212,255,0.03)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--accent-primary)", marginBottom: "16px" }}>
                            <Info size={18} />
                            <h4 style={{ fontSize: "14px", fontWeight: 700, margin: 0 }}>Lease Status</h4>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Current Status</span>
                            <span className="badge badge-paid">ACTIVE</span>
                        </div>
                        <div style={{ marginTop: "20px", fontSize: "12px", color: "var(--text-tertiary)", lineHeight: 1.6 }}>
                            Your lease is in good standing. Renewal options will appear 60 days before expiry.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
