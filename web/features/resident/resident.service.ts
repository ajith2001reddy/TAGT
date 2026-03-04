import { api } from "@/lib/api";

export type ResidentPayment = {
    _id: string;
    amount: number;
    status: string;
    month: string;
};

export type ResidentRequest = {
    _id: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
};

export async function fetchResidentPayments(): Promise<ResidentPayment[]> {
    const { data } = await api.get("/resident/payments");
    return data.payments || data.data || [];
}

export async function fetchResidentRequests(): Promise<ResidentRequest[]> {
    const { data } = await api.get("/resident/requests");
    return data.requests || data.data || [];
}