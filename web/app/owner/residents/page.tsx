"use client";

import { useEffect, useState } from "react";
import { Resident, fetchResidents, createResident, deactivateResident, moveResidentRoom, addResidentNote, fetchResidentHistory, ResidentHistory, sendNotification as sendResidentNotification } from "@/features/owner/residents.service";
import { fetchRooms } from "@/features/owner/rooms.service";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

interface Room { _id: string; roomNumber: string; totalBeds: number; occupiedBeds: number; }

function Avatar({ name }: { name: string }) {
    const initials = name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();
    const hue = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
    return (
        <div style={{ width: "38px", height: "38px", borderRadius: "10px", flexShrink: 0, background: `hsl(${hue},45%,22%)`, border: `1px solid hsl(${hue},55%,32%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-display)", color: `hsl(${hue},75%,72%)` }}>{initials}</div>
    );
}

function StatusBadge({ active }: { active: boolean }) {
    return <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.08em", padding: "3px 9px", borderRadius: "5px", textTransform: "uppercase", background: active ? "rgba(52,211,153,0.1)" : "rgba(244,63,94,0.1)", color: active ? "#10b981" : "#f43f5e", border: `1px solid ${active ? "rgba(52,211,153,0.2)" : "rgba(244,63,94,0.2)"}` }}>{active ? "Active" : "Inactive"}</span>;
}

function PaymentHistoryPanel({ residentId }: { residentId: string }) {
    const [data, setData] = useState<ResidentHistory | null>(null);
    useEffect(() => {
        fetchResidentHistory(residentId).then(setData).catch(() => { });
    }, [residentId]);
    if (!data) return <div className="skeleton" style={{ height: "60px", borderRadius: "8px" }} />;
    const STATUS_COLOR: Record<string, string> = { paid: "#34d399", pending: "#fbbf24", overdue: "#f43f5e" };
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "260px", overflowY: "auto" }}>
            {data.payments.length === 0 ? <div style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>No payment history</div> : data.payments.map(p => (
                <div key={p._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "var(--bg-elevated)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                    <div>
                        <div style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{p.month}</div>
                        {p.lateFee ? <div style={{ fontSize: "10px", color: "#f43f5e" }}>+₹{p.lateFee}</div> : null}
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
    const { dbUser } = useAuth();
    const [residents, setResidents] = useState<Resident[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    
    const initialForm = { 
        name: "", 
        email: "", 
        phoneNumber: "", 
        alternateNumber: "", 
        gender: "male", 
        aadhaarNumber: "", 
        companyName: "", 
        relation: "", 
        roomId: "" 
    };
    const [form, setForm] = useState(initialForm);
    
    const [creating, setCreating] = useState(false);
    const [selected, setSelected] = useState<Resident | null>(null);
    const [drawerTab, setDrawerTab] = useState<"details" | "history" | "notes" | "notify" | "actions">("details");
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
            setRooms(roomData as unknown as Room[]);
        } catch { setError("Failed to load data."); } finally { setLoading(false); }
    }
    useEffect(() => { fetchData(); }, []);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault(); setError(""); setCreating(true);
        try {
            // @ts-ignore -roomId is string in form but object in Resident interface
            await createResident(form);
            setShowForm(false); 
            setForm(initialForm); 
            toast.success("Resident added successfully");
            setLoading(true); await fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create resident.");
        }
        finally { setCreating(false); }
    }

    async function handleDeactivate(id: string) {
        if (!confirm("Deactivate this resident? They will lose access to the portal.")) return;
        try { await deactivateResident(id); await fetchData(); setSelected(null); toast.success("Resident deactivated"); }
        catch (err: any) {
            setError(err.response?.data?.message || "Failed deactivate.");
        }
    }

    async function handleMoveRoom() {
        if (!selected || !moveRoomId) return;
        setMoving(true);
        try { await moveResidentRoom(selected._id, moveRoomId); await fetchData(); setMoveRoomId(""); toast.success("Room updated"); }
        catch (err: any) {
            setError(err.response?.data?.message || "Move failed.");
        }
        finally { setMoving(false); }
    }

    async function handleAddNote() {
        if (!selected || !newNote.trim()) return;
        setAddingNote(true);
        try {
            const res = await addResidentNote(selected._id, newNote);
            setSelected(s => s ? { ...s, notes: res.data.data } : s);
            setNewNote("");
            toast.success("Note added");
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
            toast.success("Notification sent!");
        } catch { setError("Failed to send notification."); }
        finally { setSendingNotify(false); }
    }

    const filtered = residents.filter(r => 
        !search || 
        r.name.toLowerCase().includes(search.toLowerCase()) || 
        r.email.toLowerCase().includes(search.toLowerCase()) ||
        r.aadhaarNumber?.includes(search)
    );
    const active = residents.filter(r => r.isActive !== false).length;

    const DrawerTabBtn = ({ tab, label }: { tab: typeof drawerTab; label: string }) => (
        <button onClick={() => setDrawerTab(tab)} style={{ flex: 1, padding: "8px", borderRadius: "7px", border: "none", cursor: "pointer", background: drawerTab === tab ? "var(--accent-primary)" : "transparent", color: drawerTab === tab ? "#000" : "var(--text-secondary)", fontSize: "11px", fontWeight: drawerTab === tab ? 700 : 400, transition: "all 0.15s" }}>{label}</button>
    );

    return (
        <div className="animate-fade-in" style={{ display: "flex", gap: "20px" }}>
            {/* Main content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                        <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Management</div>
                        <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "4px" }}>Residents</h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{residents.length} total residents · <span style={{ color: "#10b981" }}>{active} active</span></p>
                    </div>
                    <button className="btn-primary" onClick={() => (dbUser?.verification?.status === 'approved' ? setShowForm(true) : alert("Your account is pending verification."))}>
                        Add New Resident
                    </button>
                </div>

                {error && <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", color: "#f43f5e", fontSize: "13px" }}>{error}</div>}

                {showForm && (
                    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" }}>
                        <div className="glass-card animate-fade-up" style={{ padding: "32px", width: "540px", maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 800 }}>Add New Resident</h3>
                                <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: "24px" }}>×</button>
                            </div>
                            
                            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                    <FormGroup label="Full Name" value={form.name} onChange={(v: string) => setForm({...form, name: v})} required placeholder="John Doe" />
                                    <FormGroup label="Email Address" value={form.email} onChange={(v: string) => setForm({...form, email: v})} required type="email" placeholder="john@example.com" />
                                </div>
                                
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                    <FormGroup label="Mobile Number" value={form.phoneNumber} onChange={(v: string) => setForm({...form, phoneNumber: v})} required placeholder="+91..." />
                                    <FormGroup label="Alternate Number" value={form.alternateNumber} onChange={(v: string) => setForm({...form, alternateNumber: v})} placeholder="Emergency contact" />
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                    <div>
                                        <label style={labelStyle}>Gender</label>
                                        <select className="input-field" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <FormGroup label="Aadhaar Number" value={form.aadhaarNumber} onChange={(v: string) => setForm({...form, aadhaarNumber: v})} placeholder="12 digit number" />
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                    <FormGroup label="Company Name" value={form.companyName} onChange={(v: string) => setForm({...form, companyName: v})} placeholder="Workplace" />
                                    <FormGroup label="Relation" value={form.relation} onChange={(v: string) => setForm({...form, relation: v})} placeholder="Self, Employee, etc." />
                                </div>

                                <div>
                                    <label style={labelStyle}>Initial Room Assignment</label>
                                    <select className="input-field" value={form.roomId} onChange={e => setForm({ ...form, roomId: e.target.value })}>
                                        <option value="">— Unassigned —</option>
                                        {rooms.filter(r => r.occupiedBeds < r.totalBeds).map(r => <option key={r._id} value={r._id}>Room {r.roomNumber} ({r.occupiedBeds}/{r.totalBeds} occupied)</option>)}
                                    </select>
                                </div>

                                <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                                    <button type="button" className="btn-secondary" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancel</button>
                                    <button type="submit" className="btn-primary" disabled={creating} style={{ flex: 1 }}>{creating ? "Adding..." : "Add Resident"}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Search */}
                <div style={{ position: "relative", marginBottom: "16px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input className="input-field" placeholder="Search by name, email, or Aadhaar…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: "40px" }} />
                </div>

                {/* Table */}
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "20px", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border-default)" }}>
                                {["Resident Info", "Room", "Aadhaar / KYC", "Status", ""].map(h => (
                                    <th key={h} style={{ padding: "14px 18px", textAlign: "left", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-tertiary)", fontWeight: 700 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center" }}>Fetching resident directory...</td></tr>
                                : filtered.length === 0 ? <tr><td colSpan={5} style={{ padding: "60px", textAlign: "center", color: "var(--text-tertiary)" }}>{search ? `No results for "${search}"` : "Add your first resident to get started."}</td></tr>
                                    : filtered.map(r => (
                                        <tr key={r._id} style={{ borderBottom: "1px solid var(--border-default)", transition: "all 0.2s", cursor: "pointer", background: selected?._id === r._id ? "rgba(0,184,212,0.05)" : "" }}
                                            onClick={() => { setSelected(r); setDrawerTab("details"); }}>
                                            <td style={{ padding: "14px 18px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                    <Avatar name={r.name} />
                                                    <div>
                                                        <div style={{ fontSize: "14px", fontWeight: 700 }}>{r.name}</div>
                                                        <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{r.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: "14px 18px" }}>
                                                {r.roomId ? <span style={{ fontSize: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "3px 9px", fontWeight: 600 }}>Room {r.roomId.roomNumber}</span>
                                                    : <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>Unassigned</span>}
                                            </td>
                                            <td style={{ padding: "14px 18px" }}>
                                                <div style={{ fontSize: "12px", fontWeight: 500 }}>{r.aadhaarNumber || "None"}</div>
                                                <div style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>{r.gender || "—"}</div>
                                            </td>
                                            <td style={{ padding: "14px 18px" }}><StatusBadge active={r.isActive !== false} /></td>
                                            <td style={{ padding: "14px 18px", textAlign: "right" }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sidebar Drawer */}
            {selected && (
                <div className="animate-fade-in" style={{ width: "340px", minWidth: "340px", background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "24px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px", alignSelf: "flex-start", position: "sticky", top: "20px", boxShadow: "var(--shadow-xl)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            <Avatar name={selected.name} />
                            <div>
                                <div style={{ fontWeight: 800, fontSize: "16px" }}>{selected.name}</div>
                                <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{selected.email}</div>
                            </div>
                        </div>
                        <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: "24px" }}>×</button>
                    </div>

                    <div style={{ display: "flex", background: "var(--bg-subtle)", borderRadius: "10px", padding: "4px", gap: "2px" }}>
                        <DrawerTabBtn tab="details" label="Profile" />
                        <DrawerTabBtn tab="history" label="Billing" />
                        <DrawerTabBtn tab="notes" label="Notes" />
                        <DrawerTabBtn tab="actions" label="More" />
                    </div>

                    {drawerTab === "details" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <DetailItem label="Mobile" value={selected.phoneNumber || "N/A"} />
                            <DetailItem label="Emergency" value={selected.alternateNumber || "N/A"} />
                            <DetailItem label="Gender" value={selected.gender || "N/A"} />
                            <DetailItem label="Aadhaar" value={selected.aadhaarNumber || "N/A"} />
                            <DetailItem label="Company" value={selected.companyName || "N/A"} />
                            <DetailItem label="Relation" value={selected.relation || "Self"} />
                            <div style={{ marginTop: "10px", padding: "12px", background: "var(--bg-subtle)", borderRadius: "12px", border: "1px solid var(--border-default)" }}>
                                <div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "4px" }}>Verification Status</div>
                                <div style={{ fontSize: "13px", fontWeight: 600 }}>Resident Portal Active</div>
                            </div>
                        </div>
                    )}

                    {drawerTab === "history" && <PaymentHistoryPanel residentId={selected._id} />}

                    {drawerTab === "notes" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ maxHeight: "240px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
                                {(selected.notes || []).length === 0
                                    ? <div style={{ color: "var(--text-tertiary)", fontSize: "13px", padding: "20px", textAlign: "center" }}>No internal notes saved.</div>
                                    : (selected.notes || []).map((n, i) => (
                                        <div key={i} style={{ background: "var(--bg-subtle)", padding: "12px", borderRadius: "12px", border: "1px solid var(--border-default)" }}>
                                            <div style={{ fontSize: "13px", lineHeight: 1.4 }}>{n.text}</div>
                                            <div style={{ fontSize: "10px", color: "var(--text-tertiary)", marginTop: "6px" }}>{new Date(n.addedAt).toLocaleDateString()}</div>
                                        </div>
                                    ))
                                }
                            </div>
                            <textarea className="input-field" placeholder="Write a note..." value={newNote} onChange={e => setNewNote(e.target.value)} style={{ minHeight: "80px", fontSize: "13px" }} />
                            <button className="btn-primary" onClick={handleAddNote} disabled={addingNote || !newNote.trim()}>{addingNote ? "Adding..." : "Save Note"}</button>
                        </div>
                    )}

                    {drawerTab === "actions" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div>
                                <label style={labelStyle}>Transfer to Room</label>
                                <select className="input-field" value={moveRoomId} onChange={e => setMoveRoomId(e.target.value)} style={{ marginBottom: "8px" }}>
                                    <option value="">Choose new room...</option>
                                    {rooms.filter(r => r._id !== selected.roomId?._id && r.occupiedBeds < r.totalBeds).map(r => (
                                        <option key={r._id} value={r._id}>Room {r.roomNumber} ({r.occupiedBeds}/{r.totalBeds})</option>
                                    ))}
                                </select>
                                <button className="btn-ghost" onClick={handleMoveRoom} disabled={!moveRoomId || moving} style={{ width: "100%" }}>{moving ? "Moving..." : "Execute Transfer"}</button>
                            </div>

                            <div style={{ height: "1px", background: "var(--border-default)" }} />

                            <div>
                                <label style={labelStyle}>Communicate</label>
                                <button className="btn-secondary" style={{ width: "100%", justifyContent: "flex-start", gap: "8px" }} onClick={() => setDrawerTab("notify")}>
                                    Send Portal Notification
                                </button>
                            </div>

                            {selected.isActive !== false && (
                                <button onClick={() => handleDeactivate(selected._id)} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #fee2e2", background: "#fef2f2", color: "#f43f5e", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
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

function FormGroup({ label, value, onChange, type = "text", placeholder, required = false }: any) {
    return (
        <div>
            <label style={labelStyle}>{label} {required && "*"}</label>
            <input className="input-field" type={type} placeholder={placeholder} required={required} value={value} onChange={e => onChange(e.target.value)} />
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", paddingBottom: "8px", borderBottom: "1px solid var(--border-subtle)" }}>
            <span style={{ color: "var(--text-tertiary)" }}>{label}</span>
            <span style={{ fontWeight: 600 }}>{value}</span>
        </div>
    );
}

const labelStyle = { display: "block", fontSize: "10px", fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: "var(--text-tertiary)", marginBottom: "6px" };