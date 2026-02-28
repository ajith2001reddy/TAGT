import { useEffect, useState } from "react"
import api from "../../services/api"
export default function ResidentPaymentsPage() { const [items,setItems]=useState<any[]>([]); useEffect(()=>{api.get('/v2/resident/dashboard').then(r=>setItems(r.data.data.payments||[]))},[]); return <div className="space-y-2">{items.map(p=><div key={p._id} className="border border-white/10 rounded p-3">{p.month} · ${p.amount} · {p.status}</div>)}</div> }
