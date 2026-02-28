import { useEffect, useState } from "react"
import api from "../../services/api"
export default function ResidentRequestsPage() {
  const [items,setItems]=useState<any[]>([])
  const [message,setMessage]=useState('')
  const load=()=>api.get('/v2/resident/dashboard').then(r=>setItems(r.data.data.requests||[]))
  useEffect(()=>{load()},[])
  return <div className="space-y-3"><form onSubmit={async e=>{e.preventDefault(); await api.post('/v2/resident/requests',{message}); setMessage(''); load()}} className="flex gap-2"><input className="bg-white/5 p-2 rounded flex-1" value={message} onChange={e=>setMessage(e.target.value)} placeholder="New request"/><button className="bg-violet-500 px-4 rounded">Submit</button></form>{items.map(r=><div key={r._id} className="border border-white/10 rounded p-3">{r.status} · {r.description}</div>)}</div>
}
