"use client";

import { motion } from "framer-motion";
import { Bell, CheckCircle2, AlertTriangle, Info, MoreHorizontal, Settings } from "lucide-react";

export default function NotificationsPage() {
    const notifications = [
        { id: 1, type: "success", title: "Rent Payment Received", message: "Your payment for March 2026 has been successfully processed.", time: "2 hours ago", unread: true },
        { id: 2, type: "warning", title: "Maintenance Scheduled", message: "The plumber will visit between 10 AM and 12 PM tomorrow.", time: "5 hours ago", unread: true },
        { id: 3, type: "info", title: "New Announcement", message: "A new message from property management is available.", time: "1 day ago", unread: false },
        { id: 4, type: "success", title: "Profile Verified", message: "Your identity documents have been approved.", time: "2 days ago", unread: false },
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case "success": return <CheckCircle2 size={18} color="var(--green)" />;
            case "warning": return <AlertTriangle size={18} color="var(--yellow)" />;
            default: return <Info size={18} color="var(--accent-primary)" />;
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
                <div>
                    <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "8px" }}>Notifications</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Stay updated with important activity and system alerts.</p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button className="btn-ghost" style={{ fontSize: "12px", gap: "8px" }}>
                        <CheckCircle2 size={14} /> Mark all as read
                    </button>
                    <button className="btn-ghost" style={{ fontSize: "12px", padding: "10px" }}>
                        <Settings size={14} />
                    </button>
                </div>
            </div>

            <div className="glass-card" style={{ borderRadius: "24px", overflow: "hidden" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {notifications.map((n, i) => (
                        <div key={n.id} style={{
                            padding: "24px", borderBottom: i === notifications.length - 1 ? "none" : "1px solid var(--border-subtle)",
                            background: n.unread ? "rgba(0,212,255,0.02)" : "transparent",
                            display: "flex", gap: "20px", alignItems: "flex-start",
                            position: "relative"
                        }}>
                            {n.unread && <div style={{ position: "absolute", left: "0", top: "50%", transform: "translateY(-50%)", width: "4px", height: "40%", background: "var(--accent-primary)", borderRadius: "0 4px 4px 0" }} />}

                            <div style={{
                                width: "44px", height: "44px", borderRadius: "12px",
                                background: "rgba(255,255,255,0.03)", display: "flex",
                                alignItems: "center", justifyContent: "center", flexShrink: 0
                            }}>
                                {getIcon(n.type)}
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                    <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: n.unread ? "var(--text-primary)" : "var(--text-secondary)" }}>{n.title}</h3>
                                    <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{n.time}</span>
                                </div>
                                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>{n.message}</p>
                            </div>

                            <button style={{ background: "transparent", border: "none", color: "var(--text-tertiary)", cursor: "pointer", padding: "4px" }}>
                                <MoreHorizontal size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: "32px", textAlign: "center" }}>
                <button className="btn-ghost" style={{ fontSize: "13px" }}>Load Older Notifications</button>
            </div>
        </div>
    );
}
