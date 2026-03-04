"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

interface Property {
    _id: string;
    name: string;
    address: string;
    city: string;
    totalRooms: number;
    totalBeds: number;
    occupiedBeds: number;
    owner: {
        _id: string;
        name: string;
        email: string;
    };
    status: string;
    createdAt: string;
    gstin?: string;
    pan?: string;
    phone?: string;
}

export default function PropertiesListPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Owner Assignment State
    const [assigningProperty, setAssigningProperty] = useState<Property | null>(null);
    const [owners, setOwners] = useState<{ _id: string; name: string; email: string }[]>([]);
    const [selectedOwnerId, setSelectedOwnerId] = useState("");
    const [assigningLoading, setAssigningLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        type: "pg",
        address: "",
        city: "",
        gstin: "",
        pan: "",
        phone: ""
    });

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
            const res = await api.get("/admin/owners");
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
            await api.post("/admin/properties", form);
            setForm({ name: "", type: "pg", address: "", city: "", gstin: "", pan: "", phone: "" });
            setShowForm(false);
            fetchProperties(1);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create property");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAssignOwner = async () => {
        if (!selectedOwnerId || !assigningProperty) return;
        setAssigningLoading(true);
        try {
            await api.post(`/admin/properties/${assigningProperty._id}/assign-owner`, { ownerId: selectedOwnerId });
            setAssigningProperty(null);
            setSelectedOwnerId("");
            fetchProperties(pagination.page);
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to assign owner");
        } finally {
            setAssigningLoading(false);
        }
    };

    if (loading && properties.length === 0) {
        return (
            <div style={{ padding: "40px" }}>
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
        <div className="animate-fade-in" style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
            {/* Owner Assignment Modal */}
            {assigningProperty && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
                }}>
                    <div className="glass-card animate-fade-up" style={{ width: "400px", padding: "32px", borderRadius: "24px" }}>
                        <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>Assign Owner</h3>
                        <p style={{ color: "var(--text-tertiary)", fontSize: "14px", marginBottom: "24px" }}>
                            Select an owner for <strong>{assigningProperty.name}</strong>
                        </p>

                        <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--font-mono)", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Select Owner</label>
                        <select
                            className="input-field"
                            value={selectedOwnerId}
                            onChange={(e) => setSelectedOwnerId(e.target.value)}
                            style={{ marginBottom: "24px" }}
                        >
                            <option value="">Choose an owner...</option>
                            {owners.map(o => (
                                <option key={o._id} value={o._id}>{o.name} ({o.email})</option>
                            ))}
                        </select>

                        <div style={{ display: "flex", gap: "12px" }}>
                            <button
                                className="btn-ghost"
                                onClick={() => { setAssigningProperty(null); setSelectedOwnerId(""); }}
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleAssignOwner}
                                disabled={!selectedOwnerId || assigningLoading}
                                style={{ flex: 1 }}
                            >
                                {assigningLoading ? "Assigning..." : "Assign"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Platform Administration</div>
                    <h1 className="display-text" style={{ fontSize: "32px", marginBottom: "6px" }}>Properties</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Manage all {pagination.total} properties across the platform</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => setShowForm(!showForm)}
                    style={{ padding: "10px 20px", fontSize: "14px", fontWeight: 600 }}
                >
                    {showForm ? "Cancel" : "Add Property"}
                </button>
            </div>

            {showForm && (
                <div className="glass-card animate-fade-up" style={{ padding: "28px", marginBottom: "32px", borderRadius: "20px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>Create New Property</h3>
                    {error && (
                        <div style={{ padding: "12px 16px", background: "rgba(255,82,82,0.1)", border: "1px solid rgba(255,82,82,0.2)", borderRadius: "10px", color: "var(--red)", fontSize: "13px", marginBottom: "20px" }}>
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleCreate} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--font-mono)", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Property Name</label>
                            <input
                                required
                                className="input-field"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Skyline Residency"
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--font-mono)", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Type</label>
                            <select
                                className="input-field"
                                value={form.type}
                                onChange={e => setForm({ ...form, type: e.target.value })}
                            >
                                <option value="pg">PG / Co-living</option>
                                <option value="hotel">Hotel</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: "span 2" }}>
                            <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--font-mono)", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Address</label>
                            <input
                                required
                                className="input-field"
                                value={form.address}
                                onChange={e => setForm({ ...form, address: e.target.value })}
                                placeholder="Full street address"
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--font-mono)", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>City</label>
                            <input
                                required
                                className="input-field"
                                value={form.city}
                                onChange={e => setForm({ ...form, city: e.target.value })}
                                placeholder="e.g. Bengaluru"
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--font-mono)", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Phone Number</label>
                            <input
                                className="input-field"
                                value={form.phone}
                                onChange={e => setForm({ ...form, phone: e.target.value })}
                                placeholder="e.g. +91 9876543210"
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--font-mono)", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>GSTIN (Optional)</label>
                            <input
                                className="input-field"
                                value={form.gstin}
                                onChange={e => setForm({ ...form, gstin: e.target.value })}
                                placeholder="29XXXXX..."
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--font-mono)", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Landlord PAN (for HRA)</label>
                            <input
                                className="input-field"
                                value={form.pan}
                                onChange={e => setForm({ ...form, pan: e.target.value })}
                                placeholder="ABCDE1234F"
                            />
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-end" }}>
                            <button disabled={submitting} type="submit" className="btn-primary" style={{ width: "100%", padding: "12px", height: "46px" }}>
                                {submitting ? "Creating..." : "Create Property"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-default)",
                borderRadius: "18px",
                overflow: "hidden"
            }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                    <thead>
                        <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border-subtle)" }}>
                            <th style={{ textAlign: "left", padding: "16px 24px", color: "var(--text-tertiary)", fontWeight: 500 }}>Property Name</th>
                            <th style={{ textAlign: "left", padding: "16px 24px", color: "var(--text-tertiary)", fontWeight: 500 }}>Owner</th>
                            <th style={{ textAlign: "left", padding: "16px 24px", color: "var(--text-tertiary)", fontWeight: 500 }}>City</th>
                            <th style={{ textAlign: "center", padding: "16px 24px", color: "var(--text-tertiary)", fontWeight: 500 }}>Rooms/Beds</th>
                            <th style={{ textAlign: "center", padding: "16px 24px", color: "var(--text-tertiary)", fontWeight: 500 }}>Status</th>
                            <th style={{ textAlign: "right", padding: "16px 24px", color: "var(--text-tertiary)", fontWeight: 500 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {properties.map((p) => {
                            const occupancy = p.totalBeds > 0 ? Math.round((p.occupiedBeds / p.totalBeds) * 100) : 0;
                            return (
                                <tr key={p._id} style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.2s" }} className="hover-bg">
                                    <td style={{ padding: "16px 24px" }}>
                                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</div>
                                        <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>{p.address}</div>
                                    </td>
                                    <td style={{ padding: "16px 24px" }}>
                                        <div style={{ color: "var(--text-secondary)" }}>{p.owner?.name || "N/A"}</div>
                                        <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{p.owner?.email}</div>
                                    </td>
                                    <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>{p.city}</td>
                                    <td style={{ padding: "16px 24px", textAlign: "center" }}>
                                        <div style={{ color: "var(--text-primary)" }}>{p.totalRooms} R / {p.totalBeds} B</div>
                                        <div style={{ fontSize: "11px", color: occupancy > 80 ? "#34d399" : occupancy > 50 ? "#fbbf24" : "var(--text-tertiary)" }}>
                                            {occupancy}% Occupied
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px 24px", textAlign: "center" }}>
                                        <span style={{
                                            padding: "4px 10px",
                                            borderRadius: "6px",
                                            fontSize: "11px",
                                            fontWeight: 700,
                                            background: p.status === "active" ? "rgba(52, 211, 153, 0.12)" : "rgba(251, 191, 36, 0.12)",
                                            color: p.status === "active" ? "#34d399" : "#fbbf24",
                                            border: p.status === "active" ? "1px solid rgba(52, 211, 153, 0.2)" : "1px solid rgba(251, 191, 36, 0.2)",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                                        <button
                                            onClick={() => setAssigningProperty(p)}
                                            className="btn-ghost"
                                            style={{ fontSize: "12px", padding: "6px 12px" }}
                                        >
                                            {p.owner ? "Change Owner" : "Assign Owner"}
                                        </button>
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
            {pagination.total > pagination.limit && (
                <div style={{ marginTop: "24px", display: "flex", justifyContent: "center", gap: "8px" }}>
                    <button
                        disabled={pagination.page === 1}
                        onClick={() => fetchProperties(pagination.page - 1)}
                        className="btn-ghost"
                        style={{ padding: "8px 16px" }}
                    >
                        Previous
                    </button>
                    <span style={{ display: "flex", alignItems: "center", padding: "0 16px", color: "var(--text-secondary)", fontSize: "14px" }}>
                        Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                    </span>
                    <button
                        disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                        onClick={() => fetchProperties(pagination.page + 1)}
                        className="btn-ghost"
                        style={{ padding: "8px 16px" }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

