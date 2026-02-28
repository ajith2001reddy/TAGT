import { useEffect, useState } from "react"
import api from "../../services/api"
export default function OwnerRequestsPage() { const [items,setItems]=useState<any[]>([]); useEffect(()=>{api.get('/v2/owner/requests').then(r=>setItems(r.data.data||[]))},[]); return <div className="space-y-2">{items.map(x=><div key={x._id} className="border border-white/10 rounded p-3">{x.resident?.name} · {x.status} · {x.description}</div>)}</div> }
