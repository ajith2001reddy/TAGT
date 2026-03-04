"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity, Shield, RefreshCw, Filter, Clock,
    Globe, ChevronDown, Search
} from "lucide-react";

interface ActivityLog {
    _id: string;
    action: string;
    role: string;
    route: string;
    ipAddress: string;
    createdAt: string;
}

// Action → { label, color, emoji }
const ACTION_META: Record<string, { label: string; color: string; emoji: string }> = {
    PROPERTY_UPDATED: { label: "Property Updated", color: "#00d4ff", emoji: "🏢" },
    OWNER_UPDATED_BY_ADMIN: { label: "Owner Updated", color: "#a78bfa", emoji: "👤" },
    PROPERTY_STATUS_CHANGED: { label: "Property Status Change", color: "#fbbf24", emoji: "🔄" },
    SUBSCRIPTION_OVERRIDE: { label: "Subscription Changed", color: "#34d399", emoji: "💳" },
    ROOM_CREATED: { label: "Room Created", color: "#34d399", emoji: "🛏️" },
    ROOM_UPDATED: { label: "Room Updated", color: "#00d4ff", emoji: "✏️" },
    ROOM_DELETED: { label: "Room Deleted", color: "#ff5252", emoji: "🗑️" },
    RESIDENT_CREATED: { label: "Resident Added", color: "#34d399", emoji: "👤" },
    RESIDENT_DEACTIVATED: { label: "Resident Deactivated", color: "#ff5252", emoji: "🚫" },
    PAYMENT_CREATED: { label: "Payment Created", color: "#34d399", emoji: "💰" },
    PAYMENT_MARKED_PAID: { label: "Payment Marked Paid", color: "#34d399", emoji: "✅" },
};

function getMeta(action: string) {
    return ACTION_META[action] ?? { label: action.replace(/_/g, " "), color: "var(--text-tertiary)", emoji: "🔹" };
}

function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true
    });
}

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

const FILTER_OPTIONS = ["All", ...Object.keys(ACTION_META)];

export default function OwnerActivityPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    const [showFilter, setShowFilter] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => { fetchLogs(); }, []);

    async function fetchLogs(showRefresh = false) {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const res = await api.get("/v2/owner/activity-logs");
            setLogs(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch activity logs", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const filtered = logs.filter(log => {
        const matchesFilter = filter === "All" || log.action === filter;
        const q = search.toLowerCase();
        const matchesSearch = !q ||
            log.action.toLowerCase().includes(q) ||
            getMeta(log.action).label.toLowerCase().includes(q) ||
            log.route?.toLowerCase().includes(q) ||
            log.ipAddress?.toLowerCase().includes(q);
        return matchesFilter && matchesSearch;
    });

    // Group by date
    const grouped: Record<string, ActivityLog[]> = {};
    for (const log of filtered) {
        const dateKey = new Date(log.createdAt).toLocaleDateString("en-IN", {
            weekday: "long", day: "2-digit", month: "long", year: "numeric"
        });
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(log);
    }

    return (
        <div className="animate-fade-in" style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>

            {/* Header */}
            <div style={{ marginBottom: "36px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
                <div>
                    <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "6px" }}>
                        Account Security
                    </div>
                    <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "4px" }}>Activity Log</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                        {logs.length} actions recorded · last 50 events
                    </p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                    <button
                        onClick={() => fetchLogs(true)}
                        className="btn-ghost"
                        style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", padding: "8px 14px" }}
                    >
                        <RefreshCw size={13} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Search + Filter bar */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "28px", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
                    <Search size={13} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", pointerEvents: "none" }} />
                    <input
                        className="input-field"
                        placeholder="Search actions, routes, IPs…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: "36px", fontSize: "13px", width: "100%" }}
                    />
                </div>

                {/* Filter dropdown */}
                <div style={{ position: "relative" }}>
                    <button
                        onClick={() => setShowFilter(v => !v)}
                        className="btn-ghost"
                        style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", padding: "10px 14px", background: filter !== "All" ? "rgba(0,212,255,0.08)" : undefined, borderColor: filter !== "All" ? "rgba(0,212,255,0.3)" : undefined, color: filter !== "All" ? "var(--accent-primary)" : undefined }}
                    >
                        <Filter size={12} />
                        {filter === "All" ? "All Actions" : getMeta(filter).label}
                        <ChevronDown size={11} style={{ marginLeft: "2px" }} />
                    </button>
                    <AnimatePresence>
                        {showFilter && (
                            <motion.div
                                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                                transition={{ duration: 0.15 }}
                                style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "14px", padding: "6px", zIndex: 50, minWidth: "220px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
                            >
                                {FILTER_OPTIONS.map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => { setFilter(opt); setShowFilter(false); }}
                                        style={{
                                            display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "8px 12px", borderRadius: "9px",
                                            background: filter === opt ? "rgba(0,212,255,0.08)" : "transparent",
                                            border: "none", cursor: "pointer", fontSize: "12px",
                                            color: filter === opt ? "var(--accent-primary)" : "var(--text-secondary)",
                                            textAlign: "left",
                                        }}
                                    >
                                        {opt === "All" ? "🔹" : getMeta(opt).emoji}
                                        <span>{opt === "All" ? "All Actions" : getMeta(opt).label}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="skeleton" style={{ height: "72px", borderRadius: "16px" }} />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 40px", color: "var(--text-tertiary)" }}>
                    <Activity size={40} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
                    <p style={{ fontSize: "15px", fontWeight: 600, marginBottom: "6px" }}>No activity found</p>
                    <p style={{ fontSize: "13px" }}>
                        {filter !== "All" || search ? "Try adjusting your filters." : "Actions you take will appear here."}
                    </p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    {Object.entries(grouped).map(([date, items]) => (
                        <section key={date}>
                            {/* Date label */}
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                                <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", fontWeight: 700 }}>
                                    {date}
                                </div>
                                <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
                                <div style={{ fontSize: "10px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                                    {items.length} event{items.length !== 1 ? "s" : ""}
                                </div>
                            </div>

                            {/* Log items — vertical timeline */}
                            <div style={{ position: "relative", paddingLeft: "28px" }}>
                                {/* Timeline line */}
                                <div style={{ position: "absolute", left: "11px", top: "8px", bottom: "8px", width: "1px", background: "var(--border-subtle)" }} />

                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    {items.map((log, i) => {
                                        const meta = getMeta(log.action);
                                        return (
                                            <motion.div
                                                key={log._id}
                                                initial={{ opacity: 0, x: -8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.02 }}
                                                style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: "14px", padding: "14px 16px", borderRadius: "14px", background: "var(--bg-card)", border: "1px solid var(--border-default)", transition: "border-color 0.2s" }}
                                                onMouseEnter={e => (e.currentTarget.style.borderColor = `${meta.color}30`)}
                                                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-default)")}
                                            >
                                                {/* Timeline dot */}
                                                <div style={{ position: "absolute", left: "-22px", top: "50%", transform: "translateY(-50%)", width: "9px", height: "9px", borderRadius: "50%", background: meta.color, boxShadow: `0 0 6px ${meta.color}60`, border: "2px solid var(--bg-base)" }} />

                                                {/* Emoji icon */}
                                                <div style={{ width: "38px", height: "38px", borderRadius: "11px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0, background: `${meta.color}12`, border: `1px solid ${meta.color}20` }}>
                                                    {meta.emoji}
                                                </div>

                                                {/* Content */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                                        <div style={{ fontWeight: 600, fontSize: "13px", color: meta.color }}>
                                                            {meta.label}
                                                        </div>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                                                            <Clock size={9} />
                                                            <span title={formatTime(log.createdAt)}>{timeAgo(log.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: "flex", gap: "12px", marginTop: "5px", flexWrap: "wrap" }}>
                                                        {log.route && (
                                                            <span style={{ fontSize: "10.5px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", background: "var(--bg-subtle)", padding: "2px 7px", borderRadius: "5px", border: "1px solid var(--border-subtle)" }}>
                                                                {log.route}
                                                            </span>
                                                        )}
                                                        {log.ipAddress && (
                                                            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10.5px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                                                                <Globe size={9} /> {log.ipAddress}
                                                            </span>
                                                        )}
                                                        <span style={{ fontSize: "10.5px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                                                            {formatTime(log.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    ))}
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
