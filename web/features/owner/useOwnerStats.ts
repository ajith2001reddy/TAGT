import { useEffect, useState } from "react";
import { fetchOwnerStats, fetchDetailedStats, OwnerStats, DetailedStats } from "./owner.service";
import { useProperty } from "@/context/PropertyContext";

export function useOwnerStats() {
    const [stats, setStats] = useState<OwnerStats | null>(null);
    const [detailed, setDetailed] = useState<DetailedStats | null>(null);
    const [loading, setLoading] = useState(true);
    const { property } = useProperty();

    useEffect(() => {
        setLoading(true);
        const pId = property?._id || null;

        Promise.all([
            fetchOwnerStats(pId),
            fetchDetailedStats(pId)
        ]).then(([s, d]) => {
            setStats(s);
            setDetailed(d);
        }).finally(() => setLoading(false));
    }, [property?._id]);

    return { stats, detailed, loading };
}