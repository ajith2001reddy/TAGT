import { useEffect, useState } from "react"
import api from "../../services/api"

type Room = { _id: string; roomNumber: string; totalBeds: number; occupiedBeds: number; rent: number }
type Resident = {
    _id: string; name: string; email: string; isActive: boolean; createdAt: string
    roomId?: { roomNumber: string; rent: number } | null
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#0f0f17] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-white font-semibold">{title}</h2>
                    <button onClick={onClose} className="text-white/20 hover:text-white/60 transition text-lg leading-none">✕</button>
                </div>
                {children}
            </div>
        </div>
    )
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div>
            <label className="block text-white/40 text-xs mb-1.5 font-medium">{label}</label>
            <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-sm placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition" {...props} />
        </div>
    )
}

export default function ResidentsPage() {
    const [residents, setResidents] = useState<Resident[]>([])
    const [rooms, setRooms] = useState<Room[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [form, setForm] = useState({ name: "", email: "", password: "", roomNumber: "", rent: "" })

    const f = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }))

    const load = async () => {
        try {
            setLoading(true)
            const [r, rm] = await Promise.all([api.get("/admin/residents"), api.get("/rooms")])
            setResidents(r.data.residents ?? [])
            setRooms(rm.data.rooms ?? [])
        } catch { } finally { setLoading(false) }
    }

    useEffect(() => { load() }, [])

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        if (!form.name || !form.email || !form.password) return setError("Name, email and password are required")
        setSaving(true)
        try {
            await api.post("/admin/residents", {
                name: form.name, email: form.email, password: form.password,
                roomNumber: form.roomNumber || undefined,
                rent: form.rent ? Number(form.rent) : undefined,
            })
            setShowModal(false)
            setForm({ name: "", email: "", password: "", roomNumber: "", rent: "" })
            load()
        } catch (err: any) {
            setError(err.response?.data?.message ?? "Failed to add resident")
        } finally { setSaving(false) }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? This also deletes their payments.`)) return
        try { await api.delete(`/resident/${id}`); load() }
        catch { }
    }

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Residents</h1>
                    <p className="text-white/30 text-sm mt-0.5">{residents.length} total</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-violet-500 hover:bg-violet-400 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition"
                >
                    <span className="text-lg leading-none">+</span> Add Resident
                </button>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                    </div>
                ) : residents.length === 0 ? (
                    <div className="text-center py-16 text-white/20">
                        <p className="text-4xl mb-3">◈</p>
                        <p className="text-sm">No residents yet. Add your first one.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                {["Resident", "Room", "Rent / mo", "Status", "Joined", ""].map(h => (
                                    <th key={h} className="px-5 py-3.5 text-left text-white/30 text-xs font-medium uppercase tracking-wider first:pl-5">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {residents.map((r) => (
                                <tr key={r._id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white/40 flex-shrink-0">
                                                {r.name[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-white/80 font-medium">{r.name}</p>
                                                <p className="text-white/30 text-xs">{r.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        {r.roomId ? (
                                            <span className="px-2.5 py-1 bg-white/5 rounded-lg text-white/50 text-xs border border-white/8">
                                                Room {r.roomId.roomNumber}
                                            </span>
                                        ) : <span className="text-white/20">—</span>}
                                    </td>
                                    <td className="px-5 py-4 text-white/50">
                                        {r.roomId?.rent ? `$${r.roomId.rent.toLocaleString()}` : <span className="text-white/20">—</span>}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${r.isActive ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${r.isActive ? "bg-emerald-400" : "bg-red-400"}`} />
                                            {r.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-white/30 text-xs">
                                        {new Date(r.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(r._id, r.name)}
                                            className="text-white/20 hover:text-rose-400 text-xs transition px-2 py-1 rounded hover:bg-rose-400/10"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Modal */}
            {showModal && (
                <Modal title="New Resident" onClose={() => { setShowModal(false); setError("") }}>
                    <form onSubmit={handleAdd} className="space-y-4">
                        {error && <p className="text-rose-400 text-xs bg-rose-400/10 border border-rose-400/20 px-3 py-2 rounded-lg">{error}</p>}
                        <Input label="Full Name *" placeholder="Jane Smith" value={form.name} onChange={e => f("name", e.target.value)} required />
                        <Input label="Email *" type="email" placeholder="jane@example.com" value={form.email} onChange={e => f("email", e.target.value)} required />
                        <Input label="Password *" type="password" placeholder="Temporary password" value={form.password} onChange={e => f("password", e.target.value)} required />
                        <div>
                            <label className="block text-white/40 text-xs mb-1.5 font-medium">Room</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-sm focus:outline-none focus:border-violet-500/50 transition"
                                value={form.roomNumber}
                                onChange={e => f("roomNumber", e.target.value)}
                            >
                                <option value="">— No room —</option>
                                {rooms.filter(r => r.occupiedBeds < r.totalBeds).map(r => (
                                    <option key={r._id} value={r.roomNumber}>
                                        Room {r.roomNumber} · ${r.rent}/mo · {r.totalBeds - r.occupiedBeds} bed{r.totalBeds - r.occupiedBeds !== 1 ? "s" : ""} free
                                    </option>
                                ))}
                            </select>
                        </div>
                        {!form.roomNumber && (
                            <Input label="Manual Rent ($/mo)" type="number" placeholder="1200" min="1" value={form.rent} onChange={e => f("rent", e.target.value)} />
                        )}
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition text-sm mt-2"
                        >
                            {saving ? "Adding..." : "Add Resident"}
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    )
}