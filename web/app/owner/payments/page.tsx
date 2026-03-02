"use client";

import { usePayments } from "@/features/owner/usePayments";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function PaymentsPage() {
    const { payments, loading } = usePayments();

    if (loading) return <p>Loading payments...</p>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Payments</h1>

            <div className="space-y-3">
                {payments.map((payment) => (
                    <div
                        key={payment._id}
                        className="flex justify-between items-center bg-neutral-900 p-4 rounded border border-white/10"
                    >
                        <div>
                            <p className="font-semibold">
                                {payment.resident?.name || "Resident"}
                            </p>
                            <p className="text-sm text-white/50">
                                {payment.month} • ₹{payment.amount}
                            </p>
                        </div>

                        <StatusBadge status={payment.status} />
                    </div>
                ))}
            </div>
        </div>
    );
}