"use client";
import { useState, useEffect, useCallback } from "react";
import {
    createTicket, fetchMyTickets, fetchTicket, replyToTicket,
    SupportTicket, SupportMessage, TicketStatus, TicketCategory, TicketPriority,
    CATEGORY_LABELS, PRIORITY_COLORS, STATUS_COLORS,
} from "@/features/support/support.service";

const CATEGORIES: TicketCategory[] = ["payment", "billing", "technical", "account", "maintenance_escalation", "other"];
const PRIORITIES: TicketPriority[] = ["low", "medium", "high", "urgent"];

function Badge({ label, color }: { label: string; color: string }) {
    return (
        <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, background: `${color}22`, color, fontSize: 11, fontWeight: 600, border: `1px solid ${color}44` }}>
            {label}
        </span>
    );
}

function timeAgo(date: string) {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

type View = "list" | "new" | "thread";

export default function OwnerSupportPage() {
    const [view, setView] = useState<View>("list");
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<SupportTicket | null>(null);
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [reply, setReply] = useState("");
    const [sending, setSending] = useState(false);

    const [form, setForm] = useState({ title: "", category: "" as TicketCategory | "", priority: "medium" as TicketPriority, message: "" });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        try { setTickets(await fetchMyTickets()); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openThread = async (t: SupportTicket) => {
        setSelected(t);
        const { messages: msgs } = await fetchTicket(t._id);
        setMessages(msgs);
        setView("thread");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.category || !form.message) return;
        setSubmitting(true);
        try {
            await createTicket({ title: form.title, category: form.category as TicketCategory, priority: form.priority, message: form.message });
            setSuccess("Your ticket was submitted. Our support team will respond shortly.");
            setForm({ title: "", category: "", priority: "medium", message: "" });
            load();
            setTimeout(() => { setSuccess(""); setView("list"); }, 3000);
        } finally { setSubmitting(false); }
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

    const inputStyle: React.CSSProperties = {
        width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 14, boxSizing: "border-box",
    };

    return (
        <div style={{ padding: "32px 24px", maxWidth: 900, margin: "0 auto" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Support</h1>
                    <p style={{ color: "#888", marginTop: 4, fontSize: 14 }}>Contact the TAGT support team for help</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setView("list")} style={{ background: view === "list" ? "rgba(0,212,255,0.12)" : "transparent", border: `1px solid ${view === "list" ? "#00d4ff" : "rgba(255,255,255,0.12)"}`, color: view === "list" ? "#00d4ff" : "#aaa", borderRadius: 10, padding: "8px 18px", fontSize: 13, cursor: "pointer" }}>My Tickets</button>
                    <button onClick={() => setView("new")} style={{ background: view === "new" ? "rgba(0,212,255,0.12)" : "#00d4ff22", border: `1px solid ${view === "new" ? "#00d4ff" : "rgba(0,212,255,0.3)"}`, color: "#00d4ff", borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ New Ticket</button>
                </div>
            </div>

            {/* Help tips */}
            {view === "list" && (
                <div style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: 14, padding: "16px 20px", marginBottom: 24 }}>
                    <div style={{ fontWeight: 600, color: "#00d4ff", marginBottom: 10, fontSize: 14 }}>💡 Common Questions</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 13, color: "#aaa" }}>
                        {["How to add a new resident", "How to create rooms and beds", "Setting up Razorpay payments", "How to export reports"].map(q => (
                            <div key={q} style={{ padding: "6px 0" }}>→ {q}</div>
                        ))}
                    </div>
                    <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>Can&apos;t find your answer? Open a support ticket and we&apos;ll respond within 24 hours.</div>
                </div>
            )}

            {/* New Ticket Form */}
            {view === "new" && (
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "28px 24px" }}>
                    <h2 style={{ margin: "0 0 24px", fontSize: 18, fontWeight: 700 }}>Open a Support Ticket</h2>
                    {success ? (
                        <div style={{ background: "rgba(76,175,80,0.1)", border: "1px solid rgba(76,175,80,0.3)", borderRadius: 12, padding: 20, color: "#4caf50", textAlign: "center" }}>{success}</div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>Title</label>
                                <input style={inputStyle} placeholder="Brief description of your issue…" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                <div>
                                    <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>Category</label>
                                    <select style={inputStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as TicketCategory }))} required>
                                        <option value="">Select category</option>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>Priority</label>
                                    <select style={inputStyle} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as TicketPriority }))}>
                                        {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>Message</label>
                                <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 100 }} placeholder="Describe your issue in detail…" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required />
                            </div>
                            <button type="submit" disabled={submitting} style={{ alignSelf: "flex-start", background: "#00d4ff", color: "#000", border: "none", borderRadius: 10, padding: "12px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: submitting ? 0.6 : 1 }}>
                                {submitting ? "Submitting…" : "Submit Ticket"}
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* Ticket thread */}
            {view === "thread" && selected && (
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "24px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                        <div>
                            <button onClick={() => setView("list")} style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", fontSize: 13, marginBottom: 6 }}>← Back</button>
                            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{selected.title}</h2>
                            <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                                <Badge label={selected.status.replace("_", " ")} color={STATUS_COLORS[selected.status]} />
                                <Badge label={selected.priority} color={PRIORITY_COLORS[selected.priority]} />
                            </div>
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 380, overflowY: "auto", marginBottom: 20 }}>
                        {messages.map(msg => (
                            <div key={msg._id} style={{ background: msg.senderRole === "super_admin" ? "rgba(0,212,255,0.06)" : "rgba(255,255,255,0.04)", border: `1px solid ${msg.senderRole === "super_admin" ? "rgba(0,212,255,0.15)" : "rgba(255,255,255,0.07)"}`, borderRadius: 12, padding: "12px 16px", alignSelf: msg.senderRole === "super_admin" ? "flex-start" : "flex-end", maxWidth: "80%" }}>
                                <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{msg.senderId?.name} · {timeAgo(msg.createdAt)}</div>
                                <div style={{ fontSize: 14, color: "#ddd" }}>{msg.message}</div>
                            </div>
                        ))}
                    </div>
                    {selected.status !== "resolved" && (
                        <div style={{ display: "flex", gap: 10 }}>
                            <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply…" style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, resize: "none", minHeight: 56 }} />
                            <button onClick={handleReply} disabled={sending || !reply.trim()} style={{ alignSelf: "flex-end", background: "#00d4ff", color: "#000", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, cursor: "pointer", opacity: sending ? 0.6 : 1 }}>
                                Send
                            </button>
                        </div>
                    )}
                    {selected.status === "resolved" && (
                        <div style={{ background: "rgba(76,175,80,0.08)", border: "1px solid rgba(76,175,80,0.2)", borderRadius: 10, padding: "12px 16px", color: "#4caf50", fontSize: 13, textAlign: "center" }}>
                            ✓ This ticket has been resolved. Open a new ticket if you need further help.
                        </div>
                    )}
                </div>
            )}

            {/* Ticket list */}
            {view === "list" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {loading ? <div style={{ textAlign: "center", padding: 48, color: "#555" }}>Loading…</div>
                        : tickets.length === 0 ? <div style={{ textAlign: "center", padding: 48, color: "#555" }}>No tickets yet. Open one if you need help!</div>
                            : tickets.map(t => (
                                <button key={t._id} onClick={() => openThread(t)}
                                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 20px", textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                                    <div>
                                        <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                                            <Badge label={t.status.replace("_", " ")} color={STATUS_COLORS[t.status]} />
                                            <Badge label={t.priority} color={PRIORITY_COLORS[t.priority]} />
                                        </div>
                                        <div style={{ fontWeight: 600, fontSize: 15 }}>{t.title}</div>
                                        <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{CATEGORY_LABELS[t.category]}</div>
                                    </div>
                                    <div style={{ fontSize: 12, color: "#555", textAlign: "right" }}>
                                        <div>{timeAgo(t.createdAt)}</div>
                                        <div style={{ color: "#444", marginTop: 4 }}>→</div>
                                    </div>
                                </button>
                            ))}
                </div>
            )}
        </div>
    );
}
