"use client";

import { useState } from "react";
import { useRooms } from "@/features/owner/useRooms";
import { createRoom, deleteRoom, updateRoom } from "@/features/owner/rooms.service";
import { BedGrid } from "@/features/owner/BedGrid";
import { useProperty } from "@/context/PropertyContext";

function OccupancyBar({ occupied, total }: { occupied: number; total: number }) {
    const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;
    const color = pct >= 90 ? "#34d399" : pct >= 60 ? "var(--accent-primary)" : pct >= 30 ? "#fbbf24" : "var(--red)";
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", letterSpacing: "0.06em" }}>OCCUPANCY</span>
                <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 600, color }}>{occupied}/{total}</span>
            </div>
            <div style={{ height: "3px", background: "var(--border-subtle)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{
                    height: "100%", width: `${pct}%`,
                    background: `linear-gradient(90deg, ${color}, ${color}99)`,
                    borderRadius: "2px", transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
                    boxShadow: `0 0 8px ${color}60`,
                }} />
            </div>
        </div>
    );
}

export default function RoomsPage() {
    const { rooms, stats, loading, reload } = useRooms();
    const { property } = useProperty();
    const [roomNumber, setRoomNumber] = useState("");
    const [rent, setRent] = useState("");
    const [beds, setBeds] = useState("");
    const [adding, setAdding] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [editingRent, setEditingRent] = useState<string | null>(null);
    const [tempRent, setTempRent] = useState("");
    const [updatingRent, setUpdatingRent] = useState<string | null>(null);
    const [error, setError] = useState("");

    async function handleUpdateRent(id: string) {
        if (!tempRent || isNaN(Number(tempRent))) return;
        setUpdatingRent(id);
        try {
            await updateRoom(id, { rent: Number(tempRent) });
            setEditingRent(null);
            reload();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to update rent");
        } finally { setUpdatingRent(null); }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setAdding(true);
        setError("");
        try {
            if (!property?._id) {
                setError("Please select a property first");
                return;
            }
            await createRoom({ roomNumber, rent: Number(rent), totalBeds: Number(beds), propertyId: property._id });
            setRoomNumber(""); setRent(""); setBeds("");
            setShowForm(false);
            reload();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to create room");
        } finally { setAdding(false); }
    }

    async function handleDelete(id: string) {
        setDeleting(id);
        try { await deleteRoom(id); reload(); }
        catch (err: any) { setError(err?.response?.data?.message || "Failed to delete room"); }
        finally { setDeleting(null); }
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                    <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Property Management</div>
                    <h1 className="display-text" style={{ fontSize: "30px", marginBottom: "4px" }}>Rooms</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{rooms.length} unit{rooms.length !== 1 ? "s" : ""} configured</p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ gap: "8px", fontSize: "13.5px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Add Room
                </button>
            </div>

            {/* Summary Strip */}
            <div style={{
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "28px"
            }}>
                {[
                    { label: "Total Beds", value: stats?.totalBeds || 0, color: "var(--accent-primary)" },
                    { label: "Occupied Beds", value: stats?.occupiedBeds || 0, color: "#a78bfa" },
                    { label: "Avg Rent / Room", value: stats?.avgRent ? `₹${stats.avgRent.toLocaleString()}` : "—", color: "#34d399" },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{
                        background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
                        borderRadius: "12px", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}>
                        <span style={{ fontSize: "12px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
                        <span style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, color }}>{value}</span>
                    </div>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div style={{ background: "var(--red-bg)", border: "1px solid rgba(255,82,82,0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", color: "var(--red)", fontSize: "13px", display: "flex", gap: "10px", alignItems: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    {error}
                    <button onClick={() => setError("")} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: "16px" }}>×</button>
                </div>
            )}

            {/* Add Form */}
            {showForm && (
                <div className="glass-card animate-fade-up" style={{ padding: "24px", marginBottom: "24px" }}>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600, marginBottom: "20px" }}>New Room</h3>
                    <form onSubmit={handleCreate} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "12px", alignItems: "end" }}>
                        {[
                            { label: "Room No.", placeholder: "101", value: roomNumber, set: setRoomNumber, type: "text" },
                            { label: "Rent (₹)", placeholder: "8000", value: rent, set: setRent, type: "number" },
                            { label: "Total Beds", placeholder: "3", value: beds, set: setBeds, type: "number" },
                        ].map(({ label, placeholder, value, set, type }) => (
                            <div key={label}>
                                <label style={{ display: "block", fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "7px" }}>{label}</label>
                                <input className="input-field" type={type} placeholder={placeholder} value={value}
                                    onChange={e => set(e.target.value)} required style={{ padding: "11px 14px" }} />
                            </div>
                        ))}
                        <button type="submit" className="btn-primary" disabled={adding} style={{ padding: "11px 20px" }}>
                            {adding ? "Adding…" : "Create"}
                        </button>
                    </form>
                </div>
            )}

            {/* Rooms Grid */}
            {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
                    {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: "170px", borderRadius: "18px" }} />)}
                </div>
            ) : rooms.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 40px", border: "1px dashed var(--border-default)", borderRadius: "20px", color: "var(--text-tertiary)" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏠</div>
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>No rooms yet</p>
                    <p style={{ fontSize: "13px" }}>Click "Add Room" to get started</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
                    {rooms.map((room, i) => (
                        <div key={room._id} className="animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                            <div style={{
                                background: "var(--bg-card)", border: "1px solid var(--border-default)",
                                borderRadius: "18px", padding: "22px", position: "relative", overflow: "hidden",
                                transition: "all 0.25s ease",
                            }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
                                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                                    (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.4)";
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
                                    (e.currentTarget as HTMLElement).style.transform = "";
                                    (e.currentTarget as HTMLElement).style.boxShadow = "";
                                }}
                            >
                                {/* Maintenance badge */}
                                {(room as any).maintenanceMode && (
                                    <div style={{
                                        position: "absolute", top: "12px", right: "12px",
                                        background: "var(--yellow-bg)", color: "var(--yellow)",
                                        border: "1px solid rgba(255,215,64,0.2)", borderRadius: "6px",
                                        fontSize: "9px", fontFamily: "var(--font-mono)", fontWeight: 700,
                                        padding: "3px 8px", letterSpacing: "0.1em", textTransform: "uppercase",
                                    }}>Maintenance</div>
                                )}

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                            <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", letterSpacing: "0.1em" }}>ROOM</div>
                                            {(room.propertyId as any)?.name && (
                                                <span style={{
                                                    fontSize: "9px",
                                                    fontWeight: 700,
                                                    background: "rgba(255,255,255,0.05)",
                                                    padding: "2px 6px",
                                                    borderRadius: "4px",
                                                    color: "var(--accent-primary)",
                                                    border: "1px solid rgba(255,255,255,0.08)"
                                                }}>
                                                    {(room.propertyId as any).name}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 700, letterSpacing: "-0.03em" }}>{room.roomNumber}</div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(room._id)}
                                        disabled={deleting === room._id}
                                        style={{
                                            width: "32px", height: "32px", borderRadius: "9px",
                                            background: "transparent", border: "1px solid var(--border-subtle)",
                                            cursor: "pointer", color: "var(--text-tertiary)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            transition: "all 0.15s ease", flexShrink: 0,
                                        }}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLElement).style.background = "var(--red-bg)";
                                            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,82,82,0.3)";
                                            (e.currentTarget as HTMLElement).style.color = "var(--red)";
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLElement).style.background = "transparent";
                                            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                                            (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
                                        }}
                                    >
                                        {deleting === room._id
                                            ? <div style={{ width: "12px", height: "12px", border: "2px solid var(--red)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                                            : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                                        }
                                    </button>
                                </div>

                                <div style={{ marginBottom: "18px" }}>
                                    <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", letterSpacing: "0.1em", marginBottom: "4px" }}>RENT / MONTH</div>
                                    {editingRent === room._id ? (
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <input
                                                type="number"
                                                className="input-field"
                                                value={tempRent}
                                                onChange={e => setTempRent(e.target.value)}
                                                autoFocus
                                                style={{ padding: "4px 8px", fontSize: "16px", fontWeight: 700, width: "100px" }}
                                            />
                                            <button onClick={() => handleUpdateRent(room._id)} disabled={updatingRent === room._id} style={{ background: "var(--accent-primary)", border: "none", borderRadius: "6px", width: "28px", height: "28px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                {updatingRent === room._id ? <div className="spinner" style={{ width: "12px", height: "12px" }} /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                                            </button>
                                            <button onClick={() => setEditingRent(null)} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "6px", width: "28px", height: "28px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => { setEditingRent(room._id); setTempRent(room.rent.toString()); }}
                                            style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                                            onMouseEnter={e => (e.currentTarget.style.color = "var(--accent-primary)")}
                                            onMouseLeave={e => (e.currentTarget.style.color = "")}
                                        >
                                            ₹{room.rent.toLocaleString()}
                                            <span style={{ fontSize: "12px", fontWeight: 400, fontFamily: "var(--font-body)", color: "var(--text-tertiary)" }}>/mo</span>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.4 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                        </div>
                                    )}
                                </div>

                                <OccupancyBar occupied={room.occupiedBeds} total={room.totalBeds} />

                                <BedGrid roomId={room._id} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .spinner { border: 2px solid rgba(0,0,0,0.1); border-top-color: #000; border-radius: 50%; animation: spin 0.6s linear infinite; }
            `}</style>
        </div>
    );
}