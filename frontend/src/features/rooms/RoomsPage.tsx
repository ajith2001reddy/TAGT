import { useEffect, useState } from "react"
import api from "../../services/api"

type Room = { _id: string; roomNumber: string; totalBeds: number; occupiedBeds: number; rent: number; note?: string; maintenanceMode?: boolean; maintenanceNote?: string }

type FormState = { roomNumber: string; totalBeds: string; rent: string; note: string }
type EditState = { rent: string; totalBeds: string; note: string; maintenanceMode: boolean; maintenanceNote: string }

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState<FormState>({ roomNumber: "", totalBeds: "", rent: "", note: "" })
    const [editing, setEditing] = useState<Room | null>(null)
    const [edit, setEdit] = useState<EditState>({ rent: "", totalBeds: "", note: "", maintenanceMode: false, maintenanceNote: "" })

    const load = async () => {
        try { setLoading(true); const r = await api.get("/rooms"); setRooms(r.data.rooms ?? []) }
        finally { setLoading(false) }
    }
    useEffect(() => { load() }, [])

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        await api.post("/rooms", { roomNumber: form.roomNumber, totalBeds: Number(form.totalBeds), rent: Number(form.rent), note: form.note })
        setShowForm(false)
        setForm({ roomNumber: "", totalBeds: "", rent: "", note: "" })
        load()
    }

    const openEdit = (room: Room) => {
        setEditing(room)
        setEdit({ rent: String(room.rent), totalBeds: String(room.totalBeds), note: room.note ?? "", maintenanceMode: Boolean(room.maintenanceMode), maintenanceNote: room.maintenanceNote ?? "" })
    }

    const saveEdit = async () => {
        if (!editing) return
        await api.put(`/rooms/${editing._id}`, { ...edit, rent: Number(edit.rent), totalBeds: Number(edit.totalBeds) })
        setEditing(null)
        load()
    }

    return <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Rooms & Maintenance</h1>
            <button onClick={() => setShowForm(v => !v)} className="bg-violet-500 text-white px-4 py-2 rounded-xl">{showForm ? "Cancel" : "Add Room"}</button>
        </div>

        {showForm && <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3 rounded-2xl bg-white/[0.03] p-4 border border-white/10">
            <input className="bg-white/5 p-2 rounded-lg text-white" placeholder="Room #" value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} />
            <input className="bg-white/5 p-2 rounded-lg text-white" placeholder="Beds" type="number" value={form.totalBeds} onChange={e => setForm({ ...form, totalBeds: e.target.value })} />
            <input className="bg-white/5 p-2 rounded-lg text-white" placeholder="Rent" type="number" value={form.rent} onChange={e => setForm({ ...form, rent: e.target.value })} />
            <input className="bg-white/5 p-2 rounded-lg text-white" placeholder="Note" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
            <button className="col-span-2 bg-violet-500 py-2 rounded-lg text-white">Save</button>
        </form>}

        <div className="rounded-2xl border border-white/10 overflow-hidden">
            {loading ? <div className="p-10 text-white/40">Loading...</div> : <table className="w-full text-sm">
                <thead><tr className="border-b border-white/10 text-white/40"><th className="p-3 text-left">Room</th><th className="p-3 text-left">Occupancy</th><th className="p-3 text-left">Rent</th><th className="p-3 text-left">Mode</th><th className="p-3"></th></tr></thead>
                <tbody>{rooms.map(r => <tr key={r._id} className="border-b border-white/5 text-white/75">
                    <td className="p-3">{r.roomNumber}</td>
                    <td className="p-3">{r.occupiedBeds}/{r.totalBeds}</td>
                    <td className="p-3">${r.rent}</td>
                    <td className="p-3">{r.maintenanceMode ? "Maintenance" : "Live"}</td>
                    <td className="p-3 text-right"><button onClick={() => openEdit(r)} className="text-violet-300">Edit</button></td>
                </tr>)}</tbody>
            </table>}
        </div>

        {editing && <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111320] p-5 space-y-3">
                <h3 className="text-white font-semibold">Edit Room {editing.roomNumber}</h3>
                <input className="w-full bg-white/5 p-2 rounded text-white" type="number" value={edit.rent} onChange={e => setEdit({ ...edit, rent: e.target.value })} />
                <input className="w-full bg-white/5 p-2 rounded text-white" type="number" value={edit.totalBeds} onChange={e => setEdit({ ...edit, totalBeds: e.target.value })} />
                <input className="w-full bg-white/5 p-2 rounded text-white" value={edit.note} onChange={e => setEdit({ ...edit, note: e.target.value })} placeholder="Note" />
                <label className="text-white/70 text-sm flex items-center gap-2"><input type="checkbox" checked={edit.maintenanceMode} onChange={e => setEdit({ ...edit, maintenanceMode: e.target.checked })} /> Maintenance mode</label>
                {edit.maintenanceMode && <input className="w-full bg-white/5 p-2 rounded text-white" value={edit.maintenanceNote} onChange={e => setEdit({ ...edit, maintenanceNote: e.target.value })} placeholder="Maintenance reason" />}
                <div className="flex justify-end gap-2"><button onClick={() => setEditing(null)} className="px-3 py-2 text-white/60">Cancel</button><button onClick={saveEdit} className="px-3 py-2 bg-violet-500 text-white rounded">Update</button></div>
            </div>
        </div>}
    </div>
}
