import { useEffect, useState } from "react";
import { getAdminStats } from "../services/adminService";
import toast from "react-hot-toast";

/**
 * Admin Dashboard Stats Hook
 * - Returns full stats shape even if backend fails
 * - Ensures fallback data is safe (no undefined values)
 */

export default function useAdminStats() {
    const [stats, setStats] = useState({
        totalResidents: 0,
        pendingRequests: 0,
        unpaidPayments: 0,
        totalRevenue: 0,
        outstandingBalance: 0
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getAdminStats();

                setStats({
                    totalResidents: data?.totalResidents ?? 0,
                    pendingRequests: data?.pendingRequests ?? 0,
                    unpaidPayments: data?.unpaidPayments ?? 0,
                    totalRevenue: data?.totalRevenue ?? 0,
                    outstandingBalance: data?.outstandingBalance ?? 0
                });
            } catch (err) {
                console.error(err);
                toast.error("Failed to load dashboard stats");

                // Preserve previous data if fetching fails
                setStats((prev) => prev);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return { stats, loading };
}
