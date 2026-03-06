"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: "payment" | "maintenance" | "support" | "system" | "resident";
    link?: string;
    isRead: boolean;
    createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
    payment: "💰",
    maintenance: "🔧",
    support: "🎫",
    system: "⚙️",
    resident: "👤",
};

function timeAgo(date: string) {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5001";

export function NotificationBell() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);

    const fetchUnread = useCallback(async () => {
        try {
            const { data } = await api.get("/v2/notifications/unread-count");
            setUnread(data.count ?? 0);
        } catch { /* silently fail */ }
    }, []);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/v2/notifications", { params: { limit: 20 } });
            setNotifications(data.data ?? []);
        } catch { /* silently fail */ }
        finally { setLoading(false); }
    }, []);

    // Poll unread count every 30s
    useEffect(() => {
        fetchUnread();
        const t = setInterval(fetchUnread, 30000);
        return () => clearInterval(t);
    }, [fetchUnread]);

    // Socket.io — connect and join personal room for live push
    useEffect(() => {
        if (!user?.uid) return;

        const socket = io(BACKEND_URL, {
            transports: ["websocket", "polling"],
            withCredentials: true,
            reconnectionAttempts: 5,
        });
        socketRef.current = socket;

        socket.on("connect", () => {
            socket.emit("user:join", user.uid);
        });

        socket.on("notification:new", (notif: Notification) => {
            setUnread(n => n + 1);
            setNotifications(prev => [notif, ...prev.slice(0, 19)]);
        });

        return () => { socket.disconnect(); };
    }, [user?.uid]);

    // Close panel on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleOpen = () => {
        if (!open) fetchNotifications();
        setOpen(o => !o);
    };

    const handleMarkRead = async (id: string) => {
        await api.patch(`/v2/notifications/${id}/read`).catch(() => { });
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnread(u => Math.max(0, u - 1));
    };

    const handleMarkAllRead = async () => {
        await api.patch("/v2/notifications/read-all").catch(() => { });
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnread(0);
    };

    return (
        <div ref={panelRef} style={{ position: "relative" }}>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpen}
                style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: open ? "rgba(0,212,255,0.1)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${open ? "rgba(0,212,255,0.3)" : "var(--border-subtle)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", position: "relative",
                    color: open ? "var(--accent-primary)" : "var(--text-secondary)",
                    transition: "all 0.15s ease",
                }}
            >
                <Bell size={15} />
                {unread > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                            position: "absolute", top: -4, right: -4,
                            width: unread > 9 ? 20 : 16, height: 16,
                            background: "#ff4444", borderRadius: 999,
                            fontSize: 9, fontWeight: 700, color: "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: "2px solid var(--bg-base)",
                        }}
                    >
                        {unread > 99 ? "99+" : unread}
                    </motion.div>
                )}
            </motion.button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: "absolute", top: "calc(100% + 10px)", right: 0,
                            width: 360, maxHeight: 500,
                            background: "rgba(13,21,32,0.98)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 16, boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
                            backdropFilter: "blur(24px)",
                            zIndex: 9999, overflow: "hidden",
                            display: "flex", flexDirection: "column",
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>Notifications</div>
                            {unread > 0 && (
                                <button onClick={handleMarkAllRead} style={{ background: "transparent", border: "none", color: "#00d4ff", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div style={{ overflowY: "auto", flex: 1 }}>
                            {loading ? (
                                <div style={{ textAlign: "center", padding: 32, color: "#555", fontSize: 13 }}>Loading…</div>
                            ) : notifications.length === 0 ? (
                                <div style={{ textAlign: "center", padding: 40, color: "#555" }}>
                                    <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                                    <div style={{ fontSize: 13 }}>No notifications yet</div>
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <button
                                        key={n._id}
                                        onClick={() => handleMarkRead(n._id)}
                                        style={{
                                            width: "100%", display: "flex", gap: 12, padding: "12px 16px",
                                            background: n.isRead ? "transparent" : "rgba(0,212,255,0.04)",
                                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                                            border: "none", textAlign: "left", cursor: "pointer",
                                            transition: "background 0.15s",
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                                        onMouseLeave={e => (e.currentTarget.style.background = n.isRead ? "transparent" : "rgba(0,212,255,0.04)")}
                                    >
                                        {/* Icon */}
                                        <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                                            {TYPE_ICONS[n.type] || "🔔"}
                                        </div>
                                        {/* Content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                                                <span style={{ fontSize: 13, fontWeight: n.isRead ? 400 : 600, color: n.isRead ? "#aaa" : "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {n.title}
                                                </span>
                                                <span style={{ fontSize: 11, color: "#555", whiteSpace: "nowrap", flexShrink: 0 }}>{timeAgo(n.createdAt)}</span>
                                            </div>
                                            <div style={{ fontSize: 12, color: "#888", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.message}</div>
                                        </div>
                                        {/* Unread dot */}
                                        {!n.isRead && (
                                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d4ff", flexShrink: 0, alignSelf: "center" }} />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
