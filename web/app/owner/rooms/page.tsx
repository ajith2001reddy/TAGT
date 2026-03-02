"use client";

import { useState } from "react";
import { useRooms } from "@/features/owner/useRooms";
import { createRoom, deleteRoom } from "@/features/owner/rooms.service";

export default function RoomsPage() {
    const { rooms, loading, reload } = useRooms();
    const [roomNumber, setRoomNumber] = useState("");
    const [rent, setRent] = useState("");
    const [beds, setBeds] = useState("");
    const [adding, setAdding] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setAdding(true);
        try {
            await createRoom({ roomNumber, rent: Number(rent), totalBeds: Number(beds) });
            setRoomNumber(""); setRent(""); setBeds("");
            setShowForm(false);
            reload();
        } finally {
            setAdding(false);
        }
    }

    async function handleDelete(id: string) {
        setDeleting(id);
        try {
            await deleteRoom(id);
            reload();
        } finally {
            setDeleting(null);
        }
    }

    const occupancyPct = (room: any) =>
        room.totalBeds > 0 ? Math.round((room.occupiedBeds / room.totalBeds) * 100) : 0;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                    <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "6px" }}>Rooms</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                        {rooms.length} room{rooms.length !== 1 ? "s" : ""} configured
                    </p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => setShowForm(!showForm)}
                    style={{ gap: "8px" }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Room
                </button>
            </div>

            {/* Add form */}
            {showForm && (
                <div className="glass-card animate-fade-up" style={{ padding: "24px", marginBottom: "24px", maxWidth: "560px" }}>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "16px", marginBottom: "20px", fontWeight: 600 }}>
                        New Room
                    </h3>
                    <form onSubmit={handleCreate} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "12px", alignItems: "end" }}>
                        <div>
                            <label className="label-text" style={{ display: "block", marginBottom: "6px" }}>Room No.</label>
                            <input className="input-field" placeholder="101" value={roomNumber} onChange={e => setRoomNumber(e.target.value)} required style={{ padding: "10px 12px" }} />
                        </div>
                        <div>
                            <label className="label-text" style={{ display: "block", marginBottom: "6px" }}>Rent (₹)</label>
                            <input className="input-field" type="number" placeholder="8000" value={rent} onChange={e => setRent(e.target.value)} required style={{ padding: "10px 12px" }} />
                        </div>
                        <div>
                            <label className="label-text" style={{ display: "block", marginBottom: "6px" }}>Total Beds</label>
                            <input className="input-field" type="number" placeholder="3" value={beds} onChange={e => setBeds(e.target.value)} required style={{ padding: "10px 12px" }} />
                        </div>
                        <button type="submit" className="btn-primary" disabled={adding} style={{ padding: "10px 18px", flexShrink: 0 }}>
                            {adding ? "..." : "Add"}
                        </button>
                    </form>
                </div>
            )}

            {/* Loading state */}
            {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: "140px", borderRadius: "16px" }} />
                    ))}
                </div>
            ) : rooms.length === 0 ? (
                <div style={{
                    textAlign: "center", padding: "80px 40px",
                    border: "1px dashed var(--border-subtle)", borderRadius: "16px",
                    color: "var(--text-tertiary)",
                }}>
                    <div style={{ fontSize: "40px", marginBottom: "16px" }}>🏠</div>
                    <p style={{ fontSize: "15px", fontWeight: 500, marginBottom: "8px", color: "var(--text-secondary)" }}>No rooms yet</p>
                    <p style={{ fontSize: "13px" }}>Click "Add Room" to get started</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
                    {rooms.map((room, i) => {
                        const pct = occupancyPct(room);
                        const accentColor = pct >= 90 ? "var(--green)" : pct >= 50 ? "var(--accent-primary)" : "var(--yellow)";

                        return (
                            <div
                                key={room._id}
                                className="glass-card animate-fade-up"
                                style={{ padding: "22px", animationDelay: `${i * 0.04}s` }}
                            >
                                {/* Room number */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                                    <div>
                                        <div className="label-text" style={{ marginBottom: "4px" }}>Room</div>
                                        <div style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 700, letterSpacing: "-0.02em" }}>
                                            {room.roomNumber}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(room._id)}
                                        disabled={deleting === room._id}
                                        style={{
                                            background: "transparent", border: "1px solid var(--border-subtle)",
                                            borderRadius: "8px", padding: "6px",
                                            cursor: "pointer", color: "var(--text-tertiary)",
                                            transition: "all 0.15s ease",
                                        }}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,82,82,0.3)";
                                            (e.currentTarget as HTMLButtonElement).style.color = "var(--red)";
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-subtle)";
                                            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-tertiary)";
                                        }}
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Rent */}
                                <div style={{
                                    fontFamily: "var(--font-display)",
                                    fontSize: "20px", fontWeight: 700,
                                    color: "var(--text-primary)",
                                    marginBottom: "14px",
                                }}>
                                    ₹{room.rent.toLocaleString()}<span style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 400, fontFamily: "var(--font-body)" }}>/mo</span>
                                </div>

                                {/* Occupancy bar */}
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                        <span className="label-text">Occupancy</span>
                                        <span style={{ fontSize: "12px", color: accentColor, fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                                            {room.occupiedBeds}/{room.totalBeds}
                                        </span>
                                    </div>
                                    <div style={{ height: "4px", background: "var(--border-subtle)", borderRadius: "2px", overflow: "hidden" }}>
                                        <div style={{
                                            height: "100%", width: `${pct}%`,
                                            background: `linear-gradient(90deg, ${accentColor}, ${accentColor}aa)`,
                                            borderRadius: "2px",
                                            transition: "width 0.6s ease",
                                        }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}