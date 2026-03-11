"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { UserCog, Building2, PencilLine, X, CheckCircle, AlertCircle, Plus, UserPlus, Trash2 } from "lucide-react";

interface Owner {
    _id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    isActive: boolean;
    propertyIds: (string | { _id: string; name: string })[];
    createdAt: string;
}

function getPropKey(p: string | { _id: string; name: string }): string {
    return typeof p === "string" ? p : p._id;
}
function getPropName(p: string | { _id: string; name: string }): string {
    return typeof p === "string" ? p : p.name;
}

const Label = ({ children }: { children: React.ReactNode }) => (
    <label style={{ display: "block", fontSize: "10px", fontFamily: "var(--font-mono)", textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "var(--text-tertiary)", marginBottom: "8px" }}>
        {children}
    </label>
);

function Avatar({ name }: { name: string }) {
    const initials = (name || "?").split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();
    const hue = (name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
    return (
        <div style={{ width: "38px", height: "38px", borderRadius: "10px", flexShrink: 0, background: `hsl(${hue},40%,18%)`, border: `1px solid hsl(${hue},50%,28%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-display)", color: `hsl(${hue},70%,70%)` }}>{initials}</div>
    );
}

export default function OwnersListPage() {
    const [owners, setOwners] = useState<Owner[]>([]);
    const [loading, setLoading] = useState(true);
    const [properties, setProperties] = useState<{ _id: string; name: string }[]>([]);

    // Create form
    const [showForm, setShowForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");
    const [form, setForm] = useState({ name: "", email: "", password: "" });

    // Edit modal
    const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
    const [editForm, setEditForm] = useState({ name: "", email: "", phoneNumber: "", isActive: true });
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState("");

    // Assign property modal
    const [assigningOwner, setAssigningOwner] = useState<Owner | null>(null);
    const [selectedPropertyId, setSelectedPropertyId] = useState("");
    const [assigningLoading, setAssigningLoading] = useState(false);

    useEffect(() => { fetchAll(); }, []);

    async function fetchAll() {
        try {
            setLoading(true);
            const [oRes, pRes] = await Promise.all([
                api.get("/v2/admin/owners"),
                api.get("/v2/provider/properties?limit=100"),
            ]);
            setOwners(oRes.data.data || []);
            setProperties(pRes.data.data || []);
        } catch { console.error("Failed to fetch"); }
        finally { setLoading(false); }
    }

    function openEdit(o: Owner) {
        setEditingOwner(o);
        setEditForm({ name: o.name || "", email: o.email || "", phoneNumber: o.phoneNumber || "", isActive: o.isActive !== false });
        setEditError("");
    }

    async function handleSaveEdit() {
        if (!editingOwner) return;
        setEditSaving(true); setEditError("");
        try {
            await api.put(`/v2/admin/users/${editingOwner._id}`, editForm);
            setEditingOwner(null);
            fetchAll();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setEditError(error.response?.data?.message || "Failed to update owner");
        } finally { setEditSaving(false); }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setCreating(true); setCreateError("");
        try {
            await api.post("/v2/admin/owners", form);
            setForm({ name: "", email: "", password: "" });
            setShowForm(false);
            fetchAll();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setCreateError(error.response?.data?.message || "Failed to create owner");
        } finally { setCreating(false); }
    }

    async function handleAssignProperty() {
        if (!selectedPropertyId || !assigningOwner) return;
        setAssigningLoading(true);
        try {
            await api.post(`/v2/admin/properties/${selectedPropertyId}/assign-owner`, { ownerId: assigningOwner._id });
            setAssigningOwner(null); setSelectedPropertyId("");
            fetchAll();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            alert(error.response?.data?.message || "Failed to assign property");
        } finally { setAssigningLoading(false); }
    }

    async function handleRemoveProperty(ownerId: string, propertyId: string) {
        if (!confirm("Remove this property from this owner?")) return;
        try {
            await api.delete(`/v2/admin/owners/${ownerId}/properties/${propertyId}`);
            fetchAll();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            alert(error.response?.data?.message || "Failed to remove property");
        }
    }

    async function handleDeleteOwner(owner: Owner) {
        if (!confirm(`Permanently delete owner "${owner.name}"?\n\nThis will remove them from the system completely.`)) return;
        
        const cascade = confirm(`Do you ALSO want to delete all properties owned by "${owner.name}"?\n\nOK = Yes, cascade delete all their properties, rooms, beds, and residents.\nCancel = No, keep their properties but remove the owner.`);
        
        try {
            await api.delete(`/v2/admin/owners/${owner._id}`, { data: { cascade } });
            fetchAll();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            alert(error.response?.data?.message || "Failed to delete owner");
        }
    }

    return (
        <div className="animate-fade-in">
            {/* ── Edit Owner Modal ── */}
            <AnimatePresence>
                {editingOwner && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
                        onClick={e => { if (e.target === e.currentTarget) setEditingOwner(null); }}
                    >
                        <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
                            className="glass-card" style={{ width: "480px", padding: "32px", borderRadius: "24px", maxHeight: "90vh", overflowY: "auto" }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                                <div>
                                    <div style={{ fontSize: "9.5px", fontFamily: "var(--font-mono)", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent-primary)", marginBottom: "4px" }}>Super Admin · Edit Owner</div>
                                    <h3 style={{ fontSize: "19px", fontWeight: 700, margin: 0 }}>Edit Owner Details</h3>
                                    <p style={{ color: "var(--text-tertiary)", fontSize: "12px", marginTop: "4px" }}>{editingOwner.email}</p>
                                </div>
                                <button onClick={() => setEditingOwner(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-tertiary)" }}><X size={18} /></button>
                            </div>

                            {editError && (
                                <div style={{ padding: "12px 16px", background: "var(--red-bg)", border: "1px solid rgba(255,82,82,0.2)", borderRadius: "10px", color: "var(--red)", fontSize: "13px", marginBottom: "16px", display: "flex", gap: "8px" }}>
                                    <AlertCircle size={14} style={{ flexShrink: 0, marginTop: "1px" }} /> {editError}
                                </div>
                            )}

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                                <div>
                                    <Label>Full Name</Label>
                                    <input className="input-field" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Owner name" />
                                </div>
                                <div>
                                    <Label>Email Address</Label>
                                    <input className="input-field" type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} placeholder="owner@email.com" />
                                </div>
                                <div>
                                    <Label>Phone</Label>
                                    <input className="input-field" value={editForm.phoneNumber} onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })} placeholder="+91 9876543210" />
                                </div>
                                <div>
                                    <Label>Account Status</Label>
                                    <select className="input-field" value={editForm.isActive ? "active" : "inactive"} onChange={e => setEditForm({ ...editForm, isActive: e.target.value === "active" })}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Suspended</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ padding: "14px 16px", borderRadius: "10px", background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.1)", marginBottom: "22px", fontSize: "12px", color: "var(--text-tertiary)" }}>
                                Assigned Properties: {editingOwner.propertyIds?.map(p => getPropName(p)).join(", ") || "None"}
                                <span style={{ marginLeft: "10px", color: "var(--text-tertiary)", opacity: 0.7 }}>— use &quot;Assign Property&quot; to change</span>
                            </div>

                            <div style={{ display: "flex", gap: "12px" }}>
                                <button className="btn-ghost" onClick={() => setEditingOwner(null)} style={{ flex: 1 }}>Cancel</button>
                                <button className="btn-primary" onClick={handleSaveEdit} disabled={editSaving} style={{ flex: 1.5, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                    <CheckCircle size={14} /> {editSaving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Assign Property Modal ── */}
            <AnimatePresence>
                {assigningOwner && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
                        onClick={e => { if (e.target === e.currentTarget) { setAssigningOwner(null); setSelectedPropertyId(""); } }}
                    >
                        <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
                            className="glass-card" style={{ width: "420px", padding: "32px", borderRadius: "24px" }}
                        >
                            <h3 style={{ fontSize: "19px", fontWeight: 700, marginBottom: "6px" }}>Assign Property</h3>
                            <p style={{ color: "var(--text-tertiary)", fontSize: "13px", marginBottom: "24px" }}>
                                Assign a property to <strong>{assigningOwner.name}</strong>
                            </p>
                            <Label>Select Property</Label>
                            <select className="input-field" value={selectedPropertyId} onChange={e => setSelectedPropertyId(e.target.value)} style={{ marginBottom: "24px" }}>
                                <option value="">Choose a property...</option>
                                {properties.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                            </select>
                            <div style={{ display: "flex", gap: "12px" }}>
                                <button className="btn-ghost" onClick={() => { setAssigningOwner(null); setSelectedPropertyId(""); }} style={{ flex: 1 }}>Cancel</button>
                                <button className="btn-primary" onClick={handleAssignProperty} disabled={!selectedPropertyId || assigningLoading} style={{ flex: 1 }}>
                                    {assigningLoading ? "Assigning..." : "Assign"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Page Header ── */}
            <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
                <div>
                    <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "6px" }}>Platform Administration</div>
                    <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "4px" }}>Property Owners</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{owners.length} registered owners</p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <UserPlus size={14} /> {showForm ? "Cancel" : "Add Owner"}
                </button>
            </div>

            {/* ── Create Form ── */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        className="glass-card" style={{ padding: "28px", marginBottom: "24px", borderRadius: "20px" }}
                    >
                        <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "18px" }}>Create New Owner Account</h3>
                        {createError && (
                            <div style={{ padding: "10px 14px", background: "var(--red-bg)", border: "1px solid rgba(255,82,82,0.2)", borderRadius: "8px", color: "var(--red)", fontSize: "12px", marginBottom: "16px" }}>{createError}</div>
                        )}
                        <form onSubmit={handleCreate} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "16px", alignItems: "flex-end" }}>
                            <div>
                                <Label>Full Name</Label>
                                <input required className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
                            </div>
                            <div>
                                <Label>Email</Label>
                                <input required type="email" className="input-field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="owner@email.com" />
                            </div>
                            <div>
                                <Label>Password</Label>
                                <input required type="password" className="input-field" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 chars" />
                            </div>
                            <button disabled={creating} type="submit" className="btn-primary" style={{ height: "49px", padding: "0 20px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <Plus size={14} /> {creating ? "Creating..." : "Create"}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Owners Table ── */}
            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: "64px", borderRadius: "14px" }} />)}
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {owners.map((owner, i) => (
                        <motion.div key={owner._id}
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                            style={{
                                display: "flex", alignItems: "center", gap: "14px", padding: "16px 20px",
                                borderRadius: "14px", background: "var(--bg-card)", border: "1px solid var(--border-default)"
                            }}
                        >
                            <Avatar name={owner.name} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                                    {owner.name}
                                    {owner.isActive === false && (
                                        <span style={{ fontSize: "9px", fontFamily: "var(--font-mono)", padding: "2px 6px", borderRadius: "4px", background: "var(--red-bg)", color: "var(--red)", border: "1px solid rgba(255,82,82,0.2)", textTransform: "uppercase" }}>Suspended</span>
                                    )}
                                </div>
                                <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>{owner.email}{owner.phoneNumber && ` · ${owner.phoneNumber}`}</div>
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", flex: 1 }}>
                                {owner.propertyIds?.length > 0 ? owner.propertyIds.map(p => (
                                    <span key={getPropKey(p)} style={{ padding: "2px 6px 2px 8px", borderRadius: "5px", background: "rgba(0,212,255,0.07)", border: "1px solid rgba(0,212,255,0.15)", fontSize: "11px", color: "var(--accent-primary)", display: "flex", alignItems: "center", gap: "4px" }}>
                                        <Building2 size={9} /> {getPropName(p)}
                                        <button
                                            onClick={() => handleRemoveProperty(owner._id, getPropKey(p))}
                                            title="Remove this property"
                                            style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(0,212,255,0.5)", padding: "0 0 0 2px", display: "flex", alignItems: "center", lineHeight: 1 }}
                                        >
                                            <X size={10} />
                                        </button>
                                    </span>
                                )) : (
                                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>No properties</span>
                                )}
                            </div>
                            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                                <button className="btn-ghost" onClick={() => openEdit(owner)} style={{ fontSize: "12px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <PencilLine size={12} /> Edit
                                </button>
                                <button className="btn-ghost" onClick={() => setAssigningOwner(owner)} style={{ fontSize: "12px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <Building2 size={12} /> Assign Property
                                </button>
                                <button onClick={() => handleDeleteOwner(owner)} style={{ fontSize: "12px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,82,82,0.08)", border: "1px solid rgba(255,82,82,0.2)", borderRadius: "8px", color: "var(--red)", cursor: "pointer" }}>
                                    <Trash2 size={12} /> Delete
                                </button>
                            </div>
                        </motion.div>
                    ))}
                    {owners.length === 0 && (
                        <div style={{ padding: "60px", textAlign: "center", color: "var(--text-tertiary)" }}>No owners found.</div>
                    )}
                </div>
            )}
        </div>
    );
}
