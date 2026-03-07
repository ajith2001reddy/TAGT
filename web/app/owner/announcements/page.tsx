"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

interface Notice {
    _id: string;
    title: string;
    message: string;
    priority: "info" | "warning" | "critical";
    audienceCount: number;
    createdAt: string;
    authorId: { name: string; role: string };
    propertyId: { name: string };
}

interface Property {
    _id: string;
    name: string;
}

export default function AnnouncementsPage() {
    const { user } = useAuth();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    const [isComposing, setIsComposing] = useState(false);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [priority, setPriority] = useState<"info" | "warning" | "critical">("info");
    const [selectedPropertyId, setSelectedPropertyId] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [noticesRes, propsRes] = await Promise.all([
                api.get("/v2/notices"),
                api.get("/v2/properties")
            ]);
            setNotices(noticesRes.data.data);
            setProperties(propsRes.data.data);
            if (propsRes.data.data.length > 0) {
                setSelectedPropertyId(propsRes.data.data[0]._id);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to load announcements");
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) return toast.error("Title and message required");

        setSending(true);
        try {
            await api.post("/v2/notices", { propertyId: selectedPropertyId, title, message, priority });
            toast.success("Announcement broadcasted successfully!");
            setTitle("");
            setMessage("");
            setIsComposing(false);
            loadData(); // Refresh list
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to broadcast announcement");
        } finally {
            setSending(false);
        }
    };

    const getPriorityColor = (p: string) => {
        switch (p) {
            case "critical": return { bg: "rgba(255,82,82,0.1)", color: "#ff5252", border: "rgba(255,82,82,0.2)" };
            case "warning": return { bg: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "rgba(251,191,36,0.2)" };
            default: return { bg: "rgba(0,212,255,0.1)", color: "var(--accent-primary)", border: "rgba(0,212,255,0.2)" };
        }
    };

    if (loading) return (
        <div>
            <div className="skeleton" style={{ height: "40px", width: "200px", marginBottom: "20px" }} />
            <div className="skeleton" style={{ height: "400px", borderRadius: "18px" }} />
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ paddingBottom: "40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 className="display-text" style={{ fontSize: "28px", margin: 0 }}>Announcements</h1>
                    <p style={{ color: "var(--text-secondary)", margin: "4px 0 0 0" }}>Broadcast messages to all your residents instantly.</p>
                </div>
                {!isComposing && (
                    <button className="btn-primary" onClick={() => setIsComposing(true)}>
                        + New Announcement
                    </button>
                )}
            </div>

            {isComposing && (
                <div className="glass-card animate-fade-up" style={{ marginBottom: "24px", padding: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>Compose Broadcast</h2>
                        <button onClick={() => setIsComposing(false)} style={{ background: "transparent", color: "var(--text-tertiary)", border: "none", cursor: "pointer" }}>✕</button>
                    </div>

                    <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            <div className="input-group">
                                <label>Target Property</label>
                                <select value={selectedPropertyId} onChange={e => setSelectedPropertyId(e.target.value)} required>
                                    {properties.map(p => (
                                        <option key={p._id} value={p._id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Priority / Severity</label>
                                <select value={priority} onChange={e => setPriority(e.target.value as any)}>
                                    <option value="info">Information (Blue)</option>
                                    <option value="warning">Warning (Yellow)</option>
                                    <option value="critical">Critical / Urgent (Red)</option>
                                </select>
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Announcement Subject / Title</label>
                            <input
                                type="text"
                                placeholder="e.g. Water Maintenance Tomorrow Morning"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Message Content</label>
                            <textarea
                                placeholder="Type your full message here... It will be sent via Email and displayed on Resident Dashboards."
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                rows={6}
                                required
                                style={{ resize: "vertical" }}
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
                            <button type="button" className="btn-secondary" onClick={() => setIsComposing(false)}>Cancel</button>
                            <button type="submit" className="btn-primary" disabled={sending}>
                                {sending ? "Broadcasting..." : "Send Announcement"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass-card" style={{ padding: "0" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
                    <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}>Past Announcements</h3>
                </div>

                {notices.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "var(--text-tertiary)" }}>
                        No announcements have been sent yet.
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {notices.map((notice, idx) => {
                            const style = getPriorityColor(notice.priority);
                            const date = new Date(notice.createdAt).toLocaleString("en-IN", {
                                day: "numeric", month: "short", hour: "numeric", minute: "2-digit"
                            });

                            return (
                                <div key={notice._id} style={{
                                    padding: "20px 24px",
                                    borderBottom: idx === notices.length - 1 ? "none" : "1px solid var(--border-subtle)",
                                    display: "flex",
                                    gap: "16px",
                                    transition: "background 0.15s"
                                }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-card-hover)"}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
                                >
                                    <div style={{ alignSelf: "flex-start", marginTop: "4px" }}>
                                        <div style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.color, fontSize: "10px", fontWeight: 700, padding: "4px 8px", borderRadius: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                            {notice.priority}
                                        </div>
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px", gap: "16px" }}>
                                            <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>{notice.title}</div>
                                            <div style={{ fontSize: "12px", color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>{date}</div>
                                        </div>
                                        <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, whiteSpace: "pre-wrap", marginBottom: "12px" }}>
                                            {notice.message}
                                        </div>
                                        <div style={{ display: "flex", gap: "16px", fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}>
                                            <div>TARGET: <span style={{ color: "var(--text-secondary)" }}>{notice.propertyId?.name}</span></div>
                                            <div>REACHED: <span style={{ color: "var(--text-secondary)" }}>{notice.audienceCount} residents</span></div>
                                            <div>SENDER: <span style={{ color: "var(--text-secondary)" }}>{notice.authorId?.name}</span></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
