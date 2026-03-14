"use client";

import { useEffect, useState } from "react";
import { Resident, fetchResidents, createResident, deactivateResident, moveResidentRoom } from "@/features/owner/residents.service";
import { fetchRooms } from "@/features/owner/rooms.service";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { 
    Users, 
    Search, 
    Plus, 
    Filter, 
    MoreVertical, 
    Phone, 
    CheckCircle2,
    AlertCircle,
    Home,
    FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Room { _id: string; roomNumber: string; totalBeds: number; occupiedBeds: number; }

export default function ResidentsPage() {
    const { dbUser } = useAuth();
    const [residents, setResidents] = useState<Resident[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);
    const [payAmount, setPayAmount] = useState("");
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Resident | null>(null);

    // 1-Step Form
    const [form, setForm] = useState({ 
        name: "", 
        phoneNumber: "", 
        roomId: "",
        rent: "" 
    });
    
    const [creating, setCreating] = useState(false);

    async function fetchData() {
        try {
            const [resData, roomData] = await Promise.all([fetchResidents(), fetchRooms()]);
            setResidents(resData);
            setRooms(roomData as unknown as Room[]);
        } catch { toast.error("Failed to load residents"); } finally { setLoading(false); }
    }
    
    useEffect(() => { fetchData(); }, []);

    async function handleQuickAdd(e: React.FormEvent) {
        e.preventDefault();
        setCreating(true);
        try {
            await createResident({
                ...form,
                email: `${form.name.toLowerCase().replace(/\s+/g, '')}@noemail.com`, 
            });
            setShowAdd(false); 
            setForm({ name: "", phoneNumber: "", roomId: "", rent: "" }); 
            toast.success("Resident added!");
            await fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to add resident");
        } finally { setCreating(false); }
    }

    async function handleRecordPayment(e: React.FormEvent) {
        e.preventDefault();
        if (!selected) return;
        try {
            await api.post("/v2/payments", {
                residentId: selected._id,
                amount: Number(payAmount),
                type: "Rent",
                month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
            });
            toast.success(`Rent collected for ${selected.name}`);
            setShowPayModal(false);
            setPayAmount("");
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Payment record failed");
        }
    }

    const filtered = residents.filter(r => 
        r.name.toLowerCase().includes(search.toLowerCase()) || 
        r.phoneNumber?.includes(search)
    );

    return (
        <div className="animate-fade-in">
            {/* TOP BAR */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
                <div>
                    <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "4px" }}>Residents</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                        {residents.length} People · <span style={{ color: "#34d399" }}>{residents.filter(r => r.roomId).length} Housed</span>
                    </p>
                </div>
                <button className="btn-primary" onClick={() => setShowAdd(true)} style={{ gap: "10px" }}>
                    <Plus size={18} /> Add Resident
                </button>
            </div>

            {/* SEACH & FILTER */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                <div style={{ flex: 1, position: "relative" }}>
                    <Search size={18} style={{ position: "absolute", left: "16px", top: "12px", color: "var(--text-tertiary)" }} />
                    <input 
                        className="input-field" 
                        placeholder="Search by name or phone..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        style={{ paddingLeft: "44px" }} 
                    />
                </div>
                <button className="btn-secondary" style={{ padding: "0 16px" }}><Filter size={18} /></button>
            </div>

            {/* MAIN CONTENT AREA */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "32px", alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {loading ? (
                        [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: "80px", borderRadius: "16px" }} />)
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: "80px", textAlign: "center", color: "var(--text-tertiary)" }}>No residents found.</div>
                    ) : filtered.map(r => (
                        <motion.div 
                            key={r._id}
                            onClick={() => setSelected(r)}
                            layoutId={r._id}
                            style={{ 
                                background: selected?._id === r._id ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                                border: selected?._id === r._id ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                                padding: "16px 20px",
                                borderRadius: "16px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between"
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <div style={{ 
                                    width: "44px", height: "44px", borderRadius: "12px", 
                                    background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "14px", fontWeight: 700, color: "var(--accent-primary)"
                                }}>
                                    {r.name.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: "15px" }}>{r.name}</div>
                                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: "6px" }}>
                                        <Home size={12} /> {r.roomId ? `Room ${r.roomId.roomNumber}` : "Unassigned"}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ 
                                        display: "flex", alignItems: "center", gap: "6px", 
                                        fontSize: "12px", fontWeight: 700,
                                        color: r.isActive !== false ? "#34d399" : "#ff5252"
                                    }}>
                                        {r.isActive !== false ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                        {r.isActive !== false ? "PAID" : "DUE"}
                                    </div>
                                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>April 2026</div>
                                </div>
                                <MoreVertical size={18} color="var(--text-tertiary)" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* SIDEBAR DETAIL */}
                <AnimatePresence mode="wait">
                    {selected ? (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="glass-card" 
                            style={{ padding: "32px", borderRadius: "32px", position: "sticky", top: "20px" }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
                                <h3 style={{ fontSize: "20px", fontWeight: 800 }}>Resident Profile</h3>
                                <button onClick={() => setSelected(null)} className="btn-ghost" style={{ padding: "4px" }}>×</button>
                            </div>

                            <div style={{ textAlign: "center", marginBottom: "32px" }}>
                                <div style={{ 
                                    width: "80px", height: "80px", borderRadius: "24px", 
                                    background: "var(--accent-primary)20", color: "var(--accent-primary)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "28px", fontWeight: 800, margin: "0 auto 16px"
                                }}>
                                    {selected.name.charAt(0)}
                                </div>
                                <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "4px" }}>{selected.name}</h2>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "32px" }}>
                                <DetailItem icon={<Phone size={16} />} label="Phone" value={selected.phoneNumber} />
                                <DetailItem icon={<Home size={16} />} label="Room" value={selected.roomId ? `Room ${selected.roomId.roomNumber}` : "Not Assigned"} />
                                <DetailItem icon={<FileText size={16} />} label="Lease Status" value="Digital Signed" />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <button className="btn-primary" onClick={() => { setPayAmount("0"); setShowPayModal(true); }} style={{ justifyContent: "center" }}>Mark Paid</button>
                                <button className="btn-secondary" style={{ justifyContent: "center" }}>Edit</button>
                            </div>
                        </motion.div>
                    ) : (
                        <div style={{ padding: "60px 40px", textAlign: "center", border: "2px dashed var(--border-subtle)", borderRadius: "32px", color: "var(--text-tertiary)" }}>
                            <Users size={40} style={{ marginBottom: "16px", opacity: 0.3, margin: "0 auto" }} />
                            <p>Select a resident to view details.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* PAYMENT MODAL */}
            {showPayModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 110 }}>
                    <div className="glass-card animate-fade-up" style={{ padding: "32px", width: "380px" }}>
                        <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px" }}>Collect Rent</h2>
                        <p style={{ fontSize: "14px", color: "var(--text-tertiary)", marginBottom: "24px" }}>Recording payment for {selected?.name}.</p>
                        <form onSubmit={handleRecordPayment} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div>
                                <label style={labelStyle}>Amount Received (₹)</label>
                                <input type="number" className="input-field" value={payAmount} onChange={v => setPayAmount(v.target.value)} required />
                            </div>
                            <div style={{ display: "flex", gap: "12px" }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowPayModal(false)} style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Confirm</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ADD MODAL */}
            {showAdd && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
                    <div className="glass-card animate-fade-up" style={{ padding: "32px", width: "420px" }}>
                        <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "24px" }}>Quick Add</h2>
                        <form onSubmit={handleQuickAdd} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <input className="input-field" placeholder="Name" value={form.name} onChange={v => setForm({...form, name: v.target.value})} required />
                            <input className="input-field" placeholder="Phone" value={form.phoneNumber} onChange={v => setForm({...form, phoneNumber: v.target.value})} required />
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <select className="input-field" value={form.roomId} onChange={v => setForm({...form, roomId: v.target.value})} required>
                                    <option value="">Room</option>
                                    {rooms.map(r => <option key={r._id} value={r._id}>Room {r.roomNumber}</option>)}
                                </select>
                                <input className="input-field" placeholder="Rent (₹)" value={form.rent} onChange={v => setForm({...form, rent: v.target.value})} />
                            </div>
                            <div style={{ display: "flex", gap: "12px" }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={creating} style={{ flex: 1 }}>Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

interface DetailItemProps { icon: React.ReactNode; label: string; value: string | undefined | null; }
function DetailItem({ icon, label, value }: DetailItemProps) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ color: "var(--accent-primary)" }}>{icon}</div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>{label}</div>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>{value || "—"}</div>
            </div>
        </div>
    );
}

const labelStyle = { display: "block", fontSize: "11px", fontWeight: 800, color: "var(--text-tertiary)", marginBottom: "6px", textTransform: "uppercase" as const };