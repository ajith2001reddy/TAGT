"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Megaphone, Calendar, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface Notice {
    _id: string;
    title: string;
    message: string;
    priority: "critical" | "warning" | "info";
    createdAt: string;
}

export default function AnnouncementsClient() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/v2/notices").then(res => {
            setNotices(res.data.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="skeleton" style={{ height: "400px", borderRadius: "24px" }} />;

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "32px" }}>
                <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "8px" }}>Announcements</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Stay updated with the latest news from your property management.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {notices.length > 0 ? notices.map((notice, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={notice._id}
                        className="glass-card"
                        style={{ padding: "28px", borderRadius: "24px" }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{
                                    width: "40px", height: "40px", borderRadius: "12px",
                                    background: notice.priority === "critical" ? "rgba(255,82,82,0.1)" : "rgba(0,212,255,0.1)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: notice.priority === "critical" ? "#ff5252" : "var(--accent-primary)"
                                }}>
                                    <Megaphone size={20} />
                                </div>
                                <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>{notice.title}</h3>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "12px", color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <Clock size={12} /> {new Date(notice.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                </div>
                            </div>
                        </div>
                        <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7, marginLeft: "52px" }}>
                            {notice.message}
                        </p>
                    </motion.div>
                )) : (
                    <div style={{ textAlign: "center", padding: "100px 0", color: "var(--text-tertiary)" }}>
                        <div style={{ fontSize: "40px", marginBottom: "16px" }}>📭</div>
                        <p>No announcements at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
