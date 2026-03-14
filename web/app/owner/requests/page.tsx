"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { fetchJoinRequests, approveJoinRequest, rejectJoinRequest, JoinRequest } from "@/features/owner/owner.service";
import { toast } from "react-hot-toast";

interface Request {
    _id: string;
    message?: string;
    description?: string;
    priority: string;
    status: string;
    createdAt: string;
    resident?: { name: string; email: string };
    title?: string;
}

const PRIORITY_COLOR: Record<string, { bg: string; text: string }> = {
    low: { bg: "rgba(52,211,153,0.1)", text: "#34d399" },
    medium: { bg: "rgba(251,191,36,0.1)", text: "#fbbf24" },
    high: { bg: "rgba(255,82,82,0.1)", text: "#ff5252" },
};

const STATUS_OPTS = ["pending", "in-progress", "resolved"] as const;
const STATUS_COLOR: Record<string, string> = {
    pending: "#fbbf24",
    "in-progress": "var(--accent-primary)",
    resolved: "#34d399",
};
const STATUS_ICON: Record<string, string> = {
    pending: "🕐", "in-progress": "🔧", resolved: "✅",
};

function StatusSelector({ requestId, current, onChanged }: { requestId: string; current: string; onChanged: () => void }) {
    const [saving, setSaving] = useState(false);

    async function update(newStatus: string) {
        if (newStatus === current) return;
        setSaving(true);
        try {
            await api.patch(`/v2/requests/${requestId}`, { status: newStatus });
            onChanged();
        } catch { } finally { setSaving(false); }
    }

    return (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {STATUS_OPTS.map(s => {
                const active = s === current;
                const col = STATUS_COLOR[s];
                return (
                    <button
                        key={s}
                        onClick={() => update(s)}
                        disabled={saving || active}
                        style={{
                            fontSize: "10px", fontFamily: "var(--font-mono)", fontWeight: active ? 700 : 400,
                            letterSpacing: "0.08em", textTransform: "capitalize", padding: "4px 10px",
                            borderRadius: "6px", border: `1px solid ${active ? col + "40" : "var(--border-subtle)"}`,
                            background: active ? col + "18" : "transparent",
                            color: active ? col : "var(--text-tertiary)",
                            cursor: active ? "default" : "pointer", transition: "all 0.15s",
                        }}
                    >
                        {STATUS_ICON[s]} {s}
                    </button>
                );
            })}
        </div>
    );
}

export default function OwnerRequestsPage() {
    const [activeTab, setActiveTab] = useState<"maintenance" | "join">("maintenance");
    const [requests, setRequests] = useState<Request[]>([]);
    const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [filterPriority, setFilterPriority] = useState<string>("");

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/v2/requests");
            setRequests(res.data.data || []);
        } catch { } finally { setLoading(false); }
    }, []);

    const fetchJoin = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchJoinRequests();
            setJoinRequests(data);
        } catch { } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        if (activeTab === "maintenance") fetchRequests();
        else fetchJoin();
    }, [activeTab, fetchRequests, fetchJoin]);

    const handleApproveJoin = async (id: string) => {
        const success = await approveJoinRequest(id);
        if (success) {
            toast.success("Resident approved successfully");
            fetchJoin();
        } else {
            toast.error("Failed to approve resident");
        }
    };

    const handleRejectJoin = async (id: string) => {
        const success = await rejectJoinRequest(id);
        if (success) {
            toast.success("Request rejected");
            fetchJoin();
        } else {
            toast.error("Failed to reject request");
        }
    };

    const filtered = requests.filter(r => {
        if (filterStatus && r.status !== filterStatus) return false;
        if (filterPriority && r.priority !== filterPriority) return false;
        return true;
    });

    const pendingCount = requests.filter(r => r.status === "pending").length;
    const pendingJoin = joinRequests.filter(j => j.status === "pending").length;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ marginBottom: "28px" }}>
                <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Management</div>
                <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "4px" }}>Resident Requests</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                    {activeTab === "maintenance" ? `${requests.length} total · ${pendingCount} pending` : `${joinRequests.length} total · ${pendingJoin} pending`}
                </p>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "24px", borderBottom: "1px solid var(--border-subtle)", marginBottom: "24px" }}>
                <button
                    onClick={() => setActiveTab("maintenance")}
                    style={{
                        padding: "12px 4px", fontSize: "14px", fontWeight: 600, border: "none", background: "none", cursor: "pointer",
                        color: activeTab === "maintenance" ? "var(--accent-primary)" : "var(--text-tertiary)",
                        borderBottom: activeTab === "maintenance" ? "2px solid var(--accent-primary)" : "2px solid transparent",
                        transition: "all 0.2s"
                    }}
                >
                    Maintenance {pendingCount > 0 && <span style={{ marginLeft: "6px", padding: "2px 6px", borderRadius: "10px", background: "var(--accent-primary)", color: "white", fontSize: "10px" }}>{pendingCount}</span>}
                </button>
                <button
                    onClick={() => setActiveTab("join")}
                    style={{
                        padding: "12px 4px", fontSize: "14px", fontWeight: 600, border: "none", background: "none", cursor: "pointer",
                        color: activeTab === "join" ? "var(--accent-primary)" : "var(--text-tertiary)",
                        borderBottom: activeTab === "join" ? "2px solid var(--accent-primary)" : "2px solid transparent",
                        transition: "all 0.2s"
                    }}
                >
                    Join Requests {pendingJoin > 0 && <span style={{ marginLeft: "6px", padding: "2px 6px", borderRadius: "10px", background: "#f59e0b", color: "white", fontSize: "10px" }}>{pendingJoin}</span>}
                </button>
            </div>

            {activeTab === "maintenance" ? (
                <>
                    {/* Filters */}
                    <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
                        <select
                            className="input-field"
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            style={{ width: "160px", fontSize: "13px", padding: "9px 12px" }}
                        >
                            <option value="">All statuses</option>
                            {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select
                            className="input-field"
                            value={filterPriority}
                            onChange={e => setFilterPriority(e.target.value)}
                            style={{ width: "160px", fontSize: "13px", padding: "9px 12px" }}
                        >
                            <option value="">All priorities</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    {loading ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="skeleton" style={{ height: "110px", borderRadius: "14px" }} />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="glass-card" style={{ padding: "60px", textAlign: "center" }}>
                            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</div>
                            <div style={{ fontSize: "16px", fontWeight: 600 }}>No maintenance requests</div>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {filtered.map((r, i) => (
                                <div key={r._id} className="glass-card" style={{ padding: "20px 24px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: "14px" }}>{r.resident?.name || "Resident"}</div>
                                            <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>{r.description || r.message}</div>
                                        </div>
                                        <span style={{ fontSize: "10px", fontWeight: 700, color: PRIORITY_COLOR[r.priority]?.text, background: PRIORITY_COLOR[r.priority]?.bg, padding: "4px 8px", borderRadius: "6px", height: "fit-content" }}>{r.priority.toUpperCase()}</span>
                                    </div>
                                    <StatusSelector requestId={r._id} current={r.status} onChanged={fetchRequests} />
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <>
                    {loading ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="skeleton" style={{ height: "110px", borderRadius: "14px" }} />
                            ))}
                        </div>
                    ) : joinRequests.length === 0 ? (
                        <div className="glass-card" style={{ padding: "60px", textAlign: "center" }}>
                            <div style={{ fontSize: "40px", marginBottom: "12px" }}>👋</div>
                            <div style={{ fontSize: "16px", fontWeight: 600 }}>No join requests</div>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {joinRequests.map((j) => (
                                <div key={j._id} className="glass-card" style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                                            <span style={{ fontWeight: 700, fontSize: "15px" }}>{j.residentId.name}</span>
                                            <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{j.residentId.email}</span>
                                        </div>
                                        <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{j.message}</div>
                                        <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "6px" }}>Applied for: <strong>{j.propertyId.name}</strong></div>
                                    </div>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        {j.status === "pending" ? (
                                            <>
                                                <button onClick={() => handleApproveJoin(j._id)} className="btn-primary" style={{ padding: "8px 16px", fontSize: "12px", borderRadius: "8px" }}>Approve</button>
                                                <button onClick={() => handleRejectJoin(j._id)} className="btn-ghost" style={{ padding: "8px 16px", fontSize: "12px", borderRadius: "8px", color: "var(--red)" }}>Reject</button>
                                            </>
                                        ) : (
                                            <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: j.status === "approved" ? "var(--green)" : "var(--red)" }}>{j.status}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
