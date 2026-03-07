import { useState, useEffect, useCallback } from "react";
import { Bed, fetchBeds } from "./rooms.service";

export function useBeds(roomId?: string) {
    const [beds, setBeds] = useState<Bed[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        if (!roomId) return;
        setLoading(true);
        try {
            const data = await fetchBeds({ roomId });
            setBeds(data);
        } catch (err: unknown) {
            setError((err as Error).message || "Failed to load beds");
        } finally {
            setLoading(false);
        }
    }, [roomId]);

    useEffect(() => {
        load();
    }, [load]);

    return { beds, loading, error, reload: load };
}
