import { api } from "@/lib/api";

export interface BillingInfo {
    currentPlan: string;
    usage: {
        residents: number;
        residentsLimit: number;
        rooms: number;
        roomsLimit: number;
    };
    nextBillingDate: string | null;
    invoices: Array<{
        _id: string;
        date: string;
        amount: number;
        status: string;
        url: string;
    }>;
}

export async function fetchBillingInfo(): Promise<BillingInfo | null> {
    try {
        const { data } = await api.get("/v2/admin/subscriptions"); // Based on logs
        return data.data ?? null;
    } catch {
        return null;
    }
}
