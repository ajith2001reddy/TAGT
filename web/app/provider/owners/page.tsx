"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Owner {
    _id: string;
    name: string;
    email: string;
    propertyIds: { _id: string; name: string }[];
    createdAt: string;
}

export default function OwnersListPage() {
    const [owners, setOwners] = useState<Owner[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Property Assignment State
    const [assigningOwner, setAssigningOwner] = useState<Owner | null>(null);
    const [properties, setProperties] = useState<{ _id: string; name: string }[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState("");
    const [assigningLoading, setAssigningLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    });

    useEffect(() => {
        fetchOwners();
        fetchProperties();
    }, []);

    const fetchOwners = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/owners");
            setOwners(res.data.data);
        } catch (err) {
            console.error("Failed to fetch owners", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProperties = async () => {
        try {
            const res = await api.get("/v2/provider/properties?limit=100");
            setProperties(res.data.data);
        } catch (err) {
            console.error("Failed to fetch properties", err);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            await api.post("/admin/owners", form);
            setForm({ name: "", email: "", password: "" });
            setShowForm(false);
            fetchOwners();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create owner");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAssignProperty = async () => {
        if (!selectedPropertyId || !assigningOwner) return;
        setAssigningLoading(true);
        try {
            await api.post(`/admin/properties/${selectedPropertyId}/assign-owner`, { ownerId: assigningOwner._id });
            setAssigningOwner(null);
            setSelectedPropertyId("");
            fetchOwners();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to assign property");
        } finally {
            setAssigningLoading(false);
        }
    };

    if (loading) {
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
            {/* Property Assignment Modal */}
            {assigningOwner && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
                }}>
                    <div className="glass-card animate-fade-up" style={{ width: "400px", padding: "32px", borderRadius: "24px" }}>
                        <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>Assign Property</h3>
                        <p style={{ color: "var(--text-tertiary)", fontSize: "14px", marginBottom: "24px" }}>
                            Assign a property to <strong>{assigningOwner.name}</strong>
                        </p>

                        <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--font-mono)", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Select Property</label>
                        <select
                            className="input-field"
                            value={selectedPropertyId}
                            onChange={(e) => setSelectedPropertyId(e.target.value)}
                            style={{ marginBottom: "24px" }}
                        >
                            <option value="">Choose a property...</option>
                            {properties.map(p => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                        </select>

                        <div style={{ display: "flex", gap: "12px" }}>
                            <button
                                className="btn-ghost"
                                onClick={() => { setAssigningOwner(null); setSelectedPropertyId(""); }}
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleAssignProperty}
                                disabled={!selectedPropertyId || assigningLoading}
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
                    <h1 className="display-text" style={{ fontSize: "32px", marginBottom: "6px" }}>Property Owners</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Manage platform users with administrative rights to properties</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => setShowForm(!showForm)}
                    style={{ padding: "10px 20px", fontSize: "14px", fontWeight: 600 }}
                >
                    {showForm ? "Cancel" : "Add Owner"}
                </button>
            </div>

            {showForm && (
                <div className="glass-card animate-fade-up" style={{ padding: "28px", marginBottom: "32px", borderRadius: "20px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>Create New Owner</h3>
                    {error && (
                        <div style={{ padding: "12px 16px", background: "rgba(255,82,82,0.1)", border: "1px solid rgba(255,82,82,0.2)", borderRadius: "10px", color: "var(--red)", fontSize: "13px", marginBottom: "20px" }}>
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleCreate} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--font-mono)", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Full Name</label>
                            <input
                                required
                                className="input-field"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. John Doe"
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--font-mono)", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Email Address</label>
                            <input
                                required
                                type="email"
                                className="input-field"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                placeholder="owner@example.com"
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--font-mono)", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Password</label>
                            <input
                                required
                                type="password"
                                className="input-field"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                placeholder="Min 6 characters"
                            />
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-end" }}>
                            <button disabled={submitting} type="submit" className="btn-primary" style={{ width: "100%", padding: "12px", height: "46px" }}>
                                {submitting ? "Creating..." : "Create Owner Account"}
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
                            <th style={{ textAlign: "left", padding: "16px 24px", color: "var(--text-tertiary)", fontWeight: 500 }}>Owner Details</th>
                            <th style={{ textAlign: "left", padding: "16px 24px", color: "var(--text-tertiary)", fontWeight: 500 }}>Assigned Properties</th>
                            <th style={{ textAlign: "center", padding: "16px 24px", color: "var(--text-tertiary)", fontWeight: 500 }}>Joined</th>
                            <th style={{ textAlign: "right", padding: "16px 24px", color: "var(--text-tertiary)", fontWeight: 500 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {owners.map((owner) => (
                            <tr key={owner._id} style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.2s" }} className="hover-bg">
                                <td style={{ padding: "16px 24px" }}>
                                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{owner.name}</div>
                                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>{owner.email}</div>
                                </td>
                                <td style={{ padding: "16px 24px" }}>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                        {owner.propertyIds?.length > 0 ? (
                                            owner.propertyIds.map(p => (
                                                <span key={p._id} style={{
                                                    padding: "2px 8px", borderRadius: "4px", background: "rgba(0,212,255,0.08)",
                                                    border: "1px solid rgba(0,212,255,0.2)", fontSize: "11px", color: "var(--accent-primary)"
                                                }}>
                                                    {p.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>No properties assigned</span>
                                        )}
                                    </div>
                                </td>

                                <td style={{ padding: "16px 24px", textAlign: "center", color: "var(--text-secondary)" }}>
                                    {new Date(owner.createdAt).toLocaleDateString()}
                                </td>
                                <td style={{ padding: "16px 24px", textAlign: "right" }}>
                                    <button
                                        onClick={() => setAssigningOwner(owner)}
                                        className="btn-ghost"
                                        style={{ fontSize: "12px", padding: "6px 12px" }}
                                    >
                                        Assign Property
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {owners.length === 0 && !loading && (
                    <div style={{ padding: "60px", textAlign: "center", color: "var(--text-tertiary)" }}>
                        No owners found on the platform.
                    </div>
                )}
            </div>
        </div>
    );
}
