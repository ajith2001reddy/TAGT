"use client";

import { useAnalytics } from "@/features/owner/useAnalytics";
import { StatCard } from "@/components/ui/StatCard";
import { BarChartCard } from "@/components/ui/BarChartCard";

export default function OwnerAnalyticsPage() {
    const { data, loading } = useAnalytics();

    if (loading) return <p>Loading analytics...</p>;
    if (!data) return <p>No analytics data.</p>;

    const chartData = [
        { name: "Occupied", value: data.occupancy.occupiedBeds },
        { name: "Available", value: data.occupancy.totalBeds - data.occupancy.occupiedBeds },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">Analytics</h1>

            <div className="grid md:grid-cols-3 gap-6">
                <StatCard label="Occupancy Rate" value={`${data.occupancy.rate}%`} />
                <StatCard label="Collection Rate" value={`${data.payments.collectionRate}%`} />
                <StatCard label="Avg Resolution (hrs)" value={data.maintenance.avgResolutionTime} />
            </div>

            <BarChartCard
                title="Occupancy Overview"
                data={chartData}
                dataKey="value"
            />
        </div>
    );
}