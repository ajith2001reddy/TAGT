"use client";

import { useState } from "react";
import { useRooms } from "@/features/owner/useRooms";
import { createRoom, deleteRoom, updateRoom } from "@/features/owner/rooms.service";
import { BedGrid } from "@/features/owner/BedGrid";
import { useProperty } from "@/context/PropertyContext";
import { useAuth } from "@/context/AuthContext";
import { 
    Plus, 
    Home, 
    Users, 
    MoreVertical, 
    TrendingUp, 
    Bed,
    AlertCircle,
    LayoutGrid
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

interface Room {
    _id: string;
    roomNumber: string;
    rent: number;
    totalBeds: number;
    occupiedBeds: number;
    maintenanceMode?: boolean;
}

export default function RoomsPage() {
    const { dbUser } = useAuth();
    const { rooms, stats, loading, reload } = useRooms();
    const { property } = useProperty();
    const [showAdd, setShowAdd] = useState(false);
    const [adding, setAdding] = useState(false);
    
    // Form State
    const [form, setForm] = useState({ roomNumber: "", rent: "", totalBeds: "" });

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setAdding(true);
        try {
            if (!property?._id) return toast.error("Select a property first");
            await createRoom({ ...form, rent: Number(form.rent), totalBeds: Number(form.totalBeds), propertyId: property._id });
            setForm({ roomNumber: "", rent: "", totalBeds: "" });
            setShowAdd(false);
            reload();
            toast.success("Room added!");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to add room");
        } finally { setAdding(false); }
    }

    return (
        <div className="animate-fade-in">
            {/* HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
                <div>
                    <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "4px" }}>Inventory & Rooms</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                        Managing {rooms.length} Units · {stats?.occupiedBeds || 0}/{stats?.totalBeds || 0} Beds Occupied
                    </p>
                </div>
                <button className="btn-primary" onClick={() => setShowAdd(true)} style={{ gap: "10px" }}>
                    <Plus size={18} /> Add New Room
                </button>
            </div>

            {/* VISUAL ROOM GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
                {loading ? (
                    [1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: "200px", borderRadius: "24px" }} />)
                ) : rooms.length === 0 ? (
                    <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "100px", color: "var(--text-tertiary)" }}>
                        <LayoutGrid size={48} style={{ margin: "0 auto 16px", opacity: 0.2 }} />
                        <p>Your property inventory is empty. Start by adding a room.</p>
                    </div>
                ) : rooms.map((room: Room) => (
                    <motion.div 
                        key={room._id}
                        whileHover={{ y: -4 }}
                        className="glass-card" 
                        style={{ 
                            padding: "24px", 
                            borderRadius: "28px", 
                            border: "1px solid var(--border-subtle)",
                            background: "rgba(255,255,255,0.02)"
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ 
                                    width: "48px", height: "48px", borderRadius: "14px", 
                                    background: "var(--accent-primary)15", color: "var(--accent-primary)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "18px", fontWeight: 800
                                }}>
                                    {room.roomNumber}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: "16px" }}>Room {room.roomNumber}</div>
                                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>₹{room.rent.toLocaleString()}/month</div>
                                </div>
                            </div>
                            <button className="btn-ghost" style={{ padding: "8px" }}><MoreVertical size={16} /></button>
                        </div>

                        {/* OCCUPANCY BAR */}
                        <div style={{ marginBottom: "24px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
                                <span>Occupancy</span>
                                <span style={{ color: (room.occupiedBeds / room.totalBeds) >= 1 ? "var(--red)" : "var(--accent-primary)" }}>
                                    {room.occupiedBeds}/{room.totalBeds} Beds Full
                                </span>
                            </div>
                            <div style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "100px", overflow: "hidden" }}>
                                <div style={{ 
                                    height: "100%", 
                                    width: `${(room.occupiedBeds / room.totalBeds) * 100}%`,
                                    background: (room.occupiedBeds / room.totalBeds) >= 1 ? "var(--red)" : "var(--accent-primary)",
                                    borderRadius: "100px"
                                }} />
                            </div>
                        </div>

                        {/* BED GRID OVERVIEW */}
                        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
                            <BedGrid roomId={room._id} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ADD ROOM MODAL */}
            {showAdd && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
                    <div className="glass-card animate-fade-up" style={{ padding: "32px", width: "420px" }}>
                        <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "24px" }}>Add New Room</h2>
                        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div>
                                <label style={labelStyle}>Room Number</label>
                                <input className="input-field" placeholder="e.g. 101" value={form.roomNumber} onChange={v => setForm({...form, roomNumber: v.target.value})} required />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div>
                                    <label style={labelStyle}>Monthly Rent (₹)</label>
                                    <input type="number" className="input-field" placeholder="8500" value={form.rent} onChange={v => setForm({...form, rent: v.target.value})} required />
                                </div>
                                <div>
                                    <label style={labelStyle}>Total Beds</label>
                                    <input type="number" className="input-field" placeholder="2" value={form.totalBeds} onChange={v => setForm({...form, totalBeds: v.target.value})} required />
                                </div>
                            </div>
                            <div style={{ marginTop: "12px", display: "flex", gap: "12px" }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>Discard</button>
                                <button type="submit" className="btn-primary" disabled={adding} style={{ flex: 1 }}>{adding ? "Creating..." : "Create Room"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const labelStyle = { display: "block", fontSize: "11px", fontWeight: 800, color: "var(--text-tertiary)", marginBottom: "6px", textTransform: "uppercase" as const };