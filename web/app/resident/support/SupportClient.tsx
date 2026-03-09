"use client";
import { useState, useEffect, useCallback } from "react";
import {
    createTicket, fetchMyTickets, fetchTicket, replyToTicket,
    SupportTicket, SupportMessage, TicketStatus, TicketCategory, TicketPriority,
    CATEGORY_LABELS, PRIORITY_COLORS, STATUS_COLORS,
} from "@/features/support/support.service";

const CATEGORIES: TicketCategory[] = ["payment", "maintenance", "maintenance_escalation", "technical", "account", "other"];
const PRIORITIES: TicketPriority[] = ["low", "medium", "high", "urgent"];

const FAQS = [
    { q: "How do I pay rent?", a: "Go to Payments in the sidebar. You can pay via Stripe using your card or UPI." },
    { q: "How do I submit a maintenance request?", a: "Go to Requests in the sidebar and click 'New Request'." },
    { q: "My payment shows overdue but I paid?", a: "Contact your owner first. If unresolved, escalate via a support ticket." },
    { q: "How do I contact my property owner?", a: "Owners are notified automatically about your maintenance requests and payments." },
];

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

type View = "help" | "list" | "new" | "thread";

export default function SupportClient() {
    const [view, setView] = useState<View>("help");
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<SupportTicket | null>(null);
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [reply, setReply] = useState("");
    const [sending, setSending] = useState(false);
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [form, setForm] = useState({ title: "", category: "" as TicketCategory | "", priority: "medium" as TicketPriority, message: "" });
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        try { setTickets(await fetchMyTickets()); }
        finally { setLoading(false); }
    }, []);

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
            setSuccessMsg("Ticket submitted ✓ We&apos;ll respond within 24 hours.");
            setForm({ title: "", category: "", priority: "medium", message: "" });
            load();
            setTimeout(() => { setSuccessMsg(""); setView("list"); }, 3000);
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

    const navBtn = (v: View, label: string) => (
        <button onClick={() => { if (v === "list") load(); setView(v); }}
            style={{ background: view === v ? "rgba(0,212,255,0.12)" : "transparent", border: `1px solid ${view === v ? "#00d4ff" : "rgba(255,255,255,0.1)"}`, color: view === v ? "#00d4ff" : "#aaa", borderRadius: 10, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>
            {label}
        </button>
    );

    return (
        <div style={{ padding: "32px 24px", maxWidth: 860, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Help & Support</h1>
                    <p style={{ color: "#888", marginTop: 4, fontSize: 14 }}>Find answers or contact the support team</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    {navBtn("help", "Help Center")}
                    {navBtn("list", "My Tickets")}
                    <button onClick={() => setView("new")}
                        style={{ background: "#00d4ff", color: "#000", border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                        + New Ticket
                    </button>
                </div>
            </div>

            {/* Help / FAQ */}
            {view === "help" && (
                <div>
                    <div style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,212,255,0.02))", border: "1px solid rgba(0,212,255,0.15)", borderRadius: 18, padding: "28px 24px", marginBottom: 24, textAlign: "center" }}>
                        <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
                        <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>How can we help you?</h2>
                        <p style={{ color: "#888", fontSize: 14, margin: 0 }}>Browse common questions below or open a ticket for personal support.</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                        {FAQS.map((faq, i) => (
                            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
                                <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                                    style={{ width: "100%", background: "transparent", border: "none", padding: "16px 20px", textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontWeight: 600, fontSize: 15, color: "#fff" }}>{faq.q}</span>
                                    <span style={{ color: "#555", fontSize: 18 }}>{expandedFaq === i ? "−" : "+"}</span>
                                </button>
                                {expandedFaq === i && (
                                    <div style={{ padding: "0 20px 16px", color: "#aaa", fontSize: 14, lineHeight: 1.6 }}>{faq.a}</div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <p style={{ color: "#666", fontSize: 14, marginBottom: 12 }}>Didn&apos;t find your answer?</p>
                        <button onClick={() => setView("new")} style={{ background: "#00d4ff", color: "#000", border: "none", borderRadius: 12, padding: "12px 32px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                            Open a Support Ticket
                        </button>
                    </div>
                </div>
            )}

            {/* New Ticket */}
            {view === "new" && (
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "28px 24px" }}>
                    <h2 style={{ margin: "0 0 24px", fontSize: 18, fontWeight: 700 }}>Create Support Ticket</h2>
                    {successMsg ? (
                        <div style={{ background: "rgba(76,175,80,0.1)", border: "1px solid rgba(76,175,80,0.3)", borderRadius: 12, padding: 24, color: "#4caf50", textAlign: "center", fontSize: 15 }}>{successMsg}</div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>Title</label>
                                <input style={inputStyle} placeholder="Brief description of your issue…" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                <div>
                                    <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>Issue Type</label>
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
                                <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>Describe your issue</label>
                                <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 110 }} placeholder="Include any error messages, screenshots descriptions, or steps you already tried…" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required />
                            </div>
                            <button type="submit" disabled={submitting} style={{ alignSelf: "flex-start", background: "#00d4ff", color: "#000", border: "none", borderRadius: 10, padding: "12px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: submitting ? 0.6 : 1 }}>
                                {submitting ? "Submitting…" : "Submit Ticket"}
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* My tickets */}
            {view === "list" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {loading ? <div style={{ textAlign: "center", padding: 48, color: "#555" }}>Loading…</div>
                        : tickets.length === 0 ? (
                            <div style={{ textAlign: "center", padding: 48, color: "#555" }}>
                                <div style={{ fontSize: 40, marginBottom: 12 }}>🎫</div>
                                No tickets yet. If you need help, open a ticket!
                            </div>
                        ) : tickets.map(t => (
                            <button key={t._id} onClick={() => openThread(t)}
                                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 20px", textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                                    <div style={{ marginTop: 4, color: "#444" }}>→</div>
                                </div>
                            </button>
                        ))}
                </div>
            )}

            {/* Thread view */}
            {view === "thread" && selected && (
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "24px 20px" }}>
                    <button onClick={() => setView("list")} style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", fontSize: 13, marginBottom: 12, display: "block" }}>← Back to My Tickets</button>
                    <div style={{ marginBottom: 16 }}>
                        <h2 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700 }}>{selected.title}</h2>
                        <div style={{ display: "flex", gap: 8 }}>
                            <Badge label={selected.status.replace("_", " ")} color={STATUS_COLORS[selected.status]} />
                            <Badge label={selected.priority} color={PRIORITY_COLORS[selected.priority]} />
                            <span style={{ fontSize: 12, color: "#666", alignSelf: "center" }}>{CATEGORY_LABELS[selected.category]}</span>
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 380, overflowY: "auto", marginBottom: 20 }}>
                        {messages.map(msg => {
                            const isSupport = msg.senderRole === "super_admin";
                            return (
                                <div key={msg._id} style={{ display: "flex", justifyContent: isSupport ? "flex-start" : "flex-end" }}>
                                    <div style={{ background: isSupport ? "rgba(0,212,255,0.06)" : "rgba(255,255,255,0.04)", border: `1px solid ${isSupport ? "rgba(0,212,255,0.15)" : "rgba(255,255,255,0.07)"}`, borderRadius: 12, padding: "10px 14px", maxWidth: "75%" }}>
                                        <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>
                                            {isSupport ? "🎯 Support Team" : "You"} · {timeAgo(msg.createdAt)}
                                        </div>
                                        <div style={{ fontSize: 14, color: "#ddd" }}>{msg.message}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {selected.status !== "resolved" ? (
                        <div style={{ display: "flex", gap: 10 }}>
                            <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Add more details or reply…"
                                style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, resize: "none", minHeight: 56 }} />
                            <button onClick={handleReply} disabled={sending || !reply.trim()}
                                style={{ alignSelf: "flex-end", background: "#00d4ff", color: "#000", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, cursor: "pointer", opacity: sending ? 0.6 : 1 }}>
                                Send
                            </button>
                        </div>
                    ) : (
                        <div style={{ background: "rgba(76,175,80,0.08)", border: "1px solid rgba(76,175,80,0.2)", borderRadius: 10, padding: "12px 16px", color: "#4caf50", fontSize: 13, textAlign: "center" }}>
                            ✓ Resolved — <button onClick={() => setView("new")} style={{ background: "transparent", border: "none", color: "#4caf50", textDecoration: "underline", cursor: "pointer", fontSize: 13 }}>Open a new ticket</button> if you need more help.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
