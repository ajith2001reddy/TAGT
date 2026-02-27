import { useEffect, useState } from "react"
import api from "../../services/api"
import { useAuth } from "../../context/AuthContext"

type MyRequest = { _id: string; title: string; description: string; status: string; priority: string; createdAt: string }
type MyPayment = { _id: string; amount: number; status: string; month?: string; dueDate?: string }
type FormState = { title: string; description: string; priority: string }

const STATUS_STYLE: Record<string, string> = {
    pending: "text-amber-400 bg-amber-400/10",
    "in-progress": "text-blue-400 bg-blue-400/10",
    resolved: "text-emerald-400 bg-emerald-400/10",
}

export default function ResidentDashboard() {
    const { user } = useAuth()
    const [requests, setRequests] = useState<MyRequest[]>([])
    const [payments, setPayments] = useState<MyPayment[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState<FormState>({ title: "", description: "", priority: "medium" })
    const [showForm, setShowForm] = useState(false)
    const [error, setError] = useState("")

    const load = async () => {
        try {
            setLoading(true)
            const [r, p] = await Promise.all([api.get("/requests/me"), api.get("/payments/my")])
            setRequests(r.data.requests ?? [])
            setPayments(p.data.payments ?? [])
        } catch { } finally { setLoading(false) }
    }
    useEffect(() => { load() }, [])

    const submitRequest = async (e: React.FormEvent) => {
        e.preventDefault(); setError("")
        if (!form.title || !form.description) return setError("Title and description are required")
        setSubmitting(true)
        try {
            await api.post("/requests", form)
            setForm({ title: "", description: "", priority: "medium" })
            setShowForm(false); load()
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to submit"
            setError(msg)
        } finally { setSubmitting(false) }
    }

    const unpaid = payments.filter(p => p.status !== "paid")
    const totalDue = unpaid.reduce((s, p) => s + p.amount, 0)

    return (
        <div className="space-y-8 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Hello, {user?.name?.split(" ")[0]} 👋</h1>
                <p className="text-white/30 text-sm mt-0.5">Here's what's happening with your unit</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
                    <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Open Requests</p>
                    <p className="text-3xl font-bold text-white">{requests.filter(r => r.status !== "resolved").length}</p>
                </div>
                <div className={`rounded-2xl border p-5 ${totalDue > 0 ? "bg-amber-400/5 border-amber-400/15" : "bg-emerald-400/5 border-emerald-400/15"}`}>
                    <p className={`text-xs uppercase tracking-widest mb-2 ${totalDue > 0 ? "text-amber-400/60" : "text-emerald-400/60"}`}>Amount Due</p>
                    <p className={`text-3xl font-bold ${totalDue > 0 ? "text-amber-400" : "text-emerald-400"}`}>${totalDue.toLocaleString()}</p>
                </div>
            </div>

            {/* Requests */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white/70 text-sm font-semibold">Maintenance Requests</h2>
                    <button onClick={() => setShowForm(!showForm)} className="text-violet-400 hover:text-violet-300 text-xs transition flex items-center gap-1">
                        <span className="text-base leading-none">{showForm ? "✕" : "+"}</span>
                        {showForm ? "Cancel" : "New request"}
                    </button>
                </div>

                {showForm && (
                    <form onSubmit={submitRequest} className="mb-5 space-y-3 pb-5 border-b border-white/[0.06]">
                        {error && <p className="text-rose-400 text-xs bg-rose-400/10 px-3 py-2 rounded-lg">{error}</p>}
                        <input
                            placeholder="Title — e.g. Leaking pipe in bathroom"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-sm placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition"
                            value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                        />
                        <textarea
                            placeholder="Describe the issue in detail..."
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-sm placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition resize-none"
                            value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                        />
                        <div className="flex items-center gap-3">
                            <select
                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white/60 text-sm focus:outline-none focus:border-violet-500/50 transition"
                                value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                            >
                                {["low", "medium", "high", "urgent"].map(v => (
                                    <option key={v} value={v} className="bg-zinc-900 capitalize">{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                                ))}
                            </select>
                            <button type="submit" disabled={submitting} className="flex-1 bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-xl transition">
                                {submitting ? "Submitting..." : "Submit Request"}
                            </button>
                        </div>
                    </form>
                )}

                {loading ? (
                    <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" /></div>
                ) : requests.length === 0 ? (
                    <p className="text-white/20 text-sm text-center py-6">No requests yet</p>
                ) : (
                    <div className="space-y-3">
                        {requests.map(r => (
                            <div key={r._id} className="flex items-start gap-3 py-3 border-b border-white/[0.04] last:border-0">
                                <div className="flex-1 min-w-0">
                                    <p className="text-white/70 text-sm font-medium">{r.title}</p>
                                    <p className="text-white/30 text-xs mt-0.5 line-clamp-1">{r.description}</p>
                                    <p className="text-white/20 text-xs mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize flex-shrink-0 ${STATUS_STYLE[r.status] ?? "text-white/30 bg-white/5"}`}>
                                    {r.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Payments */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
                <h2 className="text-white/70 text-sm font-semibold mb-4">Recent Payments</h2>
                {payments.length === 0 ? (
                    <p className="text-white/20 text-sm text-center py-6">No payments yet</p>
                ) : (
                    <div className="space-y-2">
                        {payments.slice(0, 5).map(p => (
                            <div key={p._id} className="flex items-center gap-4 py-2.5 border-b border-white/[0.04] last:border-0">
                                <div className="flex-1">
                                    <p className="text-white/60 text-sm">{p.month ?? "Payment"}</p>
                                    {p.dueDate && <p className="text-white/20 text-xs">Due {new Date(p.dueDate).toLocaleDateString()}</p>}
                                </div>
                                <p className="text-white/70 font-medium text-sm">${p.amount.toLocaleString()}</p>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize ${p.status === "paid" ? "text-emerald-400 bg-emerald-400/10" : "text-amber-400 bg-amber-400/10"}`}>
                                    {p.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}