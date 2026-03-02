import api from "@/lib/api";

export type KPIResponse = {
    occupancy: {
        rate: number;
        occupiedBeds: number;
        totalBeds: number;
    };
    payments: {
        collectionRate: number;
        totalBilled: number;
        totalCollected: number;
    };
    maintenance: {
        avgResolutionTime: number;
        resolvedCount: number;
    };
};

export async function fetchKPIs(): Promise<KPIResponse> {
    const { data } = await api.get("/analytics/kpis");
    return data.data;
}