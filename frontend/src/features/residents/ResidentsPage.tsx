import { useEffect, useMemo, useState } from "react"
import api from "../../services/api"

type Room = { _id: string; roomNumber: string; totalBeds: number; occupiedBeds: number; rent: number }
type Resident = { _id: string; name: string; email: string; isActive: boolean; createdAt: string; roomId?: { roomNumber: string; rent: number } | null }
type Profile = { resident: Resident; paymentSummary: { _id: string; count: number; total: number }[]; requestSummary: { _id: string; count: number }[] }

export default function ResidentsPage() {
    const [residents, setResidents] = useState<Resident[]>([])
    const [rooms, setRooms] = useState<Room[]>([])
    const [profile, setProfile] = useState<Profile | null>(null)
    const [editing, setEditing] = useState<Resident | null>(null)
    const [form, setForm] = useState({ name: "", email: "", password: "", roomNumber: "", rent: "" })
    const [editForm, setEditForm] = useState({ name: "", email: "", isActive: true })
    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [saving, setSaving] = useState(false)

    const load = async () => {
        setLoading(true)
        try {
            const [r, rm] = await Promise.all([api.get("/admin/residents"), api.get("/rooms")])
            setResidents(r.data.residents ?? [])
            setRooms(rm.data.rooms ?? [])
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Failed to load residents")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const filteredResidents = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return residents
        return residents.filter((resident) =>
            resident.name.toLowerCase().includes(q) ||
            resident.email.toLowerCase().includes(q) ||
            resident.roomId?.roomNumber?.toLowerCase().includes(q)
        )
    }, [query, residents])

    const addResident = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSaving(true)
        try {
            await api.post("/admin/residents", { ...form, rent: form.rent ? Number(form.rent) : undefined })
            setForm({ name: "", email: "", password: "", roomNumber: "", rent: "" })
            await load()
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Failed to add resident")
        } finally {
            setSaving(false)
        }
    }

    const openProfile = async (id: string) => {
        try {
            const r = await api.get(`/resident/${id}`)
            setProfile(r.data)
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Failed to open resident profile")
        }
    }

    const openEdit = (resident: Resident) => {
        setEditing(resident)
        setEditForm({ name: resident.name, email: resident.email, isActive: resident.isActive })
    }

    const saveEdit = async () => {
        if (!editing) return
        setSaving(true)
        try {
            await api.put(`/resident/${editing._id}`, editForm)
            setEditing(null)
            await load()
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Failed to update resident")
        } finally {
            setSaving(false)
        }
    }

    const activeCount = residents.filter((resident) => resident.isActive).length

    return (
        <div className="space-y-6 max-w-6xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-white">Residents</h1>
                    <p className="text-sm text-white/40">{activeCount} active · {residents.length - activeCount} inactive</p>
                </div>
                <input
                    className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-white text-sm min-w-64"
                    placeholder="Search name, email, room"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                />
            </div>

            {error && <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

            <form onSubmit={addResident} className="grid md:grid-cols-6 gap-2 rounded-2xl border border-white/10 p-3 bg-white/[0.02]">
                <input className="bg-white/5 p-2 rounded text-white" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                <input className="bg-white/5 p-2 rounded text-white" placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                <input className="bg-white/5 p-2 rounded text-white" placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <select className="bg-white/5 p-2 rounded text-white" value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })}>
                    <option value="">No room</option>
                    {rooms.map(room => <option key={room._id} value={room.roomNumber}>Room {room.roomNumber}</option>)}
                </select>
                <input className="bg-white/5 p-2 rounded text-white" type="number" placeholder="Rent" value={form.rent} onChange={e => setForm({ ...form, rent: e.target.value })} />
                <button disabled={saving} className="bg-violet-500 disabled:opacity-60 rounded text-white">{saving ? "Saving..." : "Add"}</button>
            </form>

            <div className="rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-white/40 border-b border-white/10">
                            <th className="p-3 text-left">Resident</th>
                            <th className="p-3 text-left">Room</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Joined</th>
                            <th className="p-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td className="p-6 text-white/50" colSpan={5}>Loading residents...</td></tr>
                        ) : filteredResidents.length === 0 ? (
                            <tr><td className="p-6 text-white/50" colSpan={5}>No residents found.</td></tr>
                        ) : filteredResidents.map(resident => (
                            <tr key={resident._id} className="border-b border-white/5 text-white/80">
                                <td className="p-3"><p>{resident.name}</p><p className="text-xs text-white/40">{resident.email}</p></td>
                                <td className="p-3">{resident.roomId?.roomNumber ? `Room ${resident.roomId.roomNumber}` : "—"}</td>
                                <td className="p-3">{resident.isActive ? "Active" : "Inactive"}</td>
                                <td className="p-3 text-white/45">{new Date(resident.createdAt).toLocaleDateString()}</td>
                                <td className="p-3 text-right space-x-3">
                                    <button onClick={() => openProfile(resident._id)} className="text-sky-300">Profile</button>
                                    <button onClick={() => openEdit(resident)} className="text-violet-300">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {profile && <div className="fixed inset-0 bg-black/70 p-4 flex justify-end" onClick={() => setProfile(null)}>
                <div className="w-full max-w-md bg-[#111320] border border-white/10 rounded-2xl p-5" onClick={event => event.stopPropagation()}>
                    <h3 className="text-white font-semibold">{profile.resident.name}</h3>
                    <p className="text-sm text-white/50">{profile.resident.email}</p>
                    <p className="text-xs text-white/40 mt-1">Room: {profile.resident.roomId?.roomNumber ?? "Unassigned"}</p>
                    <div className="mt-4 space-y-2 text-sm text-white/70">
                        {profile.paymentSummary.map((payment) => <p key={payment._id}>Payments {payment._id}: {payment.count} (${payment.total})</p>)}
                        {profile.requestSummary.map((request) => <p key={request._id}>Requests {request._id}: {request.count}</p>)}
                    </div>
                </div>
            </div>}

            {editing && <div className="fixed inset-0 bg-black/70 p-4 flex items-center justify-center">
                <div className="w-full max-w-md bg-[#111320] border border-white/10 rounded-2xl p-5 space-y-3">
                    <h3 className="text-white font-semibold">Edit Resident</h3>
                    <input className="w-full bg-white/5 p-2 rounded text-white" value={editForm.name} onChange={event => setEditForm({ ...editForm, name: event.target.value })} />
                    <input className="w-full bg-white/5 p-2 rounded text-white" value={editForm.email} onChange={event => setEditForm({ ...editForm, email: event.target.value })} />
                    <label className="text-white/70 flex items-center gap-2"><input type="checkbox" checked={editForm.isActive} onChange={event => setEditForm({ ...editForm, isActive: event.target.checked })} /> Active</label>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setEditing(null)} className="text-white/60">Cancel</button>
                        <button onClick={saveEdit} disabled={saving} className="bg-violet-500 disabled:opacity-60 px-3 py-1 rounded text-white">{saving ? "Saving..." : "Save"}</button>
                    </div>
                </div>
            </div>}
        </div>
    )
}
