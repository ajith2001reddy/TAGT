"use client";

import { useState } from "react";
import { useProperty } from "@/context/PropertyContext";
import { api } from "@/lib/api";



export default function PropertyPage() {
    const { property, loading, refreshProperty } = useProperty();

    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: property?.name || "",
        address: property?.address || "",
        city: property?.city || "",
        totalRooms: property?.totalRooms || 0,
    });

    if (loading) {
        return <div style={{ padding: 40 }}>Loading property...</div>;
    }

    if (!property) {
        return (
            <div style={{ padding: 40 }}>
                <h2>No property found</h2>
                <p>Create a property to start managing rooms.</p>
            </div>
        );
    }

    async function handleSave() {
        if (!property) return;

        try {
            setSaving(true);

            await api.put(`/properties/${property._id}`, form);

            await refreshProperty();
            setEditMode(false);
        } catch (err) {
            alert("Failed to update property");
        } finally {
            setSaving(false);
        }
    }

    const occupancyRate =
        property.totalBeds > 0
            ? Math.round((property.occupiedBeds / property.totalBeds) * 100)
            : 0;

    return (
        <div style={{ padding: 40, maxWidth: 1100, margin: "0 auto" }}>
            {/* HEADER */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 30,
                }}
            >
                <h1 style={{ fontSize: 28, fontWeight: 700 }}>
                    Property Settings
                </h1>

                {!editMode ? (
                    <button
                        onClick={() => setEditMode(true)}
                        style={buttonStyle}
                    >
                        Edit Property
                    </button>
                ) : (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={buttonStyle}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                )}
            </div>

            {/* PROPERTY INFO CARD */}
            <div style={cardStyle}>
                {editMode ? (
                    <>
                        <Input
                            label="Property Name"
                            value={form.name}
                            onChange={(v) =>
                                setForm({ ...form, name: v })
                            }
                        />
                        <Input
                            label="Address"
                            value={form.address}
                            onChange={(v) =>
                                setForm({ ...form, address: v })
                            }
                        />
                        <Input
                            label="City"
                            value={form.city}
                            onChange={(v) =>
                                setForm({ ...form, city: v })
                            }
                        />
                        <Input
                            label="Total Rooms"
                            type="number"
                            value={form.totalRooms}
                            onChange={(v) =>
                                setForm({
                                    ...form,
                                    totalRooms: Number(v),
                                })
                            }
                        />
                    </>
                ) : (
                    <>
                        <Detail label="Name" value={property.name} />
                        <Detail
                            label="Address"
                            value={property.address}
                        />
                        <Detail label="City" value={property.city} />
                        <Detail
                            label="Total Rooms"
                            value={property.totalRooms}
                        />
                    </>
                )}
            </div>

            {/* STATS SECTION */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 20,
                    marginTop: 30,
                }}
            >
                <StatCard
                    title="Total Rooms"
                    value={property.totalRooms}
                />
                <StatCard
                    title="Total Beds"
                    value={property.totalBeds}
                />
                <StatCard
                    title="Occupied Beds"
                    value={property.occupiedBeds}
                />
                <StatCard
                    title="Occupancy Rate"
                    value={`${occupancyRate}%`}
                />
                <StatCard
                    title="Monthly Revenue"
                    value={`₹ ${property.monthlyRevenue || 0}`}
                />
            </div>
        </div>
    );
}

/* ================= COMPONENTS ================= */

function Input({
    label,
    value,
    onChange,
    type = "text",
}: {
    label: string;
    value: any;
    onChange: (v: string) => void;
    type?: string;
}) {
    return (
        <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 600 }}>
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) =>
                    onChange(e.target.value)
                }
                style={{
                    width: "100%",
                    padding: 10,
                    marginTop: 6,
                    borderRadius: 6,
                    border: "1px solid #ccc",
                }}
            />
        </div>
    );
}

function Detail({
    label,
    value,
}: {
    label: string;
    value: any;
}) {
    return (
        <div style={{ marginBottom: 12 }}>
            <strong>{label}:</strong> {value}
        </div>
    );
}

function StatCard({
    title,
    value,
}: {
    title: string;
    value: any;
}) {
    return (
        <div
            style={{
                padding: 20,
                borderRadius: 12,
                border: "1px solid #e5e5e5",
                background: "#fafafa",
            }}
        >
            <div
                style={{
                    fontSize: 13,
                    color: "#777",
                    marginBottom: 6,
                }}
            >
                {title}
            </div>
            <div
                style={{
                    fontSize: 22,
                    fontWeight: 700,
                }}
            >
                {value}
            </div>
        </div>
    );
}

const cardStyle: React.CSSProperties = {
    padding: 25,
    borderRadius: 14,
    border: "1px solid #e5e5e5",
    background: "#fff",
};

const buttonStyle: React.CSSProperties = {
    padding: "10px 18px",
    borderRadius: 8,
    border: "none",
    background: "#000",
    color: "#fff",
    cursor: "pointer",
};