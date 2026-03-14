"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

interface LogEntry {
    _id: string;
    action: string;
    role: string;
    route: string;
    ipAddress: string;
    createdAt: string;
    performedBy?: { name: string; email: string };
}

interface Pagination { page: number; limit: number; total: number; }

const ROLE_COLOR: Record<string, string> = {
    super_admin: "#a78bfa", owner: "var(--accent-primary)", resident: "#34d399",
};

const ACTION_ICON: Record<string, string> = {
    login: "🔐", logout: "🚪", create: "✨", update: "✏️", delete: "🗑️", view: "👁",
};

function getIcon(action: string) {
    const lower = action.toLowerCase();
    for (const [k, v] of Object.entries(ACTION_ICON)) { if (lower.includes(k)) return v; }
    return "📋";
}

export default function ActivityLogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0 });
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState("");
    const [actionFilter, setActionFilter] = useState("");

    const fetchLogs = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: "50" });
            if (roleFilter) params.set("role", roleFilter);
            if (actionFilter) params.set("action", actionFilter);
            const res = await api.get(`/v2/admin/activity-logs?${params}`);
            setLogs(res.data.data);
            setPagination(res.data.pagination);
        } catch { } finally { setLoading(false); }
    }, [roleFilter, actionFilter]);

    useEffect(() => { fetchLogs(1); }, [fetchLogs]);

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "28px" }}>
                <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Audit</div>
                <h1 className="display-text" style={{ fontSize: "30px", marginBottom: "4px" }}>Activity Logs</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{pagination.total.toLocaleString()} events recorded</p>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
                <select className="input-field" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ width: "160px", fontSize: "13px", padding: "9px 12px" }}>
                    <option value="">All roles</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="owner">Owner</option>
                    <option value="resident">Resident</option>
                </select>
                <input className="input-field" placeholder="Filter by action…" value={actionFilter} onChange={e => setActionFilter(e.target.value)} style={{ width: "200px", fontSize: "13px", padding: "9px 12px" }} />
            </div>

            {/* Log list */}
            <div className="glass-card" style={{ overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                            {["Event", "User", "Role", "Route", "IP", "Time"].map(h => (
                                <th key={h} style={{ padding: "13px 18px", textAlign: "left", fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", fontWeight: 500 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading
                            ? Array.from({ length: 10 }).map((_, i) => <tr key={i}><td colSpan={6} style={{ padding: "12px 18px" }}><div className="skeleton" style={{ height: "16px", borderRadius: "4px" }} /></td></tr>)
                            : logs.length === 0
                                ? <tr><td colSpan={6} style={{ padding: "60px", textAlign: "center", color: "var(--text-tertiary)" }}>No logs found</td></tr>
                                : logs.map(log => (
                                    <tr key={log._id} style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.12s" }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-card-hover)"}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}>
                                        <td style={{ padding: "12px 18px" }}>
                                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                                <span style={{ fontSize: "14px" }}>{getIcon(log.action)}</span>
                                                <span style={{ fontSize: "13px", fontWeight: 500 }}>{log.action}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: "12px 18px" }}>
                                            <div style={{ fontSize: "13px", fontWeight: 500 }}>{log.performedBy?.name || "—"}</div>
                                            <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{log.performedBy?.email || ""}</div>
                                        </td>
                                        <td style={{ padding: "12px 18px" }}>
                                            <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", background: (ROLE_COLOR[log.role] || "#666") + "15", color: ROLE_COLOR[log.role] || "var(--text-tertiary)", border: `1px solid ${ROLE_COLOR[log.role] || "#666"}25`, padding: "3px 9px", borderRadius: "5px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{log.role?.replace("_", " ") || "—"}</span>
                                        </td>
                                        <td style={{ padding: "12px 18px", fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.route || "—"}</td>
                                        <td style={{ padding: "12px 18px", fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}>{log.ipAddress || "—"}</td>
                                        <td style={{ padding: "12px 18px", fontSize: "12px", color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>
                                            {new Date(log.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                        </td>
                                    </tr>
                                ))
                        }
                    </tbody>
                </table>
                {/* Pagination */}
                {pagination.total > pagination.limit && (
                    <div style={{ padding: "14px 18px", borderTop: "1px solid var(--border-default)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}</span>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button className="btn-ghost" disabled={pagination.page === 1} onClick={() => fetchLogs(pagination.page - 1)} style={{ fontSize: "12px", padding: "6px 14px" }}>← Prev</button>
                            <button className="btn-ghost" disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)} onClick={() => fetchLogs(pagination.page + 1)} style={{ fontSize: "12px", padding: "6px 14px" }}>Next →</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
