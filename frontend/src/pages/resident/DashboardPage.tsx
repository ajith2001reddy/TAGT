import { useEffect, useState } from "react"
import api from "../../services/api"

export default function ResidentDashboardPage() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { api.get('/v2/resident/dashboard').then(r => setData(r.data.data)).catch(()=>setData(null)) }, [])
  return <div className="grid gap-4 md:grid-cols-3"><div className="border border-white/10 rounded-2xl p-4">Room: {data?.profile?.roomId?.roomNumber || '—'}</div><div className="border border-white/10 rounded-2xl p-4">Payments: {data?.payments?.length || 0}</div><div className="border border-white/10 rounded-2xl p-4">Requests: {data?.requests?.length || 0}</div></div>
}
