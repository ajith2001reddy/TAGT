"use client";

import { useState, useEffect } from "react";
import { FileText, Download, ShieldCheck, Info, Loader2, CheckCircle2, Signature, Clock } from "lucide-react";
import { fetchMyActiveLease, signLease, Lease } from "@/features/owner/lease.service";
import { toast } from "react-hot-toast";

export default function LeaseClient() {
    const [lease, setLease] = useState<Lease | null>(null);
    const [loading, setLoading] = useState(true);
    const [signing, setSigning] = useState(false);
    const [typedName, setTypedName] = useState("");
    const [agreed, setAgreed] = useState(false);

    useEffect(() => {
        fetchMyActiveLease()
            .then(setLease)
            .finally(() => setLoading(false));
    }, []);

    const handleSign = async () => {
        if (!agreed) return toast.error("Please agree to the terms first.");
        if (typedName.trim().length === 0) return toast.error("Please type your name to sign.");

        setSigning(true);
        try {
            await signLease({ typedName });
            toast.success("Lease signed successfully!");
            const updated = await fetchMyActiveLease();
            setLease(updated);
        } catch {
            toast.error("Failed to sign lease.");
        } finally {
            setSigning(false);
        }
    };

    if (loading) return (
        <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
            <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "var(--accent-primary)" }} />
        </div>
    );

    if (!lease) return (
        <div className="glass-card" style={{ padding: "60px", textAlign: "center", borderRadius: "24px" }}>
            <FileText size={48} style={{ margin: "0 auto 20px", color: "var(--text-tertiary)" }} />
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>No Active Lease</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "400px", margin: "0 auto" }}>
                Your property manager hasn't uploaded a lease document yet. Once uploaded, you'll be able to review and sign it here.
            </p>
        </div>
    );

    const isSigned = lease.status === "signed";

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "8px" }}>Lease Agreement</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>{lease.propertyId?.name} · Digital Consent Record</p>
                </div>
                <div style={{ 
                    display: "flex", alignItems: "center", gap: "10px", 
                    padding: "8px 16px", borderRadius: "100px", 
                    background: isSigned ? "rgba(52,211,153,0.1)" : "rgba(251,191,36,0.1)",
                    color: isSigned ? "#34d399" : "#fbbf24",
                    border: `1px solid ${isSigned ? "rgba(52,211,153,0.2)" : "rgba(251,191,36,0.2)"}`
                }}>
                    {isSigned ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                    <span style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.05em" }}>{lease.status.toUpperCase()}</span>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "24px" }}>
                <div>
                    {/* PDF Viewer Placeholder / Link */}
                    <div className="glass-card" style={{ padding: "32px", borderRadius: "24px", marginBottom: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <FileText size={20} color="var(--accent-primary)" />
                                <h3 style={{ fontSize: "18px", fontWeight: 700 }}>Document Preview</h3>
                            </div>
                            <a href={lease.fileUrl} target="_blank" className="btn-primary" style={{ gap: "8px", fontSize: "13px" }}>
                                <Download size={14} /> Download Original PDF
                            </a>
                        </div>
                        
                        <div style={{ 
                            height: "500px", borderRadius: "16px", background: "rgba(0,0,0,0.2)", 
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                            border: "2px dashed var(--border-subtle)"
                        }}>
                            <FileText size={64} color="var(--text-tertiary)" style={{ marginBottom: "20px" }} />
                            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px" }}>Document ready for review.</p>
                            <a href={lease.fileUrl} target="_blank" style={{ color: "var(--accent-primary)", fontSize: "14px", fontWeight: 700, textDecoration: "none" }}>Click here to open in new tab →</a>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: "32px", borderRadius: "24px" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>Standard Terms Summary</h3>
                        <ul style={{ display: "flex", flexDirection: "column", gap: "16px", padding: 0, margin: 0, listStyle: "none" }}>
                            {[
                                "Monthly rent must be paid by the 5th of every month.",
                                "Security deposit is refundable upon successful checkout.",
                                "30-day notice period required before leaving.",
                                "Tenant is responsible for any damage to property furniture.",
                                "Quiet hours observed from 11 PM to 7 AM."
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
                    {!isSigned ? (
                        <div className="glass-card" style={{ padding: "32px", borderRadius: "24px", border: "1px solid var(--accent-primary)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--accent-primary)", marginBottom: "20px" }}>
                                <Signature size={24} />
                                <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>Sign & Accept</h2>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div style={{ background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "12px", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                                    By signing below, you acknowledge that you have read the lease agreement and agree to be bound by its terms and conditions.
                                </div>

                                <label style={{ display: "flex", gap: "12px", cursor: "pointer", fontSize: "13px", userSelect: "none" }}>
                                    <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                                    <span>I agree to the terms and conditions outlined in the document.</span>
                                </label>

                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: "8px" }}>TYPE YOUR FULL NAME TO SIGN</label>
                                    <input 
                                        className="input-field" 
                                        placeholder="Electronic Signature" 
                                        value={typedName}
                                        onChange={e => setTypedName(e.target.value)}
                                        style={{ fontFamily: "var(--font-mono)", fontSize: "16px" }}
                                    />
                                </div>

                                <button 
                                    className="btn-primary" 
                                    style={{ width: "100%", padding: "14px" }} 
                                    disabled={!agreed || !typedName.trim() || signing}
                                    onClick={handleSign}
                                >
                                    {signing ? "Processing..." : "Accept & Sign Lease"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card" style={{ padding: "32px", borderRadius: "24px", background: "rgba(52,211,153,0.03)", border: "1px solid rgba(52,211,153,0.3)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#34d399", marginBottom: "24px" }}>
                                <CheckCircle2 size={24} />
                                <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>Document Signed</h2>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                                    This agreement was electronically signed and is now legally binding within the platform.
                                </div>
                                <div style={{ 
                                    background: "rgba(0,0,0,0.3)", padding: "20px", borderRadius: "16px", 
                                    border: "1px solid rgba(52,211,153,0.2)", position: "relative"
                                }}>
                                    <div style={{ fontSize: "10px", color: "var(--text-tertiary)", textTransform: "uppercase", position: "absolute", top: "10px", right: "15px" }}>Digital Seal</div>
                                    <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: "28px", color: "#34d399", marginBottom: "10px" }}>{lease.signature?.typedName}</div>
                                    <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", marginBottom: "10px" }} />
                                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                                        Signed On: {new Date(lease.signature?.acceptedAt || "").toLocaleString()}<br/>
                                        IP Address: {lease.signature?.ipAddress}
                                    </div>
                                </div>
                                <button className="btn-ghost" disabled style={{ width: "100%", fontSize: "13px" }}>Agreement Locked</button>
                            </div>
                        </div>
                    )}

                    <div className="glass-card" style={{ padding: "24px", borderRadius: "24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-tertiary)", marginBottom: "16px" }}>
                            <Info size={16} />
                            <h4 style={{ fontSize: "13px", fontWeight: 700, margin: 0 }}>Audit Trail</h4>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <AuditStep label="Document Uploaded" date={new Date(lease.createdAt).toLocaleDateString()} done />
                            <AuditStep label="Resident Signature" date={isSigned ? new Date(lease.signature?.acceptedAt || "").toLocaleDateString() : "Pending"} done={isSigned} />
                            <AuditStep label="Final Authorization" date={isSigned ? "Completed" : "Waiting"} done={isSigned} />
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
            `}</style>
        </div>
    );
}

function AuditStep({ label, date, done }: { label: string, date: string, done: boolean }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: done ? "#34d399" : "var(--text-tertiary)" }} />
                <span style={{ fontSize: "12px", color: done ? "var(--text-primary)" : "var(--text-tertiary)" }}>{label}</span>
            </div>
            <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{date}</span>
        </div>
    );
}
