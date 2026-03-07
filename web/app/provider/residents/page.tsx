"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Building2, UserCheck, Search, X, ChevronRight, AlertCircle, PencilLine, CheckCircle, Trash2 } from "lucide-react";

interface Resident {
    _id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    status: string;
    isActive: boolean;
    propertyId?: { _id: string; name: string } | null;
    roomId?: { _id: string; roomNumber: string } | null;
    createdAt: string;
}

interface Property { _id: string; name: string; city: string; }
interface Room { _id: string; roomNumber: string; totalBeds: number; occupiedBeds: number; }

function Avatar({ name }: { name: string }) {
    const initials = (name || "?").split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();
    const hue = (name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
    return (
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0, background: `hsl(${hue},45%,18%)`, border: `1px solid hsl(${hue},55%,28%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, fontFamily: "var(--font-display)", color: `hsl(${hue},75%,72%)` }}>{initials}</div>
    );
}

const ModalLabel = ({ children }: { children: React.ReactNode }) => (
    <label style={{ display: "block", fontSize: "10px", fontFamily: "var(--font-mono)", textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "var(--text-tertiary)", marginBottom: "8px" }}>{children}</label>
);

export default function ProviderResidentsPage() {
    const [residents, setResidents] = useState<Resident[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Edit modal
    const [editTarget, setEditTarget] = useState<Resident | null>(null);
    const [editForm, setEditForm] = useState({ name: "", email: "", phoneNumber: "", status: "active", isActive: true, propertyId: "", roomId: "" });
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState("");

    // Assign modal
    const [assignTarget, setAssignTarget] = useState<Resident | null>(null);
    const [selectedPropertyId, setSelectedPropertyId] = useState("");
    const [selectedRoomId, setSelectedRoomId] = useState("");
    const [assigning, setAssigning] = useState(false);
    const [assignError, setAssignError] = useState("");

    useEffect(() => { fetchAll(); }, []);

    useEffect(() => {
        const pid = editTarget ? editForm.propertyId : selectedPropertyId;
        if (!pid) { setRooms([]); return; }
        api.get(`/v2/rooms?propertyId=${pid}`)
            .then(r => setRooms(r.data.data || []))
            .catch(() => setRooms([]));
    }, [editForm.propertyId, selectedPropertyId]);

    async function fetchAll() {
        try {
            setLoading(true);
            const [rRes, pRes] = await Promise.all([
                api.get("/v2/residents"),
                api.get("/v2/provider/properties?limit=100"),
            ]);
            setResidents(rRes.data.data || []);
            setProperties(pRes.data.data || []);
        } catch { console.error("Failed to fetch"); }
        finally { setLoading(false); }
    }

    function openEdit(r: Resident) {
        setEditTarget(r);
        setEditForm({
            name: r.name || "", email: r.email || "", phoneNumber: r.phoneNumber || "",
            status: r.status || "active", isActive: r.isActive !== false,
            propertyId: r.propertyId?._id || "", roomId: r.roomId?._id || "",
        });
        setEditError("");
    }

    async function handleSaveEdit() {
        if (!editTarget) return;
        setEditSaving(true); setEditError("");
        try {
            await api.put(`/v2/admin/users/${editTarget._id}`, {
                name: editForm.name, email: editForm.email, phoneNumber: editForm.phoneNumber,
                status: editForm.status, isActive: editForm.isActive,
                propertyId: editForm.propertyId || null,
                roomId: editForm.roomId || null,
            });
            setEditTarget(null);
            fetchAll();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setEditError(error.response?.data?.message || "Failed to update resident");
        } finally { setEditSaving(false); }
    }

    function openAssign(r: Resident) {
        setAssignTarget(r);
        setSelectedPropertyId(r.propertyId?._id || "");
        setSelectedRoomId(r.roomId?._id || "");
        setAssignError("");
    }

    async function handleAssign() {
        if (!assignTarget || !selectedPropertyId) return;
        setAssigning(true); setAssignError("");
        try {
            await api.patch(`/v2/residents/${assignTarget._id}/assign-property`, {
                propertyId: selectedPropertyId,
                ...(selectedRoomId ? { roomId: selectedRoomId } : {}),
            });
            setAssignTarget(null);
            fetchAll();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setAssignError(error.response?.data?.message || "Failed to assign");
        } finally { setAssigning(false); }
    }

    async function handleDeleteResident(r: Resident) {
        if (!confirm(`Permanently delete "${r.name || r.email}"?\n\nThis will:\n• Remove them from MongoDB\n• Delete their Firebase account\n• Delete all their payment records\n\nThis cannot be undone.`)) return;
        try {
            await api.delete(`/admin/residents/${r._id}`);
            fetchAll();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            alert(error.response?.data?.message || "Failed to delete resident");
        }
    }

    const filtered = residents.filter(r => {
        const q = search.toLowerCase();
        return !q || r.name?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q) || r.phoneNumber?.includes(q);
    });

    const unassigned = filtered.filter(r => !r.propertyId);
    const assigned = filtered.filter(r => !!r.propertyId);

    return (
        <div className="animate-fade-in">

            {/* ── EDIT MODAL ── */}
            <AnimatePresence>
                {editTarget && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
                        onClick={e => { if (e.target === e.currentTarget) setEditTarget(null); }}
                    >
                        <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
                            className="glass-card" style={{ width: "520px", padding: "32px", borderRadius: "24px", maxHeight: "92vh", overflowY: "auto" }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                                <div>
                                    <div style={{ fontSize: "9.5px", fontFamily: "var(--font-mono)", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent-primary)", marginBottom: "4px" }}>Super Admin · Full Edit</div>
                                    <h3 style={{ fontSize: "19px", fontWeight: 700, margin: 0 }}>Edit Resident</h3>
                                    <p style={{ color: "var(--text-tertiary)", fontSize: "12px", marginTop: "4px" }}>{editTarget.email}</p>
                                </div>
                                <button onClick={() => setEditTarget(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-tertiary)" }}><X size={18} /></button>
                            </div>

                            {editError && (
                                <div style={{ padding: "12px 16px", background: "var(--red-bg)", border: "1px solid rgba(255,82,82,0.2)", borderRadius: "10px", color: "var(--red)", fontSize: "13px", marginBottom: "16px", display: "flex", gap: "8px" }}>
                                    <AlertCircle size={14} style={{ flexShrink: 0 }} /> {editError}
                                </div>
                            )}

                            {/* Identity */}
                            <div style={{ marginBottom: "6px", fontSize: "10px", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-tertiary)", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px", marginTop: "4px" }}>Identity</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", margin: "14px 0 20px" }}>
                                <div>
                                    <ModalLabel>Full Name</ModalLabel>
                                    <input className="input-field" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Resident name" />
                                </div>
                                <div>
                                    <ModalLabel>Email Address</ModalLabel>
                                    <input className="input-field" type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} placeholder="resident@email.com" />
                                </div>
                                <div>
                                    <ModalLabel>Phone</ModalLabel>
                                    <input className="input-field" value={editForm.phoneNumber} onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })} placeholder="+91 9876543210" />
                                </div>
                                <div>
                                    <ModalLabel>Account Status</ModalLabel>
                                    <select className="input-field" value={editForm.isActive ? "active" : "inactive"} onChange={e => setEditForm({ ...editForm, isActive: e.target.value === "active" })}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Suspended</option>
                                    </select>
                                </div>
                            </div>

                            {/* Property & Room */}
                            <div style={{ marginBottom: "6px", fontSize: "10px", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-tertiary)", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>Property & Room Assignment</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", margin: "14px 0 24px" }}>
                                <div>
                                    <ModalLabel>Property</ModalLabel>
                                    <select className="input-field" value={editForm.propertyId} onChange={e => setEditForm({ ...editForm, propertyId: e.target.value, roomId: "" })}>
                                        <option value="">— No property —</option>
                                        {properties.map(p => <option key={p._id} value={p._id}>{p.name} · {p.city}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <ModalLabel>Room</ModalLabel>
                                    <select className="input-field" value={editForm.roomId} onChange={e => setEditForm({ ...editForm, roomId: e.target.value })} disabled={!editForm.propertyId}>
                                        <option value="">— No room —</option>
                                        {rooms.map(r => <option key={r._id} value={r._id}>Room {r.roomNumber} ({r.totalBeds - r.occupiedBeds} free)</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "12px" }}>
                                <button className="btn-ghost" onClick={() => setEditTarget(null)} style={{ flex: 1 }}>Cancel</button>
                                <button className="btn-primary" onClick={handleSaveEdit} disabled={editSaving} style={{ flex: 1.5, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                    <CheckCircle size={14} /> {editSaving ? "Saving..." : "Save All Changes"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── ASSIGN MODAL ── */}
            <AnimatePresence>
                {assignTarget && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
                        onClick={e => { if (e.target === e.currentTarget) setAssignTarget(null); }}
                    >
                        <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
                            className="glass-card" style={{ width: "440px", padding: "32px", borderRadius: "24px" }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                                <div>
                                    <div style={{ fontSize: "9.5px", fontFamily: "var(--font-mono)", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent-primary)", marginBottom: "4px" }}>Emergency Access Fix</div>
                                    <h3 style={{ fontSize: "18px", fontWeight: 700 }}>Assign to Property</h3>
                                    <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "3px" }}>{assignTarget.name}</p>
                                </div>
                                <button onClick={() => setAssignTarget(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-tertiary)" }}><X size={18} /></button>
                            </div>
                            {assignError && <div style={{ padding: "10px 14px", background: "var(--red-bg)", border: "1px solid rgba(255,82,82,0.2)", borderRadius: "8px", color: "var(--red)", fontSize: "12px", marginBottom: "14px" }}>{assignError}</div>}
                            <div style={{ marginBottom: "14px" }}>
                                <ModalLabel>Property *</ModalLabel>
                                <select className="input-field" value={selectedPropertyId} onChange={e => { setSelectedPropertyId(e.target.value); setSelectedRoomId(""); }}>
                                    <option value="">— Select property —</option>
                                    {properties.map(p => <option key={p._id} value={p._id}>{p.name} · {p.city}</option>)}
                                </select>
                            </div>
                            {selectedPropertyId && (
                                <div style={{ marginBottom: "22px" }}>
                                    <ModalLabel>Room (Optional)</ModalLabel>
                                    <select className="input-field" value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)}>
                                        <option value="">— No room —</option>
                                        {rooms.filter(r => r.occupiedBeds < r.totalBeds).map(r => <option key={r._id} value={r._id}>Room {r.roomNumber} ({r.totalBeds - r.occupiedBeds} free)</option>)}
                                    </select>
                                </div>
                            )}
                            <div style={{ display: "flex", gap: "12px" }}>
                                <button className="btn-ghost" onClick={() => setAssignTarget(null)} style={{ flex: 1 }}>Cancel</button>
                                <button className="btn-primary" onClick={handleAssign} disabled={!selectedPropertyId || assigning} style={{ flex: 1.5, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                    <UserCheck size={14} /> {assigning ? "Assigning..." : "Assign & Activate"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Header ── */}
            <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
                <div>
                    <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "6px" }}>Platform Administration</div>
                    <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "4px" }}>All Residents</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{residents.length} residents · {unassigned.length} unassigned</p>
                </div>
                <div style={{ position: "relative" }}>
                    <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", pointerEvents: "none" }} />
                    <input className="input-field" placeholder="Search name, email, phone..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: "36px", width: "260px", fontSize: "13px", padding: "10px 14px 10px 36px" }} />
                </div>
            </div>

            {/* Unassigned Alert */}
            {unassigned.length > 0 && (
                <div style={{ padding: "14px 18px", borderRadius: "12px", background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.18)", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <AlertCircle size={16} style={{ color: "#fbbf24", flexShrink: 0 }} />
                    <div>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#fbbf24" }}>{unassigned.length} resident{unassigned.length > 1 ? "s" : ""} not assigned to any property</span>
                        <span style={{ fontSize: "12px", color: "var(--text-tertiary)", marginLeft: "8px" }}>They may have access issues — assign or edit them below.</span>
                    </div>
                </div>
            )}

            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: "64px", borderRadius: "14px" }} />)}
                </div>
            ) : (
                <>
                    {unassigned.length > 0 && (
                        <section style={{ marginBottom: "32px" }}>
                            <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "#fbbf24", marginBottom: "10px" }}>⚠ Unassigned ({unassigned.length})</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {unassigned.map((r, i) => <ResidentRow key={r._id} resident={r} index={i} onEdit={openEdit} onAssign={openAssign} onDelete={handleDeleteResident} urgent />)}
                            </div>
                        </section>
                    )}
                    {assigned.length > 0 && (
                        <section>
                            <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "10px" }}>Assigned ({assigned.length})</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {assigned.map((r, i) => <ResidentRow key={r._id} resident={r} index={i} onEdit={openEdit} onAssign={openAssign} onDelete={handleDeleteResident} />)}
                            </div>
                        </section>
                    )}
                    {filtered.length === 0 && <div style={{ textAlign: "center", padding: "60px", color: "var(--text-tertiary)" }}>No residents found{search ? ` for "${search}"` : ""}.</div>}
                </>
            )}
        </div>
    );
}

function ResidentRow({ resident: r, index, onEdit, onAssign, onDelete, urgent }: {
    resident: Resident; index: number; onEdit: (r: Resident) => void; onAssign: (r: Resident) => void; onDelete: (r: Resident) => void; urgent?: boolean;
}) {
    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
            style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 18px", borderRadius: "14px", background: urgent ? "rgba(251,191,36,0.04)" : "var(--bg-card)", border: `1px solid ${urgent ? "rgba(251,191,36,0.15)" : "var(--border-default)"}` }}
        >
            <Avatar name={r.name || r.email} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "14px" }}>{r.name || "—"}</div>
                <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>{r.email}{r.phoneNumber && ` · ${r.phoneNumber}`}</div>
            </div>
            <div style={{ flexShrink: 0 }}>
                {r.propertyId ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "var(--text-secondary)" }}>
                        <Building2 size={11} />
                        <div>
                            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{r.propertyId.name}</div>
                            {r.roomId && <div style={{ fontSize: "10.5px", color: "var(--text-tertiary)" }}>Room {r.roomId.roomNumber}</div>}
                        </div>
                    </div>
                ) : (
                    <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", fontWeight: 700, padding: "3px 8px", borderRadius: "5px", textTransform: "uppercase", background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)", letterSpacing: "0.06em" }}>Unassigned</span>
                )}
            </div>
            <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", fontWeight: 700, padding: "3px 8px", borderRadius: "5px", textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0, background: r.isActive !== false ? "rgba(52,211,153,0.1)" : "rgba(255,82,82,0.08)", color: r.isActive !== false ? "#34d399" : "var(--red)", border: `1px solid ${r.isActive !== false ? "rgba(52,211,153,0.2)" : "rgba(255,82,82,0.15)"}` }}>
                {r.isActive !== false ? "active" : "suspended"}
            </span>
            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                <button onClick={() => onEdit(r)} className="btn-ghost" style={{ fontSize: "12px", padding: "6px 10px", display: "flex", alignItems: "center", gap: "5px" }}>
                    <PencilLine size={12} /> Edit
                </button>
                <button onClick={() => onAssign(r)} className="btn-ghost" style={{ fontSize: "12px", padding: "6px 10px", display: "flex", alignItems: "center", gap: "5px" }}>
                    <UserCheck size={12} /> {r.propertyId ? "Reassign" : "Assign"}
                    <ChevronRight size={10} style={{ opacity: 0.5 }} />
                </button>
                <button onClick={() => onDelete(r)} style={{ fontSize: "12px", padding: "6px 10px", display: "flex", alignItems: "center", gap: "5px", background: "rgba(255,82,82,0.08)", border: "1px solid rgba(255,82,82,0.2)", borderRadius: "8px", color: "var(--red)", cursor: "pointer" }}>
                    <Trash2 size={12} />
                </button>
            </div>
        </motion.div>
    );
}
