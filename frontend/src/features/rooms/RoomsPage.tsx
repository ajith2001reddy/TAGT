import { useEffect, useState } from "react"
import api from "../../services/api"

type Room = { _id: string; roomNumber: string; totalBeds: number; occupiedBeds: number; rent: number; note?: string }
type FormState = { roomNumber: string; totalBeds: string; rent: string; note: string }

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState<FormState>({ roomNumber: "", totalBeds: "", rent: "", note: "" })
    const f = (k: keyof FormState, v: string) => setForm(p => ({ ...p, [k]: v }))

    const load = async () => {
        try { setLoading(true); const r = await api.get("/rooms"); setRooms(r.data.rooms ?? []) }
        catch { } finally { setLoading(false) }
    }
    useEffect(() => { load() }, [])

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        const totalBeds = Number(form.totalBeds)
        const rent = Number(form.rent)

        if (!form.roomNumber.trim()) return setError("Room number is required")
        if (!Number.isFinite(totalBeds) || totalBeds <= 0) return setError("Total beds must be a positive number")
        if (!Number.isFinite(rent) || rent <= 0) return setError("Rent must be a positive number")

        setSaving(true)
        try {
            await api.post("/rooms", {
                roomNumber: form.roomNumber.trim(),
                totalBeds,
                rent,
                note: form.note.trim()
            })
            setShowForm(false)
            setForm({ roomNumber: "", totalBeds: "", rent: "", note: "" })
            load()
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to add room"
            setError(msg)
        } finally { setSaving(false) }
    }

    const handleDelete = async (room: Room) => {
        if (room.occupiedBeds > 0) return alert("Cannot delete a room with residents. Remove residents first.")
        if (!confirm(`Delete Room ${room.roomNumber}?`)) return
        try { await api.delete(`/rooms/${room._id}`); load() } catch { }
    }

    const occupancyPct = (r: Room) => r.totalBeds === 0 ? 0 : Math.round((r.occupiedBeds / r.totalBeds) * 100)

    const fields: { label: string; key: keyof FormState; placeholder: string; type?: string }[] = [
        { label: "Room Number *", key: "roomNumber", placeholder: "101" },
        { label: "Total Beds *", key: "totalBeds", placeholder: "2", type: "number" },
        { label: "Monthly Rent ($) *", key: "rent", placeholder: "1200", type: "number" },
        { label: "Note", key: "note", placeholder: "Optional..." },
    ]

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Rooms</h1>
                    <p className="text-white/30 text-sm mt-0.5">
                        {rooms.length} rooms · {rooms.reduce((s, r) => s + (r.occupiedBeds ?? 0), 0)} occupied beds
                    </p>
                </div>
                <button
                    onClick={() => { setShowForm(!showForm); setError("") }}
                    className="flex items-center gap-2 bg-violet-500 hover:bg-violet-400 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition"
                >
                    <span className="text-lg leading-none">{showForm ? "✕" : "+"}</span>
                    {showForm ? "Cancel" : "Add Room"}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleAdd} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
                    <h3 className="text-white/70 font-medium text-sm mb-4">New Room</h3>
                    {error && (
                        <p className="text-rose-400 text-xs bg-rose-400/10 border border-rose-400/20 px-3 py-2 rounded-lg mb-4">
                            {error}
                        </p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {fields.map(({ label, key, placeholder, type }) => (
                            <div key={key}>
                                <label className="block text-white/30 text-xs mb-1.5">{label}</label>
                                <input
                                    type={type ?? "text"}
                                    placeholder={placeholder}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white/80 text-sm placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition"
                                    value={form[key]}
                                    onChange={e => f(key, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition"
                    >
                        {saving ? "Saving..." : "Add Room"}
                    </button>
                </form>
            )}

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                </div>
            ) : rooms.length === 0 ? (
                <div className="text-center py-16 text-white/20">
                    <p className="text-4xl mb-3">▣</p>
                    <p className="text-sm">No rooms yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rooms.map((room) => {
                        const pct = occupancyPct(room)
                        const available = room.totalBeds - room.occupiedBeds
                        return (
                            <div
                                key={room._id}
                                className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 hover:border-white/10 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-white font-bold text-lg">Room {room.roomNumber}</p>
                                        <p className="text-white/30 text-xs mt-0.5">
                                            ${(room.rent ?? 0).toLocaleString()} / mo
                                        </p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${available === 0 ? "text-rose-400 bg-rose-400/10" : "text-emerald-400 bg-emerald-400/10"}`}>
                                        {available === 0 ? "Full" : `${available} free`}
                                    </span>
                                </div>
                                <div className="mb-4">
                                    <div className="flex justify-between text-[10px] text-white/30 mb-1.5">
                                        <span>{room.occupiedBeds} / {room.totalBeds} beds</span>
                                        <span>{pct}%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? "bg-rose-500" : pct > 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                                {room.note && (
                                    <p className="text-white/25 text-xs mb-4 truncate">{room.note}</p>
                                )}
                                <button
                                    onClick={() => handleDelete(room)}
                                    className="text-white/20 hover:text-rose-400 text-xs transition opacity-0 group-hover:opacity-100"
                                >
                                    Delete room
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}