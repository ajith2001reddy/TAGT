import { useEffect, useState } from "react"
import api from "../../services/api"
export default function OwnerResidentsPage() {
  const [items, setItems] = useState<any[]>([])
  const [form, setForm] = useState({ name:'', email:'', password:'' })
  const load = () => api.get('/v2/owner/residents').then(r => setItems(r.data.data || []))
  useEffect(() => { load() }, [])
  const add = async (e: React.FormEvent) => { e.preventDefault(); await api.post('/v2/owner/residents', form); setForm({name:'',email:'',password:''}); load() }
  return <div className="space-y-4"><form onSubmit={add} className="flex gap-2"><input className="bg-white/5 p-2 rounded" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input className="bg-white/5 p-2 rounded" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input className="bg-white/5 p-2 rounded" placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><button className="bg-violet-500 px-4 rounded">Add</button></form>{items.map(u=><div key={u._id} className="border border-white/10 rounded p-3">{u.name} · {u.email}</div>)}</div>
}
