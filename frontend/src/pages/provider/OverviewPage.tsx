import { useEffect, useState } from "react"
import api from "../../services/api"

export default function ProviderOverviewPage() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { api.get('/v2/provider/overview').then(r => setData(r.data.data)).catch(() => setData(null)) }, [])
  const cards = [
    ["Total Properties", data?.totalProperties ?? "—"],
    ["Total Owners", data?.totalOwners ?? "—"],
    ["Total Residents", data?.totalResidents ?? "—"],
    ["Platform Revenue", `$${(data?.platformRevenue ?? 0).toLocaleString?.() || '—'}`],
  ]
  return <div className="grid md:grid-cols-4 gap-4">{cards.map(([t,v])=><div key={String(t)} className="border border-white/10 rounded-2xl p-5 bg-white/[0.03]"><p className="text-xs text-white/40">{t}</p><p className="text-2xl font-bold mt-2">{v}</p></div>)}</div>
}
