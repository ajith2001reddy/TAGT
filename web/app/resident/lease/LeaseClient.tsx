"use client";

import { useState, useEffect } from "react";
import { FileText, Download, ShieldCheck, Info, Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { api } from "@/lib/api";

interface LeaseData {
    name: string;
    email: string;
    propertyId?: { name: string };
    roomId?: { roomNumber: string; rent: number };
    leaseStart?: string;
    leaseEnd?: string;
    securityDeposit?: number;
}

export default function LeaseClient() {
    const [leaseData, setLeaseData] = useState<LeaseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get("/v2/resident/dashboard/v2");
                setLeaseData(res.data?.data?.resident || null);
            } catch {
                // silently fail, UI will show fallbacks
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("Not authenticated");
            const token = await user.getIdToken();

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/v2/resident/lease`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Failed to generate lease");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "lease-agreement.pdf";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed:", err);
        } finally {
            setDownloading(false);
        }
    };

    const rent = leaseData?.roomId?.rent || 0;
    const deposit = leaseData?.securityDeposit || rent * 2;
    const leaseStart = leaseData?.leaseStart
        ? new Date(leaseData.leaseStart).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : "Dec 01, 2025";
    const leaseEnd = leaseData?.leaseEnd
        ? new Date(leaseData.leaseEnd).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : "Nov 30, 2026";

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
                                    <div style={{ fontSize: "13px", color: "var(--text-tertiary)", marginTop: "4px" }}>
                                        {leaseData?.propertyId?.name ? `${leaseData.propertyId.name} · Room ${leaseData?.roomId?.roomNumber || "N/A"}` : "Standard Residential Lease"}
                                    </div>
                                </div>
                            </div>
                            <button
                                className="btn-ghost"
                                onClick={handleDownload}
                                disabled={downloading || loading}
                                style={{ gap: "10px", display: "flex", alignItems: "center" }}
                            >
                                {downloading ? <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> : <Download size={16} />}
                                {downloading ? "Generating..." : "Download PDF"}
                            </button>
                        </div>

                        {loading ? (
                            <div style={{ display: "flex", justifyContent: "center", padding: "32px" }}>
                                <Loader2 size={24} style={{ animation: "spin 0.8s linear infinite", color: "var(--accent-primary)" }} />
                            </div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
                                <div>
                                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Start Date</div>
                                    <div style={{ fontSize: "16px", fontWeight: 600 }}>{leaseStart}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>End Date</div>
                                    <div style={{ fontSize: "16px", fontWeight: 600 }}>{leaseEnd}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Security Deposit</div>
                                    <div style={{ fontSize: "16px", fontWeight: 600 }}>{deposit ? `₹${deposit.toLocaleString("en-IN")}` : "N/A"}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Monthly Rent</div>
                                    <div style={{ fontSize: "16px", fontWeight: 600 }}>{rent ? `₹${rent.toLocaleString("en-IN")}` : "N/A"}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="glass-card" style={{ padding: "32px", borderRadius: "24px" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>Property Rules</h3>
                        <ul style={{ display: "flex", flexDirection: "column", gap: "16px", padding: 0, margin: 0, listStyle: "none" }}>
                            {[
                                "Quiet hours observed from 11 PM to 7 AM.",
                                "No smoking allowed within the premises.",
                                "Trash must be segregated and disposed of daily.",
                                "Visitors are allowed until 10 PM.",
                                "Rent is due on or before the 5th of each month.",
                                "Subletting of the room is strictly prohibited.",
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

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
