import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/axios";

/**
 * ResidentPayments (DARK THEME FIXED)
 *
 * - Resident sees ONLY their own payments
 * - Read-only
 * - Fully visible on dark dashboard
 */

export default function ResidentPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    /* ================= FETCH RESIDENT PAYMENTS ================= */
    const fetchPayments = async () => {
        try {
            setLoading(true);
            const res = await api.get("/payments/my");
            setPayments(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load payments");
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    return (
        <DashboardLayout>
            <h2 className="text-2xl font-bold mb-6">
                My Payments
            </h2>

            {/* CONTENT */}
            {loading ? (
                <p className="text-center text-gray-400">
                    Loading payments…
                </p>
            ) : payments.length === 0 ? (
                <div className="flex items-center justify-center min-h-[200px] text-gray-400">
                    No payments assigned to you yet.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-gray-200 border border-white/10 rounded-lg">
                        <thead className="bg-white/10">
                            <tr>
                                <th className="p-3 text-right">Amount</th>
                                <th className="p-3 text-left">Description</th>
                                <th className="p-3 text-center">Status</th>
                                <th className="p-3 text-center">Created</th>
                            </tr>
                        </thead>

                        <tbody>
                            {payments.map((p) => (
                                <tr
                                    key={p._id}
                                    className="border-t border-white/10 hover:bg-white/5 transition"
                                >
                                    <td className="p-3 text-right font-semibold">
                                        ${p.amount.toLocaleString()}
                                    </td>

                                    <td className="p-3">
                                        {p.description || "—"}
                                    </td>

                                    <td
                                        className={`p-3 text-center capitalize font-semibold ${p.status === "paid"
                                                ? "text-green-400"
                                                : "text-red-400"
                                            }`}
                                    >
                                        {p.status}
                                    </td>

                                    <td className="p-3 text-center text-gray-400 text-sm">
                                        {new Date(
                                            p.createdAt
                                        ).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardLayout>
    );
}
