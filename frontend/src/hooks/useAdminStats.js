import { useEffect, useState } from "react";
import { getAdminStats } from "../services/adminService";
import toast from "react-hot-toast";

/**
 * Admin Dashboard Stats Hook (FIXED)
 * - Always returns full stats shape
 * - Prevents undefined dashboard values
 * - Safe against backend inconsistencies
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
                    totalResidents: Number(data?.totalResidents) || 0,
                    pendingRequests: Number(data?.pendingRequests) || 0,
                    unpaidPayments: Number(data?.unpaidPayments) || 0,
                    totalRevenue: Number(data?.totalRevenue) || 0,
                    outstandingBalance: Number(data?.outstandingBalance) || 0
                });
            } catch (err) {
                console.error(err);
                toast.error("Failed to load dashboard stats");

                // fallback is already safe
                setStats((prev) => prev);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return { stats, loading };
}
