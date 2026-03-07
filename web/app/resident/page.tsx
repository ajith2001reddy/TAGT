"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface DashboardData {
    profile: {
        name: string;
        email: string;
        propertyId?: {
            name: string;
            address: string;
            city: string;
            phone: string;
            heroImage?: string;
            images?: string[];
        };
    };
    room: {
        roomNumber: string;
        rent: number;
        totalBeds: number;
        occupiedBeds: number;
    } | null;
    currentPayment: {
        _id: string;
        amount: number;
        status: string;
        dueDate: string;
        lateFee?: number;
        totalPayable?: number;
        month: string;
    } | null;
    daysUntilDue: number | null;
    isOverdue: boolean;
    totalPaid: number;
    totalLateFeePaid: number;
    paymentHistory: {
        _id: string;
        month: string;
        amount: number;
        status: string;
        lateFee?: number;
        paidAt?: string;
    }[];
    notifications: {
        type: "danger" | "warning" | "success";
        message: string;
    }[];
}

const STATUS_COLOR: Record<string, { main: string; bg: string; border: string }> = {
    paid: { main: "#34d399", bg: "rgba(52, 211, 153, 0.1)", border: "rgba(52, 211, 153, 0.2)" },
    pending: { main: "#fbbf24", bg: "rgba(251, 191, 36, 0.1)", border: "rgba(251, 191, 36, 0.2)" },
    overdue: { main: "#ff5252", bg: "rgba(255, 82, 82, 0.1)", border: "rgba(255, 82, 82, 0.2)" },
    failed: { main: "#ff1744", bg: "rgba(255, 23, 68, 0.1)", border: "rgba(255, 23, 68, 0.2)" },
};

export default function ResidentDashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await api.get("/v2/resident/dashboard/v2");
            setData(res.data.data);
        } catch (err) {
            console.error("Dashboard load error", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePayRent = async () => {
        if (!data?.currentPayment) return;
        setPaying(true);
        try {
            const res = await api.post("/v2/stripe/checkout-session", {
                paymentId: data.currentPayment._id
            });
            if (res.data?.url) {
                window.location.href = res.data.url;
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Stripe payment failed");
        } finally {
            setPaying(false);
        }
    };

    if (loading) return (
        <div style={{ padding: "32px", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="skeleton" style={{ height: "160px", borderRadius: "24px" }} />
                ))}
            </div>
            <div className="skeleton" style={{ height: "400px", borderRadius: "24px", marginTop: "40px" }} />
        </div>
    );

    if (!data?.profile?.propertyId) return (
        <div style={{ height: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "24px", textAlign: "center", animation: "fadeIn 0.8s ease-out" }}>
            <div style={{ fontSize: "80px", marginBottom: "16px" }}>🏘️</div>
            <h2 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-0.02em" }}>Welcome to TAGT</h2>
            <p style={{ color: "var(--text-tertiary)", fontSize: "18px", maxWidth: "450px", lineHeight: 1.6 }}>
                You haven't joined a property yet. Discover premium PG accommodations and send a join request.
            </p>
            <Link href="/resident/discover" style={{
                background: "var(--accent-primary)",
                color: "white",
                textDecoration: "none",
                padding: "16px 40px",
                borderRadius: "20px",
                fontSize: "16px",
                fontWeight: 700,
                boxShadow: "0 20px 40px rgba(0, 212, 255, 0.2)",
                transition: "transform 0.3s"
            }} onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")} onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}>
                Find My Property →
            </Link>
        </div>
    );

    const firstName = data.profile.name.split(" ")[0];
    const property = data.profile.propertyId;

    return (
        <div style={{ padding: "32px", maxWidth: "1280px", margin: "0 auto", animation: "fadeIn 0.6s ease-out" }}>

            {/* Premium Hero Section */}
            <div style={{
                position: "relative",
                borderRadius: "32px",
                overflow: "hidden",
                marginBottom: "40px",
                minHeight: "320px",
                display: "flex",
                alignItems: "flex-end",
                padding: "48px",
                background: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.95)), url(${property?.heroImage || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80"})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
                border: "1px solid var(--border-default)"
            }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100%", background: "linear-gradient(45deg, rgba(0,212,255,0.1), transparent)", pointerEvents: "none" }} />

                <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px" }}>
                    <div>
                        <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            background: "rgba(255,255,255,0.1)",
                            backdropFilter: "blur(8px)",
                            padding: "6px 16px",
                            borderRadius: "100px",
                            marginBottom: "16px",
                            border: "1px solid rgba(255,255,255,0.1)"
                        }}>
                            <span style={{ fontSize: "14px" }}>🏢</span>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>{property?.name || "TAGT Living"}</span>
                        </div>

                        <h1 style={{
                            fontSize: "48px",
                            fontFamily: "var(--font-display)",
                            fontWeight: 800,
                            letterSpacing: "-0.04em",
                            lineHeight: 1.1,
                            margin: 0,
                            color: "#fff",
                            textShadow: "0 2px 20px rgba(0,0,0,0.4)"
                        }}>
                            Welcome home, <br />
                            <span style={{
                                background: "linear-gradient(to right, #00d4ff, #a78bfa)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                filter: "drop-shadow(0 0 10px rgba(0,212,255,0.3))"
                            }}>{firstName}</span>
                        </h1>

                        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "24px", color: "rgba(255,255,255,0.7)", fontSize: "15px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span>📍</span> {property?.address || "Loading location..."}
                            </div>
                            <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} />
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span>📅</span> {new Date().toLocaleDateString("en-IN", { month: "long", day: "numeric" })}
                            </div>
                        </div>
                    </div>

                    <div style={{
                        background: "rgba(0,0,0,0.2)",
                        backdropFilter: "blur(20px)",
                        padding: "24px",
                        borderRadius: "24px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        minWidth: "200px"
                    }}>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Quick Status</div>
                        <div style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
                            {data.isOverdue ? "Action Required" : "All Clear"}
                        </div>
                        <div style={{ fontSize: "13px", color: data.isOverdue ? "#ff5252" : "#34d399", fontWeight: 600 }}>
                            {data.isOverdue ? "Rent is overdue" : "Payments up to date"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications Bar */}
            {(data.notifications || []).length > 0 && (
                <div style={{ marginBottom: "32px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {data.notifications.map((n, i) => {
                        const styleMap: Record<string, { bg: string, border: string, color: string, icon: string }> = {
                            danger: { bg: "rgba(255, 82, 82, 0.1)", border: "rgba(255, 82, 82, 0.2)", color: "#ff5252", icon: "🚨" },
                            warning: { bg: "rgba(251, 191, 36, 0.1)", border: "rgba(251, 191, 36, 0.2)", color: "#fbbf24", icon: "⚠️" },
                            success: { bg: "rgba(52, 211, 153, 0.1)", border: "rgba(52, 211, 153, 0.2)", color: "#34d399", icon: "✅" },
                            info: { bg: "rgba(0, 212, 255, 0.1)", border: "rgba(0, 212, 255, 0.2)", color: "var(--accent-primary)", icon: "ℹ️" },
                        };
                        const config = styleMap[n.type] || styleMap.info;
                        return (
                            <div key={i} style={{
                                background: config.bg,
                                border: `1px solid ${config.border}`,
                                padding: "16px 24px",
                                borderRadius: "16px",
                                color: config.color,
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                fontSize: "14px",
                                fontWeight: 500
                            }}>
                                <span style={{ fontSize: "18px" }}>{config.icon}</span>
                                {n.message}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Responsive Grid Layout */}
            <div className="dashboard-grid">

                {/* 1. Payment Card - Large */}
                <div className="card-large" style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "32px",
                    padding: "32px",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "40%", height: "80%", background: "var(--accent-primary)", filter: "blur(120px)", opacity: 0.1, borderRadius: "50%" }} />

                    <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "8px" }}>Current Balance</div>
                            <div style={{ fontSize: "48px", fontWeight: 800, letterSpacing: "-0.04em" }}>
                                ₹{(data.currentPayment?.totalPayable || data.currentPayment?.amount || 0).toLocaleString()}
                            </div>
                            <div style={{ marginTop: "8px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{
                                    padding: "4px 12px", borderRadius: "100px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                                    background: STATUS_COLOR[data.currentPayment?.status || "pending"].bg,
                                    color: STATUS_COLOR[data.currentPayment?.status || "pending"].main,
                                    border: `1px solid ${STATUS_COLOR[data.currentPayment?.status || "pending"].border}`
                                }}>
                                    {data.currentPayment?.status || "No Dues"}
                                </span>
                                {data.currentPayment?.month && <span style={{ color: "var(--text-tertiary)" }}>for {data.currentPayment.month}</span>}
                            </div>
                        </div>

                        {data.currentPayment?.status !== "paid" && (
                            <button
                                onClick={handlePayRent}
                                disabled={paying}
                                style={{
                                    background: "var(--accent-primary)",
                                    color: "#000",
                                    border: "none",
                                    padding: "16px 32px",
                                    borderRadius: "16px",
                                    fontWeight: 700,
                                    fontSize: "15px",
                                    cursor: "pointer",
                                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                    boxShadow: "0 8px 32px rgba(0, 212, 255, 0.25)"
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                                    e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 212, 255, 0.4)";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = "none";
                                    e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 212, 255, 0.25)";
                                }}
                            >
                                {paying ? "Redirecting..." : "Pay Now with Stripe"}
                            </button>
                        )}
                    </div>

                    <div className="stats-grid">
                        <div style={{ background: "rgba(0,0,0,0.05)", padding: "20px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
                            <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "4px" }}>Due Date</div>
                            <div style={{ fontSize: "18px", fontWeight: 600, color: data.isOverdue ? "#ff5252" : "var(--text-primary)" }}>
                                {data.currentPayment?.dueDate ? new Date(data.currentPayment.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long" }) : "N/A"}
                            </div>
                            <div style={{ fontSize: "12px", color: data.isOverdue ? "#ff5252" : "var(--green)", marginTop: "4px" }}>
                                {data.isOverdue ? "Overdue" : `Due in ${data.daysUntilDue} days`}
                            </div>
                        </div>
                        <div style={{ background: "rgba(0,0,0,0.05)", padding: "20px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
                            <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "4px" }}>Late Fee Potential</div>
                            <div style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)" }}>₹{(data.currentPayment?.lateFee || 500).toLocaleString()}</div>
                            <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px" }}>if paid after the 5th</div>
                        </div>
                    </div>
                </div>

                {/* 2. Room Card - Small */}
                <div className="card-small" style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "32px",
                    padding: "32px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                }}>
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                            <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Your Room</div>
                            <div style={{ padding: "6px 12px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", fontSize: "12px", fontWeight: 600 }}>#{data.room?.roomNumber || "000"}</div>
                        </div>
                        <div style={{ fontSize: "32px", fontWeight: 800, marginBottom: "8px" }}>₹{data.room?.rent.toLocaleString()}<span style={{ fontSize: "14px", color: "var(--text-tertiary)", fontWeight: 400 }}>/mo</span></div>
                        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Shared with {data.room ? (data.room.occupiedBeds - 1) : 0} others</p>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                        {Array.from({ length: data.room?.totalBeds || 2 }).map((_, i) => (
                            <div key={i} style={{
                                height: "6px",
                                flex: 1,
                                borderRadius: "4px",
                                background: i < (data.room?.occupiedBeds || 0) ? "var(--accent-primary)" : "rgba(255,255,255,0.1)"
                            }} />
                        ))}
                    </div>
                </div>

                {/* 3. Stats Row */}
                <div className="stat-card" style={{ background: "var(--bg-glass)", border: "1px solid var(--border-default)", borderRadius: "24px", padding: "24px" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "8px" }}>Total Rent Paid</div>
                    <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--green)" }}>₹{data.totalPaid.toLocaleString()}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px" }}>since you joined</div>
                </div>
                <div className="stat-card" style={{ background: "var(--bg-glass)", border: "1px solid var(--border-default)", borderRadius: "24px", padding: "24px" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "8px" }}>Late Fees Avoided</div>
                    <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--accent-primary)" }}>₹{(data.paymentHistory.length * 500 - data.totalLateFeePaid).toLocaleString()}</div>
                    <div style={{ fontSize: "12px", color: "var(--green)", marginTop: "4px" }}>Keep it up! ⚡</div>
                </div>
                <div className="stat-card-wide" style={{ background: "var(--bg-glass)", border: "1px solid var(--border-default)", borderRadius: "24px", padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                        <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "4px" }}>Need Help?</div>
                        <div style={{ fontSize: "16px", fontWeight: 600 }}>Create Support Request</div>
                    </div>
                    <Link href="/resident/requests" style={{
                        background: "var(--bg-elevated)",
                        color: "var(--text-primary)",
                        textDecoration: "none",
                        padding: "10px 20px",
                        borderRadius: "12px",
                        fontSize: "13px",
                        fontWeight: 600,
                        border: "1px solid var(--border-default)"
                    }}>New Request →</Link>
                </div>

                {/* 4. Payment History Table */}
                <div className="table-container" style={{ marginTop: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>Recent Payments</h3>
                        <Link href="/resident/payments" style={{ fontSize: "13px", color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>Full History →</Link>
                    </div>

                    <div style={{
                        background: "var(--bg-glass)",
                        border: "1px solid var(--border-default)",
                        borderRadius: "24px",
                        overflowX: "auto"
                    }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                            <thead style={{ background: "var(--bg-elevated)" }}>
                                <tr>
                                    {["Month", "Base Rent", "Late Fee", "Total Paid", "Status", "Date"].map(h => (
                                        <th key={h} style={{ padding: "16px 24px", textAlign: "left", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-tertiary)", fontWeight: 600 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.paymentHistory.slice(0, 5).map((p, i) => {
                                    const styles = STATUS_COLOR[p.status];
                                    return (
                                        <tr key={p._id} style={{ borderBottom: i === 4 ? "none" : "1px solid var(--border-subtle)" }}>
                                            <td style={{ padding: "20px 24px", fontWeight: 600 }}>{p.month}</td>
                                            <td style={{ padding: "20px 24px" }}>₹{p.amount.toLocaleString()}</td>
                                            <td style={{ padding: "20px 24px", color: p.lateFee ? "#ff5252" : "var(--text-tertiary)" }}>
                                                {p.lateFee ? `₹${p.lateFee.toLocaleString()}` : "—"}
                                            </td>
                                            <td style={{ padding: "20px 24px", fontWeight: 700 }}>₹{(p.amount + (p.lateFee || 0)).toLocaleString()}</td>
                                            <td style={{ padding: "20px 24px" }}>
                                                <span style={{
                                                    padding: "4px 10px",
                                                    borderRadius: "6px",
                                                    fontSize: "10px",
                                                    fontWeight: 700,
                                                    textTransform: "uppercase",
                                                    background: styles.bg,
                                                    color: styles.main,
                                                    border: `1px solid ${styles.border}`
                                                }}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: "20px 24px", fontSize: "13px", color: "var(--text-tertiary)" }}>
                                                {p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-IN") : "Pending"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                    gap: 24px;
                }
                
                .card-large { grid-column: span 7; }
                .card-small { grid-column: span 5; }
                .stat-card { grid-column: span 3; }
                .stat-card-wide { grid-column: span 6; }
                .table-container { grid-column: span 12; }
                .stats-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }

                @media (max-width: 1024px) {
                    .card-large, .card-small { grid-column: span 12; }
                    .stat-card { grid-column: span 6; }
                    .stat-card-wide { grid-column: span 12; }
                }

                @media (max-width: 768px) {
                    .dashboard-grid { display: flex; flex-direction: column; gap: 16px; }
                    .stats-grid { grid-template-columns: 1fr; gap: 16px; }
                    .stat-card, .stat-card-wide, .card-large, .card-small, .table-container { width: 100%; }
                }
            `}</style>
        </div>
    );
}