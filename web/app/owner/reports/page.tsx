"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { toast } from "react-hot-toast";

type ReportType = {
    id: string;
    title: string;
    desc: string;
    icon: string;
    color: string;
    endpoint: string;
    type: "csv" | "excel" | "pdf";
    hasMonthPicker?: boolean;
};

const reports: ReportType[] = [
    {
        id: "residents-excel",
        title: "Master Residents List",
        desc: "Complete resident directory with Aadhaar, Company, and Room details.",
        icon: "👥",
        color: "var(--accent-primary)",
        endpoint: "/v2/reports/export/residents",
        type: "excel",
    },
    {
        id: "rent-excel",
        title: "Detailed Rent Collection",
        desc: "Excel sheet with rent, late fees, and payment status for accounting.",
        icon: "📊",
        color: "#34d399",
        endpoint: "/v2/reports/export/payments",
        type: "excel",
        hasMonthPicker: true,
    },
    {
        id: "expenses-excel",
        title: "Expenses & Ration",
        desc: "Track money going out: Food, Electricity, and Maintenance costs.",
        icon: "📉",
        color: "#f43f5e",
        endpoint: "/v2/reports/export/expenses",
        type: "excel",
    },
    {
        id: "monthly-revenue",
        title: "Monthly Revenue (CSV)",
        desc: "Simple CSV dump of all paid rent for quick imports.",
        icon: "💰",
        color: "#10b981",
        endpoint: "/v2/reports/monthly-revenue.csv",
        type: "csv",
        hasMonthPicker: true,
    },
    {
        id: "outstanding",
        title: "Outstanding Payments",
        desc: "All pending and overdue bills with days overdue tracker.",
        icon: "⏳",
        color: "#f59e0b",
        endpoint: "/v2/reports/outstanding.csv",
        type: "csv",
    },
];

export default function ReportsPage() {
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [months, setMonths] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [stats, setStats] = useState<any>(null);
    const [occStats, setOccStats] = useState<any>(null);
    const [insights, setInsights] = useState<any>(null);
    const [fetching, setFetching] = useState(false);

    const fetchStats = async (month: string) => {
        try {
            setFetching(true);
            const [finRes, occRes, intRes] = await Promise.all([
                api.get(`/v2/reports/financial?month=${month}`),
                api.get("/v2/reports/occupancy"),
                api.get("/v2/intelligence/summary")
            ]);
            setStats(finRes.data.data);
            setOccStats(occRes.data.data);
            setInsights(intRes.data.data);
        } catch (e) {
            console.error("Failed to fetch report stats", e);
            toast.error("Failed to load dashboard statistics");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchStats(selectedMonth);
    }, [selectedMonth]);

    async function download(report: ReportType) {
        setLoading(l => ({ ...l, [report.id]: true }));
        try {
            const params = report.hasMonthPicker && months[report.id] ? `?month=${months[report.id]}` : "";
            const res = await api.get(`${report.endpoint}${params}`, { responseType: "blob" });
            
            const mimeType = report.type === "excel" 
                ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                : report.type === "pdf" ? "application/pdf" : "text/csv";
            
            const extension = report.type === "excel" ? "xlsx" : report.type === "pdf" ? "pdf" : "csv";

            const url = window.URL.createObjectURL(new Blob([res.data], { type: mimeType }));
            const a = document.createElement("a");
            a.href = url;
            a.download = `${report.id}-${months[report.id] || new Date().toISOString().slice(0, 10)}.${extension}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            toast.success(`${report.title} exported!`);
        } catch (e) {
            console.error("Download failed", e);
            toast.error("Export failed. Please try again.");
        } finally {
            setLoading(l => ({ ...l, [report.id]: false }));
        }
    }

    return (
        <div className="animate-fade-in p-6">
            <div style={{ marginBottom: "36px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Analytics & Exports</div>
                    <h1 className="display-text" style={{ fontSize: "30px", marginBottom: "4px" }}>Reports Dashboard</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Monitor your property's health and export records for accounting</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Selected Month</label>
                    <input 
                        type="month" 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="input-field"
                        style={{ padding: "8px 12px", width: "160px" }}
                    />
                </div>
            </div>

            {/* Top Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "40px" }}>
                <StatCard
                    label="Rental Income"
                    value={`₹${stats?.income?.rental?.toLocaleString() || "0"}`}
                    icon="🏠"
                    delta={fetching ? "Updating..." : `Total Income: ₹${stats?.income?.total?.toLocaleString() || "0"}`}
                    deltaType="up"
                />
                <StatCard
                    label="Current Occupancy"
                    value={`${occStats?.occupancyRate || "0"}%`}
                    icon="📊"
                    delta={`${occStats?.occupiedBeds || 0} / ${occStats?.totalBeds || 0} Beds occupied`}
                    deltaType={occStats?.occupancyRate > 70 ? "up" : "neutral"}
                />
                <StatCard
                    label="Total Expenses"
                    value={`₹${stats?.expenses?.total?.toLocaleString() || "0"}`}
                    icon="📉"
                    delta={`Fixed: ₹${stats?.expenses?.fixedTotal?.toLocaleString() || "0"}`}
                    deltaType="down"
                    accent="#f43f5e"
                />
                <StatCard
                    label="Estimated Profit"
                    value={`₹${stats?.profit?.toLocaleString() || "0"}`}
                    icon="💰"
                    delta={stats?.profit > 0 ? "Positive Cashflow" : "Loss / Pre-collection"}
                    deltaType={stats?.profit > 0 ? "up" : "down"}
                    accent={stats?.profit > 0 ? "var(--accent-primary)" : "#f43f5e"}
                />
            </div>

            {/* Income & Expense Detailed Table - Sync with Excel Screenshot */}
            <div className="animate-fade-up" style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "24px", marginBottom: "40px" }}>
                {/* Income breakdown */}
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "18px", padding: "24px" }}>
                    <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px", fontFamily: "var(--font-display)", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "#10b981" }}>●</span> Income Breakdown
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <DetailRow label="Rental Income" value={stats?.income?.rental} />
                        <DetailRow label="Daily Basis" value={stats?.income?.daily_basis} />
                        <DetailRow label="Security Deposits" value={stats?.income?.deposit} />
                        <DetailRow label="Food Collection" value={stats?.income?.food_collection} />
                        <div style={{ height: "1px", background: "var(--border-default)", margin: "8px 0" }} />
                        <DetailRow label="Total Revenue" value={stats?.income?.total} isBold color="#10b981" />
                    </div>
                </div>

                {/* Expense breakdown */}
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "18px", padding: "24px" }}>
                    <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px", fontFamily: "var(--font-display)", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "#f43f5e" }}>●</span> Expense Breakdown
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
                        <div>
                            <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "0.05em" }}>Fixed Expenses</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <DetailRow label="Salaries" value={stats?.expenses?.salaries} />
                                <DetailRow label="PG Rent" value={stats?.expenses?.pg_rent} />
                                <DetailRow label="WiFi" value={stats?.expenses?.wifi} />
                                <DetailRow label="Others" value={stats?.expenses?.others} />
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "0.05em" }}>Variable Expenses</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <DetailRow label="Ration" value={stats?.expenses?.ration} />
                                <DetailRow label="Vegetables" value={stats?.expenses?.vegetables} />
                                <DetailRow label="Dairy" value={stats?.expenses?.dairy} />
                                <DetailRow label="Electricity" value={stats?.expenses?.electricity} />
                                <DetailRow label="Water" value={stats?.expenses?.water} />
                                <DetailRow label="Maintenance" value={stats?.expenses?.maintenance} />
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border-default)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700 }}>Total Period Expenses</span>
                        <span style={{ fontSize: "18px", fontWeight: 800, color: "#f43f5e" }}>₹{stats?.expenses?.total?.toLocaleString() || "0"}</span>
                    </div>
                </div>
            </div>

            {/* AI Insights Section */}
            {insights?.alerts?.length > 0 && (
                <div className="animate-fade-up" style={{ marginBottom: "40px", padding: "24px", background: "rgba(0,212,255,0.03)", border: "1px solid rgba(0,212,255,0.1)", borderRadius: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                        <span style={{ fontSize: "20px" }}>✨</span>
                        <h2 style={{ fontSize: "18px", fontWeight: 700, fontFamily: "var(--font-display)" }}>Smart Insights & Alerts</h2>
                        <span style={{ fontSize: "9px", background: "var(--accent-primary)", color: "#000", padding: "2px 6px", borderRadius: "10px", fontWeight: 800 }}>AI POWERED</span>
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                        {insights.alerts.slice(0, 3).map((alert: any, idx: number) => (
                            <div key={idx} style={{ background: "var(--bg-card)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-default)", display: "flex", gap: "12px" }}>
                                <div style={{ fontSize: "16px", marginTop: "2px" }}>{alert.severity === 'high' ? '⚠️' : 'ℹ️'}</div>
                                <div>
                                    <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>{alert.title}</h4>
                                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.4 }}>{alert.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", fontFamily: "var(--font-display)" }}>Available Reports</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                {reports.map((report, i) => (
                    <div key={report.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
                        <div style={{
                            background: "var(--bg-card)", border: "1px solid var(--border-default)",
                            borderRadius: "18px", padding: "24px", position: "relative", overflow: "hidden",
                            transition: "all 0.25s ease",
                        }}
                            className="hover-card"
                        >
                            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${report.color}60, transparent)` }} />

                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                                <span style={{ fontSize: "28px" }}>{report.icon}</span>
                                <span style={{ 
                                    fontSize: "10px", 
                                    fontFamily: "var(--font-mono)", 
                                    background: `${report.color}15`, 
                                    color: report.color, 
                                    border: `1px solid ${report.color}30`, 
                                    padding: "3px 9px", 
                                    borderRadius: "6px", 
                                    letterSpacing: "0.08em",
                                    textTransform: "uppercase"
                                }}>
                                    {report.type}
                                </span>
                            </div>

                            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>{report.title}</h3>
                            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px", lineHeight: 1.5 }}>{report.desc}</p>

                            {report.hasMonthPicker && (
                                <div style={{ marginBottom: "14px" }}>
                                    <label style={{ display: "block", fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "6px" }}>Filter Month</label>
                                    <input
                                        type="month"
                                        className="input-field"
                                        style={{ padding: "9px 12px", fontSize: "13px" }}
                                        value={months[report.id] || ""}
                                        onChange={e => setMonths(m => ({ ...m, [report.id]: e.target.value }))}
                                    />
                                </div>
                            )}

                            <button
                                className="btn-primary"
                                style={{ width: "100%", gap: "8px", fontSize: "13px", background: report.type === 'excel' ? '#10b981' : undefined }}
                                onClick={() => download(report)}
                                disabled={loading[report.id]}
                            >
                                {loading[report.id] ? (
                                    <div className="spinner" style={{ width: "14px", height: "14px" }} />
                                ) : (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                )}
                                {loading[report.id] ? "Generating…" : `Export ${report.type.toUpperCase()}`}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .hover-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .hover-card:hover {
                    border-color: var(--border-strong) !important;
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-lg);
                }
                .spinner {
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

function DetailRow({ label, value, isBold = false, color }: { label: string; value?: number; isBold?: boolean; color?: string }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
            <span style={{ color: "var(--text-secondary)", fontWeight: isBold ? 700 : 400 }}>{label}</span>
            <span style={{ fontWeight: isBold ? 800 : 600, color: color || "var(--text-primary)" }}>
                ₹{value?.toLocaleString() || "0"}
            </span>
        </div>
    );
}
