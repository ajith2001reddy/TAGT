import { useEffect, useState } from "react";
import { fetchOwnerStats, OwnerStats } from "./owner.service";
import { useProperty } from "@/context/PropertyContext";

export function useAnalytics() {
    const { property } = useProperty();
    const [data, setData] = useState<OwnerStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.resolve().then(() => {
            setLoading(true);
            fetchOwnerStats(property?._id ?? null)
                .then(setData)
                .finally(() => setLoading(false));
        });
    }, [property?._id]);

    return { data, loading };
}