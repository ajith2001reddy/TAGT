import { useEffect, useState } from "react"
import api from "../../services/api"

type Room = { _id: string; roomNumber: string; totalBeds: number; occupiedBeds: number; rent: number }
type Resident = { _id: string; name: string; email: string; isActive: boolean; createdAt: string; roomId?: { roomNumber: string; rent: number } | null }

type Profile = {
    resident: Resident
    paymentSummary: { _id: string; count: number; total: number }[]
    requestSummary: { _id: string; count: number }[]
}

export default function ResidentsPage() {
    const [residents, setResidents] = useState<Resident[]>([])
    const [rooms, setRooms] = useState<Room[]>([])
    const [profile, setProfile] = useState<Profile | null>(null)
    const [editing, setEditing] = useState<Resident | null>(null)
    const [form, setForm] = useState({ name: "", email: "", password: "", roomNumber: "", rent: "" })
    const [editForm, setEditForm] = useState({ name: "", email: "", isActive: true })

    const load = async () => {
        const [r, rm] = await Promise.all([api.get("/admin/residents"), api.get("/rooms")])
        setResidents(r.data.residents ?? [])
        setRooms(rm.data.rooms ?? [])
    }
    useEffect(() => { load() }, [])

    const addResident = async (e: React.FormEvent) => {
        e.preventDefault()
        await api.post("/admin/residents", { ...form, rent: form.rent ? Number(form.rent) : undefined })
        setForm({ name: "", email: "", password: "", roomNumber: "", rent: "" })
        load()
    }

    const openProfile = async (id: string) => {
        const r = await api.get(`/resident/${id}`)
        setProfile(r.data)
    }

    const openEdit = (r: Resident) => {
        setEditing(r)
        setEditForm({ name: r.name, email: r.email, isActive: r.isActive })
    }

    const saveEdit = async () => {
        if (!editing) return
        await api.put(`/resident/${editing._id}`, editForm)
        setEditing(null)
        load()
    }

    return <div className="space-y-6 max-w-6xl">
        <h1 className="text-2xl font-bold text-white">Residents</h1>
        <form onSubmit={addResident} className="grid md:grid-cols-6 gap-2 rounded-2xl border border-white/10 p-3">
            <input className="bg-white/5 p-2 rounded text-white" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input className="bg-white/5 p-2 rounded text-white" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input className="bg-white/5 p-2 rounded text-white" placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <select className="bg-white/5 p-2 rounded text-white" value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })}>
                <option value="">No room</option>
                {rooms.map(r => <option key={r._id} value={r.roomNumber}>Room {r.roomNumber}</option>)}
            </select>
            <input className="bg-white/5 p-2 rounded text-white" type="number" placeholder="Rent" value={form.rent} onChange={e => setForm({ ...form, rent: e.target.value })} />
            <button className="bg-violet-500 rounded text-white">Add</button>
        </form>

        <div className="rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
                <thead><tr className="text-white/40 border-b border-white/10"><th className="p-3 text-left">Name</th><th className="p-3 text-left">Room</th><th className="p-3 text-left">Status</th><th className="p-3"></th></tr></thead>
                <tbody>{residents.map(r => <tr key={r._id} className="border-b border-white/5 text-white/80">
                    <td className="p-3"><p>{r.name}</p><p className="text-xs text-white/40">{r.email}</p></td>
                    <td className="p-3">{r.roomId?.roomNumber ?? "—"}</td>
                    <td className="p-3">{r.isActive ? "Active" : "Inactive"}</td>
                    <td className="p-3 text-right space-x-3"><button onClick={() => openProfile(r._id)} className="text-sky-300">Profile</button><button onClick={() => openEdit(r)} className="text-violet-300">Edit</button></td>
                </tr>)}</tbody>
            </table>
        </div>

        {profile && <div className="fixed inset-0 bg-black/70 p-4 flex justify-end" onClick={() => setProfile(null)}>
            <div className="w-full max-w-md bg-[#111320] border border-white/10 rounded-2xl p-5" onClick={e => e.stopPropagation()}>
                <h3 className="text-white font-semibold">{profile.resident.name}</h3>
                <p className="text-sm text-white/50">{profile.resident.email}</p>
                <div className="mt-4 space-y-2 text-sm text-white/70">
                    {profile.paymentSummary.map(p => <p key={p._id}>{p._id}: {p.count} (${p.total})</p>)}
                    {profile.requestSummary.map(r => <p key={r._id}>Requests {r._id}: {r.count}</p>)}
                </div>
            </div>
        </div>}

        {editing && <div className="fixed inset-0 bg-black/70 p-4 flex items-center justify-center">
            <div className="w-full max-w-md bg-[#111320] border border-white/10 rounded-2xl p-5 space-y-3">
                <h3 className="text-white font-semibold">Edit Resident</h3>
                <input className="w-full bg-white/5 p-2 rounded text-white" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                <input className="w-full bg-white/5 p-2 rounded text-white" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                <label className="text-white/70 flex items-center gap-2"><input type="checkbox" checked={editForm.isActive} onChange={e => setEditForm({ ...editForm, isActive: e.target.checked })} /> Active</label>
                <div className="flex justify-end gap-2"><button onClick={() => setEditing(null)} className="text-white/60">Cancel</button><button onClick={saveEdit} className="bg-violet-500 px-3 py-1 rounded text-white">Save</button></div>
            </div>
        </div>}
    </div>
}
