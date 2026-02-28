import { useEffect, useState } from "react"
import api from "../../services/api"
export default function OwnerRoomsPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [form, setForm] = useState({ roomNumber: '', totalBeds: 1, rentAmount: 0 })
  const load = () => api.get('/v2/rooms').then(r => setRooms(r.data.data || []))
  useEffect(() => { load() }, [])
  const add = async (e: React.FormEvent) => { e.preventDefault(); await api.post('/v2/rooms', form); setForm({ roomNumber:'', totalBeds:1, rentAmount:0 }); load() }
  return <div className="space-y-4"><form onSubmit={add} className="flex gap-2"><input className="bg-white/5 p-2 rounded" placeholder="Room" value={form.roomNumber} onChange={e=>setForm({...form,roomNumber:e.target.value})}/><input className="bg-white/5 p-2 rounded" type="number" value={form.totalBeds} onChange={e=>setForm({...form,totalBeds:Number(e.target.value)})}/><input className="bg-white/5 p-2 rounded" type="number" value={form.rentAmount} onChange={e=>setForm({...form,rentAmount:Number(e.target.value)})}/><button className="bg-violet-500 px-4 rounded">Add</button></form>{rooms.map(r=><div key={r._id} className="border border-white/10 rounded p-3">Room {r.roomNumber} · {r.occupiedBeds}/{r.totalBeds} · ${r.rent}</div>)}</div>
}
