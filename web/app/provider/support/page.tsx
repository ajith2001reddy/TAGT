"use client";
import { useState, useEffect, useCallback } from "react";
import {
    fetchAllTickets, updateTicketStatus, addInternalNote, fetchTicket, replyToTicket,
    SupportTicket, SupportMessage, TicketStatus, TicketCategory, TicketPriority,
    CATEGORY_LABELS, PRIORITY_COLORS, STATUS_COLORS,
} from "@/features/support/support.service";

const CATEGORIES: TicketCategory[] = ["payment", "technical", "maintenance", "maintenance_escalation", "account", "billing", "other"];
const PRIORITIES: TicketPriority[] = ["low", "medium", "high", "urgent"];

function Badge({ label, color }: { label: string; color: string }) {
    return (
        <span style={{
            display: "inline-block", padding: "2px 10px", borderRadius: 999,
            background: `${color}22`, color, fontSize: 12, fontWeight: 600, border: `1px solid ${color}44`,
        }}>{label}</span>
    );
}

function timeAgo(date: string) {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [summary, setSummary] = useState({ open: 0, in_progress: 0, resolved: 0 });
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<TicketStatus | "">("");
    const [filterCategory, setFilterCategory] = useState<TicketCategory | "">("");
    const [filterPriority, setFilterPriority] = useState<TicketPriority | "">("");
    const [filterRole, setFilterRole] = useState("");
    const [selected, setSelected] = useState<SupportTicket | null>(null);
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [reply, setReply] = useState("");
    const [note, setNote] = useState("");
    const [sending, setSending] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchAllTickets({
                status: filterStatus || undefined,
                category: filterCategory || undefined,
                priority: filterPriority || undefined,
                role: filterRole || undefined,
            });
            setTickets(res.tickets);
            setSummary(res.summary);
        } finally {
            setLoading(false);
        }
    }, [filterStatus, filterCategory, filterPriority, filterRole]);

    useEffect(() => { load(); }, [load]);

    const openTicket = async (t: SupportTicket) => {
        setSelected(t);
        const { messages: msgs } = await fetchTicket(t._id);
        setMessages(msgs);
    };

    const handleStatus = async (status: TicketStatus) => {
        if (!selected) return;
        const updated = await updateTicketStatus(selected._id, status);
        setSelected(updated);
        load();
    };

    const handleReply = async () => {
        if (!selected || !reply.trim()) return;
        setSending(true);
        try {
            const msg = await replyToTicket(selected._id, reply);
            setMessages(m => [...m, msg]);
            setReply("");
        } finally { setSending(false); }
    };

    const handleNote = async () => {
        if (!selected || !note.trim()) return;
        setSending(true);
        try {
            const notes = await addInternalNote(selected._id, note);
            setSelected(s => s ? { ...s, internalNotes: notes ?? [] } : s);
            setNote("");
        } finally { setSending(false); }
    };

    return (
        <div style={{ padding: "32px 24px", maxWidth: 1400, margin: "0 auto" }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Support Dashboard</h1>
                <p style={{ color: "#888", marginTop: 4 }}>Manage support tickets from residents and owners</p>
            </div>

            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
                {([
                    { label: "Open", value: summary.open, color: "#00d4ff", status: "open" as TicketStatus },
                    { label: "In Progress", value: summary.in_progress, color: "#ff9800", status: "in_progress" as TicketStatus },
                    { label: "Resolved", value: summary.resolved, color: "#4caf50", status: "resolved" as TicketStatus },
                ] as const).map(card => (
                    <button
                        key={card.status}
                        onClick={() => setFilterStatus(filterStatus === card.status ? "" : card.status)}
                        style={{
                            background: filterStatus === card.status ? `${card.color}22` : "rgba(255,255,255,0.03)",
                            border: `1px solid ${filterStatus === card.status ? card.color : "rgba(255,255,255,0.08)"}`,
                            borderRadius: 16, padding: "20px 24px", textAlign: "left", cursor: "pointer",
                            transition: "all 0.2s",
                        }}>
                        <div style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{card.label}</div>
                        <div style={{ fontSize: 36, fontWeight: 700, color: card.color }}>{card.value}</div>
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value as TicketCategory | "")}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px", color: "#fff", fontSize: 13 }}>
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                </select>
                <select value={filterPriority} onChange={e => setFilterPriority(e.target.value as TicketPriority | "")}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px", color: "#fff", fontSize: 13 }}>
                    <option value="">All Priorities</option>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
                <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px", color: "#fff", fontSize: 13 }}>
                    <option value="">All Roles</option>
                    <option value="resident">Residents</option>
                    <option value="owner">Owners</option>
                </select>
                {(filterStatus || filterCategory || filterPriority || filterRole) && (
                    <button onClick={() => { setFilterStatus(""); setFilterCategory(""); setFilterPriority(""); setFilterRole(""); }}
                        style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "8px 14px", color: "#aaa", fontSize: 13, cursor: "pointer" }}>
                        Clear Filters
                    </button>
                )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 420px" : "1fr", gap: 24 }}>
                {/* Ticket list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {loading ? (
                        <div style={{ textAlign: "center", padding: 48, color: "#555" }}>Loading tickets…</div>
                    ) : tickets.length === 0 ? (
                        <div style={{ textAlign: "center", padding: 48, color: "#555" }}>No tickets found</div>
                    ) : tickets.map(t => (
                        <button key={t._id} onClick={() => openTicket(t)}
                            style={{
                                background: selected?._id === t._id ? "rgba(0,212,255,0.06)" : "rgba(255,255,255,0.03)",
                                border: `1px solid ${selected?._id === t._id ? "rgba(0,212,255,0.4)" : "rgba(255,255,255,0.07)"}`,
                                borderRadius: 14, padding: "16px 20px", textAlign: "left", cursor: "pointer", transition: "all 0.15s",
                            }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                                        <Badge label={t.status.replace("_", " ")} color={STATUS_COLORS[t.status]} />
                                        <Badge label={t.priority} color={PRIORITY_COLORS[t.priority]} />
                                        <span style={{ fontSize: 12, color: "#666" }}>{CATEGORY_LABELS[t.category]}</span>
                                    </div>
                                    <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</div>
                                    <div style={{ fontSize: 13, color: "#888" }}>
                                        {t.userId?.name} ({t.role}) {t.propertyId ? `· ${t.propertyId.name}` : ""}
                                    </div>
                                </div>
                                <div style={{ fontSize: 12, color: "#555", whiteSpace: "nowrap" }}>{timeAgo(t.createdAt)}</div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Detail panel */}
                {selected && (
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 24, maxHeight: "85vh", overflow: "auto" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <div style={{ fontSize: 11, color: "#555", marginBottom: 4, fontFamily: "monospace" }}>#{selected._id.slice(-8).toUpperCase()}</div>
                                <div style={{ fontWeight: 700, fontSize: 16 }}>{selected.title}</div>
                                <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{selected.userId?.name} · {selected.userId?.email}</div>
                            </div>
                            <button onClick={() => setSelected(null)} style={{ background: "transparent", border: "none", color: "#666", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>✕</button>
                        </div>

                        {/* Status controls */}
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {(["open", "in_progress", "resolved"] as TicketStatus[]).map(s => (
                                <button key={s} onClick={() => handleStatus(s)}
                                    style={{
                                        background: selected.status === s ? `${STATUS_COLORS[s]}33` : "transparent",
                                        border: `1px solid ${STATUS_COLORS[s]}`,
                                        color: STATUS_COLORS[s], borderRadius: 8, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600,
                                    }}>
                                    {s.replace("_", " ")}
                                </button>
                            ))}
                        </div>

                        {/* Thread */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 280, overflowY: "auto" }}>
                            {messages.map(msg => (
                                <div key={msg._id} style={{
                                    background: msg.isInternal ? "rgba(255,152,0,0.08)" : "rgba(255,255,255,0.04)",
                                    border: `1px solid ${msg.isInternal ? "rgba(255,152,0,0.2)" : "rgba(255,255,255,0.07)"}`,
                                    borderRadius: 10, padding: "10px 14px",
                                }}>
                                    <div style={{ fontSize: 11, color: msg.isInternal ? "#ff9800" : "#888", marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
                                        <span>{msg.senderId?.name} ({msg.senderRole}){msg.isInternal ? " · Internal" : ""}</span>
                                        <span>{timeAgo(msg.createdAt)}</span>
                                    </div>
                                    <div style={{ fontSize: 13, color: "#ddd" }}>{msg.message}</div>
                                </div>
                            ))}
                        </div>

                        {/* Reply */}
                        <div>
                            <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Reply to this ticket…"
                                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 12px", color: "#fff", fontSize: 13, resize: "vertical", minHeight: 72, boxSizing: "border-box" }} />
                            <button onClick={handleReply} disabled={sending || !reply.trim()}
                                style={{ marginTop: 8, background: "#00d4ff", color: "#000", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: sending || !reply.trim() ? 0.5 : 1 }}>
                                {sending ? "Sending…" : "Send Reply"}
                            </button>
                        </div>

                        {/* Internal note */}
                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14 }}>
                            <div style={{ fontSize: 11, color: "#ff9800", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Internal Note (not visible to user)</div>
                            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add internal note…"
                                style={{ width: "100%", background: "rgba(255,152,0,0.05)", border: "1px solid rgba(255,152,0,0.2)", borderRadius: 10, padding: "10px 12px", color: "#fff", fontSize: 13, resize: "vertical", minHeight: 60, boxSizing: "border-box" }} />
                            <button onClick={handleNote} disabled={sending || !note.trim()}
                                style={{ marginTop: 8, background: "rgba(255,152,0,0.2)", color: "#ff9800", border: "1px solid rgba(255,152,0,0.4)", borderRadius: 10, padding: "8px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer", opacity: sending || !note.trim() ? 0.5 : 1 }}>
                                Save Note
                            </button>
                        </div>

                        {/* Internal notes log */}
                        {(selected.internalNotes?.length ?? 0) > 0 && (
                            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14 }}>
                                <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Notes History</div>
                                {selected.internalNotes!.map((n, i) => (
                                    <div key={i} style={{ background: "rgba(255,152,0,0.05)", borderRadius: 8, padding: "8px 12px", marginBottom: 6, fontSize: 12 }}>
                                        <div style={{ color: "#ff9800", marginBottom: 2 }}>{n.addedBy?.name} · {timeAgo(n.addedAt)}</div>
                                        <div style={{ color: "#ccc" }}>{n.note}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
