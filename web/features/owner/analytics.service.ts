import { api } from "@/lib/api";

export interface FinancialData {
    occupancyRate: number;
    totalBeds: number;
    occupiedBeds: number;
    monthly: { expected: number; collected: number; outstanding: number };
    lateFeesEarned: number;
    overdueAmount: number;
    overdueCount: number;
    profitEstimate: number;
    collectionRate: number;
    trend: { month: string; collected: number }[];
}

export interface LeakData {
    totalLeakEstimate: number;
    emptyBeds: { roomNumber: string; emptyBeds: number; costPerMonth: number }[];
    emptyBedCostTotal: number;
    chronicLatePayers: { name: string; email: string; lateCount: number }[];
    underpricedRooms: { roomNumber: string; currentRent: number; suggestedRent: number }[];
    avgRent: number;
}

export async function fetchFinancialDashboard(): Promise<FinancialData> {
    const { data } = await api.get("/v2/analytics/financial-dashboard");
    return data.data;
}

export async function fetchRevenueLeak(): Promise<LeakData> {
    const { data } = await api.get("/v2/analytics/revenue-leak");
    return data.data;
}