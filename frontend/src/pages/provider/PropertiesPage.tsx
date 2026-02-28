import { useEffect, useState } from "react"
import api from "../../services/api"

export default function ProviderPropertiesPage() {
  const [items, setItems] = useState<any[]>([])
  const load = () => api.get('/v2/provider/properties').then(r => setItems(r.data.data || []))
  useEffect(() => { load() }, [])
  const toggle = async (id: string, isActive: boolean) => { await api.patch(`/v2/provider/properties/${id}/status`, { isActive: !isActive }); load() }
  return <div className="space-y-3">{items.map(p => <div key={p._id} className="border border-white/10 rounded-xl p-4 flex justify-between"><div><p className="font-semibold">{p.name}</p><p className="text-sm text-white/50">{p.type} · {p.address}</p></div><button onClick={() => toggle(p._id, p.isActive)} className="px-3 py-1 rounded bg-white/10">{p.isActive ? 'Suspend':'Activate'}</button></div>)}</div>
}
