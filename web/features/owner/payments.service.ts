import { api } from "@/lib/api";

export interface Payment {
    _id: string;
    amount: number;
    status: "pending" | "paid" | "overdue";
    type: string;
    month: string;
    dueDate: string;
    resident: {
        name: string;
        email: string;
    };
}

export async function fetchPayments(): Promise<Payment[]> {
    const res = await api.get("/v2/payments");

    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.data)) return res.data.data;

    return [];
}

export async function markPaymentPaid(id: string) {
    return api.patch(`/v2/payments/${id}/paid`, { method: "cash" });
}