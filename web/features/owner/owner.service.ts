import { api } from "@/lib/api";

export type OwnerStats = {
    totalResidents: number;
    totalRooms: number;
    occupancyRate: number;
    pendingPayments: number;
    overduePayments: number;
    monthlyRevenue: number;
    insights?: Array<{
        type: string;
        severity: string;
        message: string;
        recommendation: string;
    }>;
};

export type DetailedStats = {
    occupancyRate: number;
    totalBeds: number;
    occupiedBeds: number;
    monthly: { expected: number; collected: number; outstanding: number };
    lateFeesEarned: number;
    overdueAmount: number;
    overdueCount: number;
    collectionRate: number;
    trend: Array<{ month: string; collected: number }>;
};

export async function fetchOwnerStats(propertyId: string | null): Promise<OwnerStats | null> {
    try {
        const { data } = await api.get("/v2/analytics/owner-dashboard", { params: { propertyId } });
        return data.data ?? null;
    } catch {
        return null;
    }
}

export async function fetchDetailedStats(propertyId: string | null): Promise<DetailedStats | null> {
    try {
        const { data } = await api.get("/v2/analytics/financial-dashboard", { params: { propertyId } });
        return data.data ?? null;
    } catch {
        return null;
    }
}