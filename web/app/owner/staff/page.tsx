"use client";

import { motion } from "framer-motion";
import { Users, UserPlus, Shield, MoreVertical, Mail } from "lucide-react";

export default function OwnerStaffPage() {
    const staff = [
        { name: "Anita Rao", role: "Manager", email: "anita@tagt.com", status: "Active" },
        { name: "John Smith", role: "Accountant", email: "john@tagt.com", status: "Active" },
    ];

    return (
        <div className="animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
                <div>
                    <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "8px" }}>Staff & Permissions</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Manage team members and their access levels across your properties.</p>
                </div>
                <button className="btn-primary" style={{ gap: "10px" }}>
                    <UserPlus size={18} /> Invite Member
                </button>
            </div>

            <div className="glass-card" style={{ borderRadius: "24px" }}>
                <div style={{
                    padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)",
                    display: "grid", gridTemplateColumns: "2fr 1.5fr 1.5fr 80px",
                    color: "var(--text-tertiary)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em"
                }}>
                    <div>NAME</div>
                    <div>ROLE</div>
                    <div>STATUS</div>
                    <div></div>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                    {staff.map((s, i) => (
                        <div key={i} style={{
                            padding: "20px 24px", borderBottom: i === staff.length - 1 ? "none" : "1px solid var(--border-subtle)",
                            display: "grid", gridTemplateColumns: "2fr 1.5fr 1.5fr 80px", alignItems: "center"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{
                                    width: "36px", height: "36px", borderRadius: "10px",
                                    background: "rgba(255,255,255,0.05)", display: "flex",
                                    alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700
                                }}>
                                    {s.name[0]}
                                </div>
                                <div>
                                    <div style={{ fontSize: "14px", fontWeight: 600 }}>{s.name}</div>
                                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: "5px" }}>
                                        <Mail size={12} /> {s.email}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <span style={{
                                    fontSize: "12px", background: "rgba(255,255,255,0.05)",
                                    padding: "4px 10px", borderRadius: "6px", color: "var(--text-secondary)"
                                }}>{s.role}</span>
                            </div>
                            <div>
                                <span className="badge badge-paid" style={{ fontSize: "10px" }}>{s.status}</span>
                            </div>
                            <button style={{ background: "transparent", border: "none", color: "var(--text-tertiary)", cursor: "pointer" }}>
                                <MoreVertical size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: "40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div className="glass-card" style={{ padding: "24px", borderRadius: "24px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <Shield size={18} color="var(--accent-primary)" /> Permission Roles
                    </h3>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>Define what each role can see and do within the platform.</p>
                    <button className="btn-ghost" style={{ fontSize: "12px" }}>Configure Roles</button>
                </div>
            </div>
        </div>
    );
}
