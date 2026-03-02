"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

interface DashboardData {
    profile: { name: string; email: string };
    room: { roomNumber: string; rent: number; totalBeds: number; occupiedBeds: number } | null;
    currentPayment: { amount: number; status: string; dueDate: string; lateFee?: number; totalPayable?: number } | null;
    daysUntilDue: number | null;
    isOverdue: boolean;
    totalPaid: number;
    totalLateFeePaid: number;
    paymentHistory: { _id: string; month: string; amount: number; status: string; lateFee?: number; paidAt?: string }[];
    notifications: { type: string; message: string }[];
}

const STATUS_COLOR: Record<string, string> = { paid: "#34d399", pending: "#fbbf24", overdue: "var(--red)", failed: "#ff1744" };
const NOTIF_STYLE: Record<string, { bg: string; color: string; border: string; icon: string }> = {
    danger: { bg: "var(--red-bg)", color: "var(--red)", border: "rgba(255,82,82,0.2)", icon: "⚠" },
    warning: { bg: "var(--yellow-bg)", color: "var(--yellow)", border: "rgba(255,215,64,0.2)", icon: "⏰" },
    success: { bg: "var(--green-bg)", color: "var(--green)", border: "rgba(0,230,118,0.2)", icon: "✅" },
};

export default function ResidentDashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const currentMonth = new Date().toISOString().slice(0, 7);

    useEffect(() => {
        api.get("/v2/resident/dashboard/v2").then(r => setData(r.data.data)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: "130px", borderRadius: "18px" }} />)}
        </div>
    );

    if (!data) return <div style={{ color: "var(--text-tertiary)", textAlign: "center", padding: "80px" }}>Could not load dashboard.</div>;

    const daysLabel = data.daysUntilDue === null ? "—"
        : data.isOverdue ? `${Math.abs(data.daysUntilDue)} days overdue`
            : data.daysUntilDue === 0 ? "Due today!"
                : `${data.daysUntilDue} days`;

    return (
        <div className="animate-fade-in">
            {/* Greeting */}
            <div style={{ marginBottom: "32px" }}>
                <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>
                    {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                </div>
                <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "6px" }}>Welcome back, {data.profile.name.split(" ")[0]} 👋</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Here's your tenancy overview for {currentMonth}.</p>
            </div>

            {/* Notifications */}
            {(data.notifications || []).length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
                    {data.notifications.map((n, i) => {
                        const style = NOTIF_STYLE[n.type] || NOTIF_STYLE.warning;
                        return (
                            <div key={i} style={{ background: style.bg, border: `1px solid ${style.border}`, borderRadius: "12px", padding: "14px 18px", color: style.color, fontSize: "13.5px", display: "flex", gap: "10px", alignItems: "center" }}>
                                <span style={{ fontSize: "16px" }}>{style.icon}</span>
                                {n.message}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Main cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px", marginBottom: "32px" }}>
                {/* Current Month Rent */}
                <div style={{ background: "var(--bg-card)", border: `1px solid ${data.isOverdue ? "rgba(255,82,82,0.3)" : data.currentPayment?.status === "paid" ? "rgba(0,230,118,0.2)" : "var(--border-default)"}`, borderRadius: "18px", padding: "24px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${data.isOverdue ? "var(--red)" : data.currentPayment?.status === "paid" ? "#34d399" : "#fbbf24"}60, transparent)` }} />
                    <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "10px" }}>This Month's Rent</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, letterSpacing: "-0.03em" }}>
                        ₹{(data.currentPayment?.totalPayable || data.currentPayment?.amount || data.room?.rent || 0).toLocaleString()}
                    </div>
                    {data.currentPayment?.lateFee ? <div style={{ fontSize: "12px", color: "var(--red)", marginTop: "4px" }}>+₹{data.currentPayment.lateFee} late fee</div> : null}
                    <div style={{ marginTop: "10px" }}>
                        <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.08em", padding: "4px 10px", borderRadius: "6px", textTransform: "uppercase", background: STATUS_COLOR[data.currentPayment?.status || "pending"] + "15", color: STATUS_COLOR[data.currentPayment?.status || "pending"], border: `1px solid ${STATUS_COLOR[data.currentPayment?.status || "pending"]}25` }}>
                            {data.currentPayment?.status || "No bill yet"}
                        </span>
                    </div>
                </div>

                {/* Due Date Countdown */}
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "18px", padding: "24px" }}>
                    <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "10px" }}>Due Date</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 700, letterSpacing: "-0.03em", color: data.isOverdue ? "var(--red)" : data.daysUntilDue !== null && data.daysUntilDue <= 3 ? "#fbbf24" : "var(--text-primary)" }}>
                        {daysLabel}
                    </div>
                    {data.currentPayment?.dueDate && <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "6px" }}>{new Date(data.currentPayment.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}</div>}
                </div>

                {/* Room Info */}
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "18px", padding: "24px" }}>
                    <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "10px" }}>Your Room</div>
                    {data.room
                        ? <>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700 }}>#{data.room.roomNumber}</div>
                            <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "6px" }}>{data.room.occupiedBeds}/{data.room.totalBeds} beds · ₹{data.room.rent?.toLocaleString()}/mo</div>
                        </>
                        : <div style={{ color: "var(--text-tertiary)", fontSize: "14px" }}>Not assigned</div>
                    }
                </div>

                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "18px", padding: "24px" }}>
                    <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "10px" }}>Total Paid</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 700, color: "#34d399" }}>₹{(data.totalPaid || 0).toLocaleString()}</div>
                    {(data.totalLateFeePaid || 0) > 0 && <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px" }}>+₹{data.totalLateFeePaid} in late fees</div>}
                </div>
            </div>

            {/* Payment History */}
            <div style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Payment History</div>
                <Link href="/resident/payments" style={{ fontSize: "12px", color: "var(--accent-primary)", textDecoration: "none" }}>View all →</Link>
            </div>
            <div className="glass-card" style={{ overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                            {["Month", "Amount", "Late Fee", "Status", "Paid On"].map(h => (
                                <th key={h} style={{ padding: "13px 18px", textAlign: "left", fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", fontWeight: 500 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {(data.paymentHistory || []).slice(0, 10).map(p => (
                            <tr key={p._id} style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.15s" }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-card-hover)"}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}>
                                <td style={{ padding: "13px 18px", fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600 }}>{p.month}</td>
                                <td style={{ padding: "13px 18px", fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 700 }}>₹{p.amount.toLocaleString()}</td>
                                <td style={{ padding: "13px 18px", fontSize: "13px", color: p.lateFee ? "var(--red)" : "var(--text-tertiary)" }}>{p.lateFee ? `₹${p.lateFee}` : "—"}</td>
                                <td style={{ padding: "13px 18px" }}>
                                    <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.08em", padding: "4px 9px", borderRadius: "6px", textTransform: "uppercase", background: STATUS_COLOR[p.status] + "15", color: STATUS_COLOR[p.status], border: `1px solid ${STATUS_COLOR[p.status]}25` }}>{p.status}</span>
                                </td>
                                <td style={{ padding: "13px 18px", fontSize: "12px", color: "var(--text-tertiary)" }}>{p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-IN") : "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}