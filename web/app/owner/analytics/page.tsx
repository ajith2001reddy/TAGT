"use client";

import { useAnalytics } from "@/features/owner/useAnalytics";
import { StatCard } from "@/components/ui/StatCard";
import { BarChartCard } from "@/components/ui/BarChartCard";

export default function OwnerAnalyticsPage() {
    const { data, loading } = useAnalytics();

    if (loading) {
        return (
            <div>
                <div className="skeleton" style={{ height: "32px", width: "180px", marginBottom: "28px" }} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: "110px", borderRadius: "16px" }} />
                    ))}
                </div>
                <div className="skeleton" style={{ height: "300px", borderRadius: "16px" }} />
            </div>
        );
    }

    if (!data) return <p style={{ color: "var(--text-secondary)" }}>No analytics data available.</p>;

    const chartData = [
        { name: "Occupied", value: data.occupancy.occupiedBeds },
        { name: "Available", value: Math.max(0, data.occupancy.totalBeds - data.occupancy.occupiedBeds) },
    ];

    const paymentChart = [
        { name: "Collected", value: data.payments.totalCollected },
        { name: "Outstanding", value: Math.max(0, data.payments.totalBilled - data.payments.totalCollected) },
    ];

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "28px" }}>
                <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "6px" }}>Analytics</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Real-time property intelligence</p>
            </div>

            {/* KPI row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" }}>
                <StatCard
                    label="Occupancy Rate"
                    value={`${data.occupancy.rate}%`}
                    accent="var(--accent-primary)"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>}
                />
                <StatCard
                    label="Collection Rate"
                    value={`${data.payments.collectionRate}%`}
                    accent="var(--green)"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                />
                <StatCard
                    label="Avg Resolution"
                    value={`${data.maintenance.avgResolutionTime}h`}
                    accent="#7c3aed"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
                />
                <StatCard
                    label="Total Collected"
                    value={`₹${(data.payments.totalCollected / 1000).toFixed(1)}k`}
                    accent="var(--yellow)"
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--yellow)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
                />
            </div>

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <BarChartCard title="Bed Occupancy" data={chartData} dataKey="value" />
                <BarChartCard title="Payment Collection" data={paymentChart} dataKey="value" />
            </div>

            {/* Beds info */}
            <div className="glass-card" style={{ padding: "24px", marginTop: "16px" }}>
                <div className="label-text" style={{ marginBottom: "16px" }}>BED BREAKDOWN</div>
                <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
                    {[
                        { label: "Total Beds", value: data.occupancy.totalBeds, color: "var(--text-primary)" },
                        { label: "Occupied", value: data.occupancy.occupiedBeds, color: "var(--accent-primary)" },
                        { label: "Available", value: Math.max(0, data.occupancy.totalBeds - data.occupancy.occupiedBeds), color: "var(--green)" },
                        { label: "Requests Resolved", value: data.maintenance.resolvedCount, color: "#7c3aed" },
                    ].map(item => (
                        <div key={item.label}>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, color: item.color, letterSpacing: "-0.03em" }}>
                                {item.value}
                            </div>
                            <div className="label-text" style={{ marginTop: "4px" }}>{item.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}