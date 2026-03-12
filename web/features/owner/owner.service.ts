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
    profitEstimate: number; // Added
    trend: Array<{ month: string; collected: number }>;
};

export type JoinRequest = {
    _id: string;
    residentId: {
        _id: string;
        name: string;
        email: string;
        phone: string;
        photo?: string;
    };
    propertyId: {
        _id: string;
        name: string;
        city: string;
    };
    message: string;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
};

export type IntelligenceSummary = {
    forecast: any;
    trends: any;
    alerts: any;
    churn: any;
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

export async function fetchIntelligenceSummary(): Promise<IntelligenceSummary | null> {
    try {
        const { data } = await api.get("/v2/intelligence/summary");
        return data.data ?? null;
    } catch {
        return null;
    }
}

export async function fetchJoinRequests(): Promise<JoinRequest[]> {
    try {
        const { data } = await api.get("/v2/requests/join");
        return data.data ?? [];
    } catch {
        return [];
    }
}

export async function approveJoinRequest(id: string): Promise<boolean> {
    try {
        await api.patch(`/v2/requests/join/${id}/approve`);
        return true;
    } catch {
        return false;
    }
}

export async function rejectJoinRequest(id: string): Promise<boolean> {
    try {
        await api.patch(`/v2/requests/join/${id}/reject`);
        return true;
    } catch {
        return false;
    }
}