import { useEffect, useState } from "react";
import { getAdminStats } from "../services/adminService";
import toast from "react-hot-toast";

export default function useAdminStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getAdminStats();
                setStats(data);
            } catch {
                toast.error("Failed to load dashboard stats");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return {
        stats: stats || {
            totalResidents: 0,
            pendingRequests: 0,
            unpaidPayments: 0
        },
        loading
    };
}
