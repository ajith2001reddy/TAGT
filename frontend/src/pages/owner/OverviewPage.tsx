import { useEffect, useState } from "react"
import api from "../../services/api"

export default function OwnerOverviewPage() {
  const [d, setD] = useState<any>(null)
  useEffect(() => { api.get('/v2/analytics/owner-dashboard').then(r => setD(r.data.data)).catch(() => setD(null)) }, [])
  const cards = [["Residents", d?.totalResidents ?? '—'], ["Rooms", d?.totalRooms ?? '—'], ["Occupancy", `${d?.occupancyRate ?? 0}%`], ["Pending Payments", d?.pendingPayments ?? '—']]
  return <div className="grid md:grid-cols-4 gap-4">{cards.map(([t,v]) => <div key={String(t)} className="border border-white/10 rounded-2xl p-5 bg-white/[0.03]"><p className="text-xs text-white/40">{t}</p><p className="text-2xl font-bold mt-2">{v}</p></div>)}</div>
}
