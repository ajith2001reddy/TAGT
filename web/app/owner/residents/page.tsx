"use client";

import { useEffect, useState } from "react";
import { Resident, fetchResidents, createResident, deactivateResident, moveResidentRoom, addResidentNote, fetchResidentHistory, ResidentHistory, sendNotification as sendResidentNotification } from "@/features/owner/residents.service";
import { fetchRooms } from "@/features/owner/rooms.service";

interface Room { _id: string; roomNumber: string; totalBeds: number; occupiedBeds: number; }

function Avatar({ name }: { name: string }) {
    const initials = name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();
    const hue = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
    return (
        <div style={{ width: "38px", height: "38px", borderRadius: "10px", flexShrink: 0, background: `hsl(${hue},45%,22%)`, border: `1px solid hsl(${hue},55%,32%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-display)", color: `hsl(${hue},75%,72%)` }}>{initials}</div>
    );
}

function StatusBadge({ active }: { active: boolean }) {
    return <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.08em", padding: "3px 9px", borderRadius: "5px", textTransform: "uppercase", background: active ? "var(--green-bg)" : "var(--red-bg)", color: active ? "var(--green)" : "var(--red)", border: `1px solid ${active ? "rgba(0,230,118,0.2)" : "rgba(255,82,82,0.2)"}` }}>{active ? "Active" : "Inactive"}</span>;
}

function PaymentHistoryPanel({ residentId }: { residentId: string }) {
    const [data, setData] = useState<ResidentHistory | null>(null);
    useEffect(() => {
        fetchResidentHistory(residentId).then(setData).catch(() => { });
    }, [residentId]);
    if (!data) return <div className="skeleton" style={{ height: "60px", borderRadius: "8px" }} />;
    const STATUS_COLOR: Record<string, string> = { paid: "#34d399", pending: "#fbbf24", overdue: "var(--red)" };
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "260px", overflowY: "auto" }}>
            {data.payments.length === 0 ? <div style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>No payment history</div> : data.payments.map(p => (
                <div key={p._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "var(--bg-elevated)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                    <div>
                        <div style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{p.month}</div>
                        {p.lateFee ? <div style={{ fontSize: "10px", color: "var(--red)" }}>+₹{p.lateFee} late fee</div> : null}
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "14px", fontWeight: 700, fontFamily: "var(--font-display)" }}>₹{p.amount.toLocaleString()}</div>
                        <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", fontWeight: 700, color: STATUS_COLOR[p.status] || "var(--text-tertiary)", textTransform: "uppercase" }}>{p.status}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function ResidentsPage() {
    const [residents, setResidents] = useState<Resident[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [form, setForm] = useState({ name: "", email: "", roomId: "" });
    const [creating, setCreating] = useState(false);
    const [selected, setSelected] = useState<Resident | null>(null);
    const [drawerTab, setDrawerTab] = useState<"history" | "notes" | "notify" | "actions">("history");
    const [newNote, setNewNote] = useState("");
    const [addingNote, setAddingNote] = useState(false);
    const [moveRoomId, setMoveRoomId] = useState("");
    const [moving, setMoving] = useState(false);
    const [notifyMessage, setNotifyMessage] = useState("");
    const [notifyType, setNotifyType] = useState("info");
    const [sendingNotify, setSendingNotify] = useState(false);

    async function fetchData() {
        try {
            const [resData, roomData] = await Promise.all([fetchResidents(), fetchRooms()]);
            setResidents(resData);
            setRooms(roomData as any);
        } catch { setError("Failed to load data."); } finally { setLoading(false); }
    }
    useEffect(() => { fetchData(); }, []);

    async function handleCreate(e: any) {
        e.preventDefault(); setError(""); setCreating(true);
        try {
            await createResident({ name: form.name, email: form.email, roomId: form.roomId || null });
            setShowForm(false); setForm({ name: "", email: "", roomId: "" }); setLoading(true); await fetchData();
        } catch (err: any) { setError(err.response?.data?.message || "Failed to create resident."); }
        finally { setCreating(false); }
    }

    async function handleDeactivate(id: string) {
        if (!confirm("Deactivate this resident? They will lose access.")) return;
        try { await deactivateResident(id); await fetchData(); setSelected(null); }
        catch (err: any) { setError(err.response?.data?.message || "Failed."); }
    }

    async function handleMoveRoom() {
        if (!selected || !moveRoomId) return;
        setMoving(true);
        try { await moveResidentRoom(selected._id, moveRoomId); await fetchData(); setMoveRoomId(""); }
        catch (err: any) { setError(err.response?.data?.message || "Move failed."); }
        finally { setMoving(false); }
    }

    async function handleAddNote() {
        if (!selected || !newNote.trim()) return;
        setAddingNote(true);
        try {
            const res = await addResidentNote(selected._id, newNote);
            setSelected(s => s ? { ...s, notes: res.data.data } : s);
            setNewNote("");
            await fetchData();
        } catch { setError("Failed to add note."); }
        finally { setAddingNote(false); }
    }

    async function handleNotify() {
        if (!selected || !notifyMessage.trim()) return;
        setSendingNotify(true);
        try {
            await sendResidentNotification(selected._id, notifyType, notifyMessage);
            setNotifyMessage("");
            alert("Notification sent!");
        } catch { setError("Failed to send notification."); }
        finally { setSendingNotify(false); }
    }

    const filtered = residents.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase()));
    const active = residents.filter(r => r.isActive !== false).length;

    const DrawerTabBtn = ({ tab, label }: { tab: typeof drawerTab; label: string }) => (
        <button onClick={() => setDrawerTab(tab)} style={{ flex: 1, padding: "8px", borderRadius: "7px", border: "none", cursor: "pointer", background: drawerTab === tab ? "var(--accent-primary)" : "transparent", color: drawerTab === tab ? "#000" : "var(--text-secondary)", fontSize: "12px", fontWeight: drawerTab === tab ? 700 : 400, transition: "all 0.15s" }}>{label}</button>
    );

    return (
        <div className="animate-fade-in" style={{ display: "flex", gap: "20px" }}>
            {/* Main content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                        <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Tenant Management</div>
                        <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "4px" }}>Residents</h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{residents.length} total · <span style={{ color: "#34d399" }}>{active} active</span></p>
                    </div>
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ fontSize: "13px", gap: "8px" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Add Resident
                    </button>
                </div>

                {error && <div style={{ background: "var(--red-bg)", border: "1px solid rgba(255,82,82,0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", color: "var(--red)", fontSize: "13px", display: "flex", gap: "10px", alignItems: "center" }}>{error}<button onClick={() => setError("")} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: "18px" }}>×</button></div>}

                {showForm && (
                    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" }}>
                        <div className="glass-card animate-fade-up" style={{ padding: "32px", width: "440px", maxWidth: "90vw" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700 }}>Add Resident</h3>
                                <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: "20px" }}>×</button>
                            </div>
                            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                {[{ label: "Full Name", key: "name", type: "text", placeholder: "John Doe" }, { label: "Email", key: "email", type: "email", placeholder: "john@email.com" }].map(({ label, key, type, placeholder }) => (
                                    <div key={key}>
                                        <label style={{ display: "block", fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "6px" }}>{label}</label>
                                        <input className="input-field" type={type} placeholder={placeholder} required value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                                    </div>
                                ))}
                                <div>
                                    <label style={{ display: "block", fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "6px" }}>Room</label>
                                    <select className="input-field" value={form.roomId} onChange={e => setForm({ ...form, roomId: e.target.value })}>
                                        <option value="">— Unassigned —</option>
                                        {rooms.filter(r => r.occupiedBeds < r.totalBeds).map(r => <option key={r._id} value={r._id}>Room {r.roomNumber} ({r.occupiedBeds}/{r.totalBeds} beds)</option>)}
                                    </select>
                                </div>
                                <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                                    <button type="submit" className="btn-primary" disabled={creating} style={{ flex: 1 }}>{creating ? "Creating…" : "Create"}</button>
                                    <button type="button" className="btn-ghost" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Search */}
                <div style={{ position: "relative", marginBottom: "16px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input className="input-field" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: "40px" }} />
                </div>

                {/* Table */}
                <div className="glass-card" style={{ overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                                {["Resident", "Room", "Status", ""].map(h => (
                                    <th key={h} style={{ padding: "13px 18px", textAlign: "left", fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", fontWeight: 500 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={4} style={{ padding: "12px 18px" }}><div className="skeleton" style={{ height: "18px", borderRadius: "5px" }} /></td></tr>)
                                : filtered.length === 0 ? <tr><td colSpan={4} style={{ padding: "60px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "14px" }}>{search ? `No matches for "${search}"` : "No residents yet"}</td></tr>
                                    : filtered.map(r => (
                                        <tr key={r._id} style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.15s", cursor: "pointer", background: selected?._id === r._id ? "rgba(0,212,255,0.04)" : "" }}
                                            onClick={() => { setSelected(r); setDrawerTab("history"); }}
                                            onMouseEnter={e => selected?._id !== r._id && ((e.currentTarget as HTMLElement).style.background = "var(--bg-card-hover)")}
                                            onMouseLeave={e => selected?._id !== r._id && ((e.currentTarget as HTMLElement).style.background = "")}>
                                            <td style={{ padding: "14px 18px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                    <Avatar name={r.name} />
                                                    <div>
                                                        <div style={{ fontSize: "14px", fontWeight: 600 }}>{r.name}</div>
                                                        <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{r.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: "14px 18px" }}>
                                                {r.roomId ? <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "3px 9px" }}>Room {r.roomId.roomNumber}</span>
                                                    : <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>—</span>}
                                            </td>
                                            <td style={{ padding: "14px 18px" }}><StatusBadge active={r.isActive !== false} /></td>
                                            <td style={{ padding: "14px 18px" }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Drawer */}
            {selected && (
                <div className="animate-fade-in" style={{ width: "320px", minWidth: "320px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "18px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", alignSelf: "flex-start", position: "sticky", top: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <Avatar name={selected.name} />
                            <div>
                                <div style={{ fontWeight: 700, fontSize: "14px" }}>{selected.name}</div>
                                <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{selected.email}</div>
                            </div>
                        </div>
                        <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: "18px" }}>×</button>
                    </div>

                    <div style={{ display: "flex", background: "var(--bg-card)", borderRadius: "9px", padding: "4px", gap: "3px" }}>
                        <DrawerTabBtn tab="history" label="History" />
                        <DrawerTabBtn tab="notes" label="Notes" />
                        <DrawerTabBtn tab="notify" label="Notify" />
                        <DrawerTabBtn tab="actions" label="Actions" />
                    </div>

                    {drawerTab === "history" && <PaymentHistoryPanel residentId={selected._id} />}

                    {drawerTab === "notes" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                                {(selected.notes || []).length === 0
                                    ? <div style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>No notes yet</div>
                                    : (selected.notes || []).map((n, i) => (
                                        <div key={i} style={{ background: "var(--bg-elevated)", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                                            <div style={{ fontSize: "13px", marginBottom: "4px" }}>{n.text}</div>
                                            <div style={{ fontSize: "10px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{new Date(n.addedAt).toLocaleDateString()}</div>
                                        </div>
                                    ))
                                }
                            </div>
                            <textarea className="input-field" placeholder="Add a note…" value={newNote} onChange={e => setNewNote(e.target.value)} style={{ resize: "vertical", minHeight: "72px", fontSize: "13px" }} />
                            <button className="btn-primary" onClick={handleAddNote} disabled={addingNote || !newNote.trim()} style={{ fontSize: "13px" }}>{addingNote ? "Adding…" : "Add Note"}</button>
                        </div>
                    )}

                    {drawerTab === "notify" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "6px" }}>Type</label>
                                <select className="input-field" value={notifyType} onChange={e => setNotifyType(e.target.value)} style={{ fontSize: "13px" }}>
                                    <option value="info">Information</option>
                                    <option value="success">Success</option>
                                    <option value="warning">Warning</option>
                                    <option value="danger">Danger / Critical</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "6px" }}>Message</label>
                                <textarea className="input-field" placeholder="Type your message to the resident…" value={notifyMessage} onChange={e => setNotifyMessage(e.target.value)} style={{ resize: "vertical", minHeight: "100px", fontSize: "13px" }} />
                            </div>
                            <button className="btn-primary" onClick={handleNotify} disabled={sendingNotify || !notifyMessage.trim()} style={{ fontSize: "13px" }}>
                                {sendingNotify ? "Sending…" : "Send Notification"}
                            </button>
                        </div>
                    )}

                    {drawerTab === "actions" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {/* Move room */}
                            <div>
                                <label style={{ display: "block", fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "6px" }}>Move to Room</label>
                                <select className="input-field" value={moveRoomId} onChange={e => setMoveRoomId(e.target.value)} style={{ marginBottom: "8px", fontSize: "13px" }}>
                                    <option value="">Select room…</option>
                                    {rooms.filter(r => r._id !== selected.roomId?._id && r.occupiedBeds < r.totalBeds).map(r => (
                                        <option key={r._id} value={r._id}>Room {r.roomNumber} ({r.occupiedBeds}/{r.totalBeds})</option>
                                    ))}
                                </select>
                                <button className="btn-ghost" onClick={handleMoveRoom} disabled={!moveRoomId || moving} style={{ width: "100%", fontSize: "13px" }}>{moving ? "Moving…" : "Move Resident"}</button>
                            </div>

                            {/* Deactivate */}
                            {selected.isActive !== false && (
                                <button onClick={() => handleDeactivate(selected._id)} style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid rgba(255,82,82,0.3)", background: "var(--red-bg)", color: "var(--red)", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,82,82,0.12)"}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--red-bg)"}
                                >
                                    Deactivate Resident
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}