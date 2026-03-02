import { useEffect, useState } from "react";
import { fetchOwnerStats, OwnerStats } from "./owner.service";
import { useProperty } from "@/context/PropertyContext";

export function useOwnerStats() {
    const [stats, setStats] = useState<OwnerStats | null>(null);
    const [loading, setLoading] = useState(true);
    const { selectedProperty } = useProperty();

    useEffect(() => {
        fetchOwnerStats(selectedProperty).then(setStats);
    }, [selectedProperty]);

    return { stats, loading };
}