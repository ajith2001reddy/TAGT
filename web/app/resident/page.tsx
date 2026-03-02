"use client";

import { useResidentDashboard } from "@/features/resident/useResidentDashboard";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function ResidentPage() {
    const { payments, requests, loading } = useResidentDashboard();

    if (loading) return <p>Loading dashboard...</p>;

    return (
        <div className="space-y-10">
            <h1 className="text-2xl font-bold">Resident Dashboard</h1>

            {/* Payments */}
            <section>
                <h2 className="text-lg font-semibold mb-4">My Payments</h2>
                <div className="space-y-3">
                    {payments.map((payment) => (
                        <div
                            key={payment._id}
                            className="flex justify-between bg-neutral-900 p-4 rounded border border-white/10"
                        >
                            <div>
                                <p className="font-semibold">₹{payment.amount}</p>
                                <p className="text-sm text-white/50">{payment.month}</p>
                            </div>
                            <StatusBadge status={payment.status} />
                        </div>
                    ))}
                </div>
            </section>

            {/* Requests */}
            <section>
                <h2 className="text-lg font-semibold mb-4">My Requests</h2>
                <div className="space-y-3">
                    {requests.map((req) => (
                        <div
                            key={req._id}
                            className="bg-neutral-900 p-4 rounded border border-white/10"
                        >
                            <p className="font-semibold">{req.title}</p>
                            <p className="text-sm text-white/50">{req.description}</p>
                            <div className="mt-2">
                                <StatusBadge status={req.status} />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}