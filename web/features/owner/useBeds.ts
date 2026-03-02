import { useState, useEffect } from "react";
import { Bed, fetchBeds } from "./rooms.service";

export function useBeds(roomId?: string) {
    const [beds, setBeds] = useState<Bed[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function load() {
        if (!roomId) return;
        setLoading(true);
        try {
            const data = await fetchBeds({ roomId });
            setBeds(data);
        } catch (err: any) {
            setError(err.message || "Failed to load beds");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, [roomId]);

    return { beds, loading, error, reload: load };
}
