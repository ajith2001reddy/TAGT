"use client";

import { useOwnerStats } from "@/features/owner/useOwnerStats";
import { StatCard } from "@/components/ui/StatCard";

export default function OwnerPage() {
    const { stats, loading } = useOwnerStats();

    if (loading) return <p>Loading dashboard...</p>;
    if (!stats) return <p>Failed to load data.</p>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="Total Residents" value={stats.totalResidents} />
            <StatCard label="Total Rooms" value={stats.totalRooms} />
            <StatCard label="Occupancy Rate" value={`${stats.occupancyRate}%`} />
            <StatCard label="Pending Payments" value={stats.pendingPayments} />
            <StatCard label="Overdue Payments" value={stats.overduePayments} />
            <StatCard label="Monthly Revenue" value={`₹${stats.monthlyRevenue}`} />
        </div>
    );
}