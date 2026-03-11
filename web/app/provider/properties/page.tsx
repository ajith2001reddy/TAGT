"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, UserCheck, X, Building2, CheckCircle, Trash2 } from "lucide-react";

interface Property {
    _id: string;
    name: string;
    address: string;
    city: string;
    totalRooms: number;
    totalBeds: number;
    occupiedBeds: number;
    owner: { _id: string; name: string; email: string };
    status: string;
    createdAt: string;
    gstin?: string;
    pan?: string;
    phone?: string;
    type?: string;
}

const LabelStyle = {
    display: "block", fontSize: "10.5px", fontFamily: "var(--font-mono)",
    textTransform: "uppercase" as const, letterSpacing: "0.12em",
    color: "var(--text-tertiary)", marginBottom: "8px",
};

function FieldLabel({ children }: { children: React.ReactNode }) {
    return <label style={LabelStyle}>{children}</label>;
}

function FormInput({ label, value, onChange, placeholder, type = "text", span2 = false }: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder?: string; type?: string; span2?: boolean;
}) {
    return (
        <div style={span2 ? { gridColumn: "span 2" } : {}}>
            <FieldLabel>{label}</FieldLabel>
            <input
                type={type}
                className="input-field"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
}

export default function PropertiesListPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

    // Create form
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [createForm, setCreateForm] = useState({
        name: "", type: "pg", address: "", city: "", gstin: "", pan: "", phone: ""
    });

    // Owner assignment
    const [assigningProperty, setAssigningProperty] = useState<Property | null>(null);
    const [owners, setOwners] = useState<{ _id: string; name: string; email: string }[]>([]);
    const [selectedOwnerId, setSelectedOwnerId] = useState("");
    const [assigningLoading, setAssigningLoading] = useState(false);

    // Edit modal
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [editForm, setEditForm] = useState({ name: "", address: "", city: "", phone: "", gstin: "", pan: "", status: "active", type: "pg" });
    const [newOwnerId, setNewOwnerId] = useState("");
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState("");

    useEffect(() => {
        fetchProperties(1);
        fetchOwners();
    }, []);

    const fetchProperties = async (page: number) => {
        try {
            setLoading(true);
            const res = await api.get(`/v2/provider/properties?page=${page}`);
            setProperties(res.data.data);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error("Failed to fetch properties", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchOwners = async () => {
        try {
            const res = await api.get("/v2/admin/owners");
            setOwners(res.data.data);
        } catch (err) {
            console.error("Failed to fetch owners", err);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            await api.post("/v2/properties", createForm);
            setCreateForm({ name: "", type: "pg", address: "", city: "", gstin: "", pan: "", phone: "" });
            setShowForm(false);
            fetchProperties(1);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || "Failed to create property");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAssignOwner = async () => {
        if (!selectedOwnerId || !assigningProperty) return;
        setAssigningLoading(true);
        try {
            await api.post(`/v2/admin/properties/${assigningProperty._id}/assign-owner`, { ownerId: selectedOwnerId });
            setAssigningProperty(null);
            setSelectedOwnerId("");
            fetchProperties(pagination.page);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            alert(error.response?.data?.message || "Failed to assign owner");
        } finally {
            setAssigningLoading(false);
        }
    };

    const openEdit = (p: Property) => {
        setEditingProperty(p);
        setEditForm({
            name: p.name || "",
            address: p.address || "",
            city: p.city || "",
            phone: p.phone || "",
            gstin: p.gstin || "",
            pan: p.pan || "",
            status: p.status || "active",
            type: p.type || "pg",
        });
        setNewOwnerId(p.owner?._id || "");
        setEditError("");
    };

    const handleSaveEdit = async () => {
        if (!editingProperty) return;
        setEditSaving(true);
        setEditError("");
        try {
            // Update property details
            await api.put(`/v2/provider/properties/${editingProperty._id}`, editForm);
            // If the owner changed, also call assign-owner
            if (newOwnerId && newOwnerId !== editingProperty.owner?._id) {
                await api.post(`/v2/admin/properties/${editingProperty._id}/assign-owner`, { ownerId: newOwnerId });
            }
            setEditingProperty(null);
            fetchProperties(pagination.page);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setEditError(error.response?.data?.message || "Failed to update property");
        } finally {
            setEditSaving(false);
        }
    };

    const handleDeleteProperty = async (p: Property) => {
        if (!confirm(`Permanently delete "${p.name}"?\n\nThis will delete:\n• The property\n• All its rooms and beds\n• All associated residents (including app access)\n• All payment records and notices\n\nThis cannot be undone.`)) return;
        try {
            await api.delete(`/v2/admin/properties/${p._id}`);
            fetchProperties(pagination.page);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            alert(error.response?.data?.message || "Failed to delete property");
        }
    };

    if (loading && properties.length === 0) {
        return (
            <div>
                <div className="skeleton" style={{ height: "40px", width: "200px", marginBottom: "20px" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: "60px", borderRadius: "12px" }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* ── Edit Property Modal ── */}
            <AnimatePresence>
                {editingProperty && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                            background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
                            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
                        }}
                        onClick={e => { if (e.target === e.currentTarget) setEditingProperty(null); }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 12 }}
                            className="glass-card"
                            style={{ width: "520px", padding: "32px", borderRadius: "24px", maxHeight: "90vh", overflowY: "auto" }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                                <div>
                                    <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "4px" }}>
                                        Platform Admin
                                    </div>
                                    <h3 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>Edit Property</h3>
                                    <p style={{ color: "var(--text-tertiary)", fontSize: "13px", marginTop: "4px" }}>
                                        {editingProperty.name}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setEditingProperty(null)}
                                    style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-tertiary)", padding: "4px" }}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {editError && (
                                <div style={{ padding: "12px 16px", background: "var(--red-bg)", border: "1px solid rgba(255,82,82,0.2)", borderRadius: "10px", color: "var(--red)", fontSize: "13px", marginBottom: "20px" }}>
                                    {editError}
                                </div>
                            )}

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                                <FormInput label="Property Name" value={editForm.name} onChange={v => setEditForm({ ...editForm, name: v })} placeholder="e.g. Skyline Residency" span2 />

                                <div>
                                    <FieldLabel>Type</FieldLabel>
                                    <select className="input-field" value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })}>
                                        <option value="pg">PG / Co-living</option>
                                        <option value="hotel">Hotel</option>
                                    </select>
                                </div>

                                <div>
                                    <FieldLabel>Status</FieldLabel>
                                    <select className="input-field" value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                        <option value="suspended">Suspended</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>

                                <FormInput label="Address" value={editForm.address} onChange={v => setEditForm({ ...editForm, address: v })} placeholder="Full street address" span2 />
                                <FormInput label="City" value={editForm.city} onChange={v => setEditForm({ ...editForm, city: v })} placeholder="e.g. Bengaluru" />
                                <FormInput label="Phone" value={editForm.phone} onChange={v => setEditForm({ ...editForm, phone: v })} placeholder="+91 9876543210" />
                                <FormInput label="GSTIN (Optional)" value={editForm.gstin} onChange={v => setEditForm({ ...editForm, gstin: v })} placeholder="29XXXXX..." />
                                <FormInput label="PAN (Optional)" value={editForm.pan} onChange={v => setEditForm({ ...editForm, pan: v })} placeholder="ABCDE1234F" />
                            </div>

                            {/* Owner Selector */}
                            <div style={{
                                padding: "16px", borderRadius: "12px",
                                background: "rgba(0,212,255,0.04)",
                                border: "1px solid rgba(0,212,255,0.1)",
                                marginBottom: "20px",
                            }}>
                                <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent-primary)", marginBottom: "10px" }}>
                                    Assigned Owner
                                </div>
                                {editingProperty?.owner && newOwnerId === editingProperty.owner._id && (
                                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "10px" }}>
                                        Currently: <strong style={{ color: "var(--text-primary)" }}>{editingProperty.owner.name}</strong> · {editingProperty.owner.email}
                                    </div>
                                )}
                                <select
                                    className="input-field"
                                    value={newOwnerId}
                                    onChange={e => setNewOwnerId(e.target.value)}
                                >
                                    <option value="">— No owner —</option>
                                    {owners.map(o => (
                                        <option key={o._id} value={o._id}>
                                            {o.name} ({o.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: "flex", gap: "12px" }}>
                                <button
                                    className="btn-ghost"
                                    onClick={() => setEditingProperty(null)}
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={handleSaveEdit}
                                    disabled={editSaving}
                                    style={{ flex: 1.5, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                                >
                                    {editSaving ? "Saving..." : (<><CheckCircle size={14} /> Save Changes</>)}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Assign Owner Modal ── */}
            <AnimatePresence>
                {assigningProperty && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                            background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
                            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 12 }}
                            className="glass-card"
                            style={{ width: "420px", padding: "32px", borderRadius: "24px" }}
                        >
                            <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>Assign Owner</h3>
                            <p style={{ color: "var(--text-tertiary)", fontSize: "14px", marginBottom: "24px" }}>
                                Select an owner for <strong>{assigningProperty.name}</strong>
                            </p>
                            <FieldLabel>Select Owner</FieldLabel>
                            <select
                                className="input-field"
                                value={selectedOwnerId}
                                onChange={e => setSelectedOwnerId(e.target.value)}
                                style={{ marginBottom: "24px" }}
                            >
                                <option value="">Choose an owner...</option>
                                {owners.map(o => (
                                    <option key={o._id} value={o._id}>{o.name} ({o.email})</option>
                                ))}
                            </select>
                            <div style={{ display: "flex", gap: "12px" }}>
                                <button className="btn-ghost" onClick={() => { setAssigningProperty(null); setSelectedOwnerId(""); }} style={{ flex: 1 }}>
                                    Cancel
                                </button>
                                <button className="btn-primary" onClick={handleAssignOwner} disabled={!selectedOwnerId || assigningLoading} style={{ flex: 1 }}>
                                    {assigningLoading ? "Assigning..." : "Assign"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Header ── */}
            <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
                <div>
                    <div style={{ fontSize: "10.5px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "6px" }}>
                        Platform Administration
                    </div>
                    <h1 className="display-text" style={{ fontSize: "30px", marginBottom: "4px" }}>Properties</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "13.5px" }}>
                        Manage all {pagination.total} properties across the platform
                    </p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => setShowForm(!showForm)}
                    style={{ padding: "10px 20px", fontSize: "13.5px" }}
                >
                    {showForm ? "Cancel" : "+ Add Property"}
                </button>
            </div>

            {/* ── Create Form ── */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass-card"
                        style={{ padding: "28px", marginBottom: "28px", borderRadius: "20px" }}
                    >
                        <h3 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "20px" }}>Create New Property</h3>
                        {error && (
                            <div style={{ padding: "12px 16px", background: "var(--red-bg)", border: "1px solid rgba(255,82,82,0.2)", borderRadius: "10px", color: "var(--red)", fontSize: "13px", marginBottom: "20px" }}>
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleCreate} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            <div>
                                <FieldLabel>Property Name</FieldLabel>
                                <input required className="input-field" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} placeholder="e.g. Skyline Residency" />
                            </div>
                            <div>
                                <FieldLabel>Type</FieldLabel>
                                <select className="input-field" value={createForm.type} onChange={e => setCreateForm({ ...createForm, type: e.target.value })}>
                                    <option value="pg">PG / Co-living</option>
                                    <option value="hotel">Hotel</option>
                                </select>
                            </div>
                            <div style={{ gridColumn: "span 2" }}>
                                <FieldLabel>Address</FieldLabel>
                                <input required className="input-field" value={createForm.address} onChange={e => setCreateForm({ ...createForm, address: e.target.value })} placeholder="Full street address" />
                            </div>
                            <div>
                                <FieldLabel>City</FieldLabel>
                                <input required className="input-field" value={createForm.city} onChange={e => setCreateForm({ ...createForm, city: e.target.value })} placeholder="e.g. Bengaluru" />
                            </div>
                            <div>
                                <FieldLabel>Phone Number</FieldLabel>
                                <input className="input-field" value={createForm.phone} onChange={e => setCreateForm({ ...createForm, phone: e.target.value })} placeholder="+91 9876543210" />
                            </div>
                            <div>
                                <FieldLabel>GSTIN (Optional)</FieldLabel>
                                <input className="input-field" value={createForm.gstin} onChange={e => setCreateForm({ ...createForm, gstin: e.target.value })} placeholder="29XXXXX..." />
                            </div>
                            <div>
                                <FieldLabel>Landlord PAN</FieldLabel>
                                <input className="input-field" value={createForm.pan} onChange={e => setCreateForm({ ...createForm, pan: e.target.value })} placeholder="ABCDE1234F" />
                            </div>
                            <div style={{ display: "flex", alignItems: "flex-end" }}>
                                <button disabled={submitting} type="submit" className="btn-primary" style={{ width: "100%", padding: "12px", height: "46px" }}>
                                    {submitting ? "Creating..." : "Create Property"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Table ── */}
            <div style={{
                background: "var(--bg-card)", border: "1px solid var(--border-default)",
                borderRadius: "20px", overflow: "hidden"
            }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
                    <thead>
                        <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border-subtle)" }}>
                            <th style={{ textAlign: "left", padding: "14px 20px", color: "var(--text-tertiary)", fontWeight: 500, fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Property</th>
                            <th style={{ textAlign: "left", padding: "14px 20px", color: "var(--text-tertiary)", fontWeight: 500, fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Owner</th>
                            <th style={{ textAlign: "left", padding: "14px 20px", color: "var(--text-tertiary)", fontWeight: 500, fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase" }}>City</th>
                            <th style={{ textAlign: "center", padding: "14px 20px", color: "var(--text-tertiary)", fontWeight: 500, fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Rooms/Beds</th>
                            <th style={{ textAlign: "center", padding: "14px 20px", color: "var(--text-tertiary)", fontWeight: 500, fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Status</th>
                            <th style={{ textAlign: "right", padding: "14px 20px", color: "var(--text-tertiary)", fontWeight: 500, fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {properties.map((p) => {
                            const occupancy = p.totalBeds > 0 ? Math.round((p.occupiedBeds / p.totalBeds) * 100) : 0;
                            return (
                                <tr key={p._id} style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.15s" }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                                >
                                    <td style={{ padding: "16px 20px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <div style={{
                                                width: "36px", height: "36px", borderRadius: "10px",
                                                background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.15)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                color: "var(--accent-primary)", flexShrink: 0,
                                            }}>
                                                <Building2 size={16} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</div>
                                                <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "2px" }}>{p.address}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px 20px" }}>
                                        <div style={{ color: "var(--text-secondary)" }}>{p.owner?.name || "—"}</div>
                                        <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{p.owner?.email}</div>
                                    </td>
                                    <td style={{ padding: "16px 20px", color: "var(--text-secondary)" }}>{p.city}</td>
                                    <td style={{ padding: "16px 20px", textAlign: "center" }}>
                                        <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>{p.totalRooms || 0}R / {p.totalBeds || 0}B</div>
                                        <div style={{ fontSize: "11px", color: occupancy > 80 ? "#34d399" : occupancy > 50 ? "#fbbf24" : "var(--text-tertiary)" }}>
                                            {occupancy}% Occupied
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px 20px", textAlign: "center" }}>
                                        <span style={{
                                            padding: "4px 10px", borderRadius: "6px", fontSize: "10.5px", fontWeight: 700,
                                            background: p.status === "active" ? "rgba(52,211,153,0.12)" : "rgba(251,191,36,0.12)",
                                            color: p.status === "active" ? "#34d399" : "#fbbf24",
                                            border: p.status === "active" ? "1px solid rgba(52,211,153,0.2)" : "1px solid rgba(251,191,36,0.2)",
                                            textTransform: "uppercase", letterSpacing: "0.06em",
                                        }}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                            <button
                                                onClick={() => openEdit(p)}
                                                className="btn-ghost"
                                                style={{ fontSize: "12px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px" }}
                                            >
                                                <Edit2 size={12} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setAssigningProperty(p)}
                                                className="btn-ghost"
                                                style={{ fontSize: "12px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px" }}
                                            >
                                                <UserCheck size={12} />
                                                {p.owner ? "Owner" : "Assign"}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProperty(p)}
                                                style={{ fontSize: "12px", padding: "6px 10px", display: "flex", alignItems: "center", gap: "5px", background: "rgba(255,82,82,0.08)", border: "1px solid rgba(255,82,82,0.2)", borderRadius: "8px", color: "var(--red)", cursor: "pointer" }}
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {properties.length === 0 && !loading && (
                    <div style={{ padding: "60px", textAlign: "center", color: "var(--text-tertiary)" }}>
                        No properties found on the platform.
                    </div>
                )}
            </div>

            {/* Pagination */}
            {
                pagination.total > pagination.limit && (
                    <div style={{ marginTop: "24px", display: "flex", justifyContent: "center", gap: "8px" }}>
                        <button disabled={pagination.page === 1} onClick={() => fetchProperties(pagination.page - 1)} className="btn-ghost" style={{ padding: "8px 16px" }}>
                            Previous
                        </button>
                        <span style={{ display: "flex", alignItems: "center", padding: "0 16px", color: "var(--text-secondary)", fontSize: "13px" }}>
                            Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                        </span>
                        <button disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)} onClick={() => fetchProperties(pagination.page + 1)} className="btn-ghost" style={{ padding: "8px 16px" }}>
                            Next
                        </button>
                    </div>
                )
            }
        </div >
    );
}
