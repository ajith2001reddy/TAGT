import { useEffect, useState } from "react"
import api from "../../services/api"

type Payment = {
    _id: string
    amount: number
    status: string
    month?: string
    type: string
    dueDate?: string
    paidAt?: string
    resident?: { name: string; email: string } | null
}

const STATUS_STYLE: Record<string, string> = {
    paid: "text-emerald-400 bg-emerald-400/10",
    pending: "text-amber-400 bg-amber-400/10",
    failed: "text-rose-400 bg-rose-400/10",
    cancelled: "text-white/30 bg-white/5",
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("all")
    const [marking, setMarking] = useState<string | null>(null)

    const load = async () => {
        try { setLoading(true); const r = await api.get("/payments"); setPayments(r.data.payments ?? []) }
        catch { } finally { setLoading(false) }
    }
    useEffect(() => { load() }, [])

    const markPaid = async (id: string) => {
        setMarking(id)
        try { await api.put(`/payments/${id}/paid`); load() }
        catch { } finally { setMarking(null) }
    }

    const deletePayment = async (id: string) => {
        if (!confirm("Delete this payment?")) return
        try { await api.delete(`/payments/${id}`); load() } catch { }
    }

    const filtered = filter === "all" ? payments : payments.filter(p => p.status === filter)
    const totalCollected = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0)
    const totalPending = payments.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0)

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Payments</h1>
                <p className="text-white/30 text-sm mt-0.5">{payments.length} total records</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-emerald-400/5 border border-emerald-400/10 p-5">
                    <p className="text-emerald-400/60 text-xs uppercase tracking-widest mb-2">Collected</p>
                    <p className="text-2xl font-bold text-emerald-400">${totalCollected.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl bg-amber-400/5 border border-amber-400/10 p-5">
                    <p className="text-amber-400/60 text-xs uppercase tracking-widest mb-2">Pending</p>
                    <p className="text-2xl font-bold text-amber-400">${totalPending.toLocaleString()}</p>
                </div>
            </div>

            <div className="flex gap-2">
                {["all", "pending", "paid", "failed"].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${filter === f ? "bg-violet-500 text-white" : "bg-white/5 text-white/40 hover:text-white/70"}`}>
                        {f}
                    </button>
                ))}
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" /></div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-white/20"><p className="text-sm">No payments found</p></div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                {["Resident", "Amount", "Type", "Month", "Status", ""].map(h => (
                                    <th key={h} className="px-5 py-3.5 text-left text-white/30 text-xs font-medium uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p) => (
                                <tr key={p._id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-5 py-4">
                                        <p className="text-white/80 font-medium">{p.resident?.name ?? "—"}</p>
                                        <p className="text-white/30 text-xs">{p.resident?.email ?? ""}</p>
                                    </td>
                                    <td className="px-5 py-4 text-white/70 font-medium">${p.amount.toLocaleString()}</td>
                                    <td className="px-5 py-4">
                                        <span className="px-2.5 py-1 bg-white/5 rounded-lg text-white/40 text-xs capitalize">{p.type}</span>
                                    </td>
                                    <td className="px-5 py-4 text-white/40 text-xs">{p.month ?? "—"}</td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize ${STATUS_STYLE[p.status] ?? "text-white/40 bg-white/5"}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {p.status !== "paid" && (
                                                <button onClick={() => markPaid(p._id)} disabled={marking === p._id}
                                                    className="text-emerald-400 hover:text-emerald-300 text-xs transition px-2 py-1 rounded hover:bg-emerald-400/10 disabled:opacity-50">
                                                    {marking === p._id ? "..." : "Mark paid"}
                                                </button>
                                            )}
                                            <button onClick={() => deletePayment(p._id)} className="text-white/20 hover:text-rose-400 text-xs transition px-2 py-1 rounded hover:bg-rose-400/10">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}