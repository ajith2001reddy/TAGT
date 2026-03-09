"use client";

import { motion } from "framer-motion";
import { UserPlus, Link as LinkIcon, Mail, Smartphone, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function OwnerInvitePage() {
    const [invites, setInvites] = useState([
        { id: 1, name: "Rahul Singh", contact: "rahul@gmail.com", type: "email", status: "PENDING", date: "2 mins ago" },
        { id: 2, name: "Priya Das", contact: "9876543210", type: "sms", status: "ACCEPTED", date: "1 hour ago" },
    ]);

    const copyInviteLink = () => {
        navigator.clipboard.writeText("https://tagt.website/invite/pro_xyz123");
        toast.success("Invite link copied to clipboard!");
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
                <div>
                    <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "8px" }}>Resident Invites</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Onboard residents to your properties with one-click magic links.</p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {/* Invite Creator */}
                    <div className="glass-card" style={{ padding: "32px", borderRadius: "24px" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "24px" }}>Send New Invite</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: "8px" }}>RESIDENT NAME</label>
                                <input className="input-field" placeholder="Full Name" />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: "8px" }}>EMAIL OR PHONE</label>
                                <input className="input-field" placeholder="name@email.com" />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button className="btn-primary" style={{ flex: 1, gap: "10px" }}>
                                <Mail size={18} /> Send over Email
                            </button>
                            <button className="btn-ghost" style={{ flex: 1, gap: "10px" }}>
                                <Smartphone size={18} /> Send over SMS
                            </button>
                        </div>
                    </div>

                    {/* Pending Invites */}
                    <div className="glass-card" style={{ borderRadius: "24px" }}>
                        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", fontWeight: 700, fontSize: "15px" }}>
                            Recent Invites
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            {invites.map((inv, i) => (
                                <div key={inv.id} style={{
                                    padding: "20px 24px", borderBottom: i === invites.length - 1 ? "none" : "1px solid var(--border-subtle)",
                                    display: "flex", justifyContent: "space-between", alignItems: "center"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            {inv.type === "email" ? <Mail size={16} color="var(--text-tertiary)" /> : <Smartphone size={16} color="var(--text-tertiary)" />}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "14px", fontWeight: 600 }}>{inv.name}</div>
                                            <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{inv.contact} • {inv.date}</div>
                                        </div>
                                    </div>
                                    <span style={{
                                        fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "100px",
                                        background: inv.status === "ACCEPTED" ? "rgba(52,211,153,0.1)" : "rgba(251,191,36,0.1)",
                                        color: inv.status === "ACCEPTED" ? "#34d399" : "#fbbf24",
                                        border: `1px solid ${inv.status === "ACCEPTED" ? "rgba(52,211,153,0.2)" : "rgba(251,191,36,0.2)"}`
                                    }}>{inv.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Shared Link Card */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div className="glass-card" style={{ padding: "28px", borderRadius: "24px", border: "1px solid rgba(0,212,255,0.2)", background: "linear-gradient(135deg, rgba(0,212,255,0.05), transparent)" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)", marginBottom: "20px" }}>
                            <LinkIcon size={20} />
                        </div>
                        <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>Universal Invite Link</h3>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "20px" }}>Share this link anywhere (WhatsApp, Social Media) to let residents join your property.</p>

                        <div style={{
                            padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.2)",
                            fontSize: "12px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)",
                            marginBottom: "16px", border: "1px solid var(--border-subtle)",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                        }}>
                            tagt.website/invite/pro_xyz123
                        </div>

                        <button onClick={copyInviteLink} className="btn-primary" style={{ width: "100%", fontSize: "13px" }}>Copy Invite Link</button>
                    </div>

                    <div className="glass-card" style={{ padding: "24px", borderRadius: "24px" }}>
                        <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Clock size={16} /> Invite Stats
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Total Sent</span>
                                <span style={{ fontSize: "13px", fontWeight: 700 }}>42</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Acceptance Rate</span>
                                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--green)" }}>94%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
