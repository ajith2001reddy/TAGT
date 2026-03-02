import { useEffect, useState } from "react";
import { fetchKPIs, KPIResponse } from "./analytics.service";

export function useAnalytics() {
    const [data, setData] = useState<KPIResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchKPIs()
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    return { data, loading };
}