import { useEffect, useState } from "react"
import api from "../../services/api"

type Request = {
    _id: string
    title: string
    description: string
    status: string
    priority: string
    createdAt: string
    resident?: { name: string; email: string } | null
}

const STATUS_STYLE: Record<string, string> = {
    pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    "in-progress": "text-blue-400 bg-blue-400/10 border-blue-400/20",
    resolved: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
}

const PRIORITY_STYLE: Record<string, string> = {
    low: "text-white/30",
    medium: "text-amber-400/70",
    high: "text-orange-400",
    urgent: "text-rose-400",
}

export default function RequestsPage() {
    const [requests, setRequests] = useState<Request[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<Request | null>(null)
    const [newStatus, setNewStatus] = useState("")
    const [saving, setSaving] = useState(false)
    const [filter, setFilter] = useState("all")

    const load = async () => {
        try { setLoading(true); const r = await api.get("/requests"); setRequests(r.data.requests ?? []) }
        catch { } finally { setLoading(false) }
    }
    useEffect(() => { load() }, [])

    const updateStatus = async () => {
        if (!selected || !newStatus) return
        setSaving(true)
        try {
            await api.put(`/requests/${selected._id}/status`, { status: newStatus })
            setSelected(null); setNewStatus(""); load()
        } catch { } finally { setSaving(false) }
    }

    const deleteReq = async (id: string) => {
        if (!confirm("Delete this request?")) return
        try { await api.delete(`/requests/${id}`); load() } catch { }
    }

    const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter)

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Maintenance Requests</h1>
                <p className="text-white/30 text-sm mt-0.5">{requests.filter(r => r.status !== "resolved").length} open</p>
            </div>

            <div className="flex gap-2 flex-wrap">
                {["all", "pending", "in-progress", "resolved"].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${filter === f ? "bg-violet-500 text-white" : "bg-white/5 text-white/40 hover:text-white/70"}`}>
                        {f === "in-progress" ? "In Progress" : f}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-white/20"><p className="text-4xl mb-3">◇</p><p className="text-sm">No requests found</p></div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((r) => (
                        <div key={r._id} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 hover:border-white/10 transition-all">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-white/80 font-medium">{r.title}</p>
                                        <span className={`text-[10px] font-semibold uppercase ${PRIORITY_STYLE[r.priority] ?? "text-white/30"}`}>
                                            {r.priority}
                                        </span>
                                    </div>
                                    <p className="text-white/30 text-sm line-clamp-2">{r.description}</p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <p className="text-white/25 text-xs">{r.resident?.name ?? "Unknown"}</p>
                                        <p className="text-white/20 text-xs">{new Date(r.createdAt).toLocaleDateString()}</p>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_STYLE[r.status] ?? "text-white/30 bg-white/5 border-white/10"}`}>
                                            {r.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {r.status !== "resolved" && (
                                        <button onClick={() => { setSelected(r); setNewStatus(r.status) }}
                                            className="text-violet-400 hover:text-violet-300 text-xs transition px-3 py-1.5 rounded-lg bg-violet-400/10 hover:bg-violet-400/20">
                                            Update
                                        </button>
                                    )}
                                    <button onClick={() => deleteReq(r._id)} className="text-white/20 hover:text-rose-400 text-xs transition px-2 py-1.5 rounded hover:bg-rose-400/10">✕</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelected(null)} />
                    <div className="relative bg-[#0f0f17] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                        <h3 className="text-white font-semibold mb-1">Update Status</h3>
                        <p className="text-white/30 text-sm mb-5 truncate">{selected.title}</p>
                        <div className="space-y-2 mb-5">
                            {["pending", "in-progress", "resolved"].map(s => (
                                <button key={s} onClick={() => setNewStatus(s)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm capitalize transition ${newStatus === s ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" : "bg-white/5 text-white/50 hover:bg-white/8"}`}>
                                    {s === "in-progress" ? "In Progress" : s}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setSelected(null)} className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/50 text-sm hover:bg-white/8 transition">Cancel</button>
                            <button onClick={updateStatus} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-sm font-medium disabled:opacity-50 transition">
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}