import { useEffect, useState } from "react"
import api from "../../services/api"

type Stats = {
    totalResidents: number
    pendingRequests: number
    totalRevenue: number
    outstandingBalance: number
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent: string }) {
    return (
        <div className={`relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 group hover:border-white/10 transition-all duration-300`}>
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10 ${accent}`} />
            <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-3">{label}</p>
            <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
            {sub && <p className="text-white/30 text-xs mt-1.5">{sub}</p>}
        </div>
    )
}

function RecentRow({ name, email, status, time }: { name: string; email: string; status: string; time: string }) {
    const color = status === "pending" ? "text-amber-400 bg-amber-400/10" : status === "in-progress" ? "text-blue-400 bg-blue-400/10" : "text-emerald-400 bg-emerald-400/10"
    return (
        <div className="flex items-center gap-4 py-3 border-b border-white/[0.04] last:border-0">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white/40 flex-shrink-0">
                {name[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-white/80 text-sm font-medium truncate">{name}</p>
                <p className="text-white/30 text-xs truncate">{email}</p>
            </div>
            <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize ${color}`}>{status}</span>
                <p className="text-white/20 text-xs hidden sm:block">{time}</p>
            </div>
        </div>
    )
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            api.get("/admin/stats"),
            api.get("/requests"),
        ]).then(([statsRes, reqRes]) => {
            setStats(statsRes.data.stats)
            setRequests(reqRes.data.requests?.slice(0, 5) ?? [])
        }).catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="space-y-8 max-w-6xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Overview</h1>
                <p className="text-white/30 text-sm mt-1">Property performance at a glance</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Residents" value={stats?.totalResidents ?? 0} sub="Active tenants" accent="bg-violet-500" />
                <StatCard label="Pending" value={stats?.pendingRequests ?? 0} sub="Open requests" accent="bg-amber-500" />
                <StatCard label="Revenue" value={`$${(stats?.totalRevenue ?? 0).toLocaleString()}`} sub="Total collected" accent="bg-emerald-500" />
                <StatCard label="Outstanding" value={`$${(stats?.outstandingBalance ?? 0).toLocaleString()}`} sub="Unpaid balance" accent="bg-rose-500" />
            </div>

            {/* Two-column bottom */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Requests */}
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-white/70 text-sm font-semibold">Recent Requests</h2>
                        <a href="/requests" className="text-violet-400 text-xs hover:text-violet-300 transition">View all →</a>
                    </div>
                    {requests.length === 0 ? (
                        <p className="text-white/20 text-sm text-center py-8">No requests yet</p>
                    ) : requests.map((r) => (
                        <RecentRow
                            key={r._id}
                            name={r.resident?.name ?? "Unknown"}
                            email={r.resident?.email ?? ""}
                            status={r.status}
                            time={new Date(r.createdAt).toLocaleDateString()}
                        />
                    ))}
                </div>

                {/* Quick Stats */}
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
                    <h2 className="text-white/70 text-sm font-semibold mb-5">Collection Rate</h2>
                    {stats && (
                        <>
                            <div className="mb-6">
                                <div className="flex justify-between text-xs text-white/40 mb-2">
                                    <span>Collected</span>
                                    <span>
                                        {stats.totalRevenue + stats.outstandingBalance > 0
                                            ? Math.round((stats.totalRevenue / (stats.totalRevenue + stats.outstandingBalance)) * 100)
                                            : 0}%
                                    </span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-700"
                                        style={{
                                            width: `${stats.totalRevenue + stats.outstandingBalance > 0
                                                ? Math.round((stats.totalRevenue / (stats.totalRevenue + stats.outstandingBalance)) * 100)
                                                : 0}%`
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { label: "Paid", value: `$${stats.totalRevenue.toLocaleString()}`, color: "bg-emerald-400" },
                                    { label: "Unpaid", value: `$${stats.outstandingBalance.toLocaleString()}`, color: "bg-rose-400" },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                                        <p className="text-white/40 text-sm flex-1">{item.label}</p>
                                        <p className="text-white/70 text-sm font-medium">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}