import api from "@/lib/api";

export type Payment = {
    _id: string;
    amount: number;
    status: "pending" | "paid" | "overdue" | "failed";
    month: string;
    resident: {
        name: string;
        email: string;
    };
};

export async function fetchPayments(): Promise<Payment[]> {
    const { data } = await api.get("/payments"); // adjust if route differs
    return data.payments || data.data || [];
}