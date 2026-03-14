"use client";

import { useOwnerStats } from "@/features/owner/useOwnerStats";
import { DashboardCard } from "@/components/ui/PremiumUI";
import { motion } from "framer-motion";
import { ClipboardList, Users, BedDouble, CreditCard, ChevronRight, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { ActivityTimeline } from "@/components/owner/ActivityTimeline"; // Reusing for the right column

export default function OperationsDashboard() {
    const { stats, loading } = useOwnerStats(); // Leveraging stats for top level metric counts

    if (loading) return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: "130px", borderRadius: "20px" }} />
            ))}
        </div>
    );

    // Mock quick lists for operations
    const recentRequests = [
        { id: "REQ-001", title: "AC Not Cooling", status: "pending", room: "101-A", time: "2 hours ago" },
        { id: "REQ-002", title: "Plumbing leak", status: "in_progress", room: "204-B", time: "5 hours ago" },
        { id: "REQ-003", title: "Wi-Fi slow", status: "resolved", room: "305-C", time: "1 day ago" }
    ];

    const recentPayments = [
        { id: "PAY-991", amount: "₹8,500", name: "Rahul Singh", status: "paid", time: "1 hour ago" },
        { id: "PAY-992", amount: "₹12,000", name: "Amit Patel", status: "pending", time: "Yesterday" },
        { id: "PAY-993", amount: "₹7,200", name: "Sneha Reddy", status: "overdue", time: "3 days ago" }
    ];

    const getStatusStyle = (status: string) => {
        if (status === "resolved" || status === "paid") return { color: "var(--green)", bg: "rgba(52, 211, 153, 0.1)" };
        if (status === "pending" || status === "in_progress") return { color: "var(--yellow)", bg: "rgba(251, 191, 36, 0.1)" };
        return { color: "var(--red)", bg: "rgba(239, 68, 68, 0.1)" };
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: "40px" }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                style={{ marginBottom: "32px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}
            >
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #00d4ff, #0066cc)", display: "flex", alignItems: "center", justifyContent: "center", color: "#000" }}>
                            <ClipboardList size={18} />
                        </div>
                        <h1 className="display-text" style={{ fontSize: "28px", margin: 0 }}>Operations Center</h1>
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "600px", marginTop: "8px" }}>
                        Command center for daily tasks. Manage requests, monitor real-time payments, and handle move-ins and move-outs efficiently.
                    </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <Link href="/owner/requests" className="btn-primary" style={{ fontSize: "13px", padding: "8px 16px", borderRadius: "8px" }}>New Task</Link>
                </div>
            </motion.div>

            {/* Quick Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
                <div style={{ padding: "16px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ padding: "12px", background: "rgba(0,212,255,0.1)", color: "#00d4ff", borderRadius: "12px" }}><ClipboardList size={22} /></div>
                    <div>
                        <div style={{ fontSize: "24px", fontWeight: 800 }}>12</div>
                        <div style={{ fontSize: "12px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Open Requests</div>
                    </div>
                </div>
                <div style={{ padding: "16px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ padding: "12px", background: "rgba(52,211,153,0.1)", color: "var(--green)", borderRadius: "12px" }}><Users size={22} /></div>
                    <div>
                        <div style={{ fontSize: "24px", fontWeight: 800 }}>3</div>
                        <div style={{ fontSize: "12px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Move-ins Today</div>
                    </div>
                </div>
                <div style={{ padding: "16px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ padding: "12px", background: "rgba(167,139,250,0.1)", color: "#a78bfa", borderRadius: "12px" }}><BedDouble size={22} /></div>
                    <div>
                        <div style={{ fontSize: "24px", fontWeight: 800 }}>8</div>
                        <div style={{ fontSize: "12px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Rooms to Clean</div>
                    </div>
                </div>
                <div style={{ padding: "16px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ padding: "12px", background: "rgba(239,68,68,0.1)", color: "var(--red)", borderRadius: "12px" }}><CreditCard size={22} /></div>
                    <div>
                        <div style={{ fontSize: "24px", fontWeight: 800 }}>{stats?.overduePayments || 0}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Overdue Payments</div>
                    </div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>
                {/* Left: Operational Queues */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                    {/* Maintenance Queue */}
                    <div className="glass-card" style={{ padding: "24px", borderRadius: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                                <ClipboardList size={18} color="var(--accent-primary)" /> Action Required: Maintenance
                            </h3>
                            <Link href="/owner/requests" style={{ fontSize: "12px", color: "var(--accent-primary)", textDecoration: "none" }}>View All</Link>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {recentRequests.map(req => {
                                const style = getStatusStyle(req.status);
                                return (
                                    <div key={req.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }}>
                                        <div>
                                            <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>{req.title} <span style={{ color: "var(--text-tertiary)", fontWeight: 400, marginLeft: "8px", fontSize: "13px" }}>#{req.id}</span></div>
                                            <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "12px" }}>
                                                <span>Room: {req.room}</span>
                                                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={12} /> {req.time}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                            <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", color: style.color, background: style.bg }}>
                                                {req.status.replace("_", " ")}
                                            </span>
                                            <Link href={`/owner/requests`} style={{ color: "var(--text-secondary)" }}>
                                                <ChevronRight size={18} />
                                            </Link>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Payments Queue */}
                    <div className="glass-card" style={{ padding: "24px", borderRadius: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                                <CreditCard size={18} color="#a78bfa" /> Recent Transactions
                            </h3>
                            <Link href="/owner/payments" style={{ fontSize: "12px", color: "var(--accent-primary)", textDecoration: "none" }}>View Ledger</Link>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {recentPayments.map(pay => {
                                const style = getStatusStyle(pay.status);
                                return (
                                    <div key={pay.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)" }}>
                                                {pay.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "2px" }}>{pay.name}</div>
                                                <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{pay.time} · #{pay.id}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                                            <div style={{ textAlign: "right" }}>
                                                <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{pay.amount}</div>
                                                <span style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", color: style.color }}>
                                                    {pay.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Resident Activity Feed */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div className="glass-card" style={{ padding: "24px", borderRadius: "20px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>Live Activity Log</h3>
                            <Link href="/owner/activity" style={{ fontSize: "12px", color: "var(--text-tertiary)", textDecoration: "none" }}>History</Link>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div style={{ display: "flex", gap: "12px", fontSize: "13px" }}>
                                <div style={{ color: "var(--green)", marginTop: "2px" }}><CheckCircle2 size={14} /></div>
                                <div><span style={{ color: "#fff" }}>Vikash Singh</span> checked into Room 201. Document verification complete.</div>
                            </div>
                            <div style={{ display: "flex", gap: "12px", fontSize: "13px" }}>
                                <div style={{ color: "var(--accent-primary)", marginTop: "2px" }}><CreditCard size={14} /></div>
                                <div><span style={{ color: "#fff" }}>Meera Reddy</span> paid ₹12,500 via UPI. Receipt generated.</div>
                            </div>
                            <div style={{ display: "flex", gap: "12px", fontSize: "13px" }}>
                                <div style={{ color: "var(--yellow)", marginTop: "2px" }}><AlertTriangle size={14} /></div>
                                <div><span style={{ color: "#fff" }}>System:</span> 4 rent invoices failed to send due to missing resident emails.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
