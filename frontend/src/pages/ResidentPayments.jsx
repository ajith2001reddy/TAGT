import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import AppLayout from "../components/AppLayout";
import api from "../api/axios";

/**
 * RESIDENT PAYMENTS
 * - View bills sent by admin
 * - See paid / unpaid status
 */

export default function ResidentPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    // ================= FETCH =================
    const fetchPayments = async () => {
        try {
            setLoading(true);
            const res = await api.get("/payments/my");
            setPayments(Array.isArray(res.data) ? res.data : []);
        } catch {
            toast.error("Failed to load payments");
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const StatusBadge = ({ status }) => (
        <span
            className={`px-2 py-1 rounded text-xs font-semibold capitalize ${status === "paid"
                    ? "bg-green-600/20 text-green-400"
                    : "bg-red-600/20 text-red-400"
                }`}
        >
            {status}
        </span>
    );

    return (
        <AppLayout>
            <div className="space-y-6">
                <h2 className="text-2xl font-bold">My Payments</h2>

                {loading ? (
                    <p className="text-center text-gray-400">
                        Loading payments…
                    </p>
                ) : payments.length === 0 ? (
                    <div className="flex items-center justify-center min-h-[200px] text-gray-400">
                        No payments assigned to you yet.
                    </div>
                ) : (
                    <>
                        {/* MOBILE */}
                        <div className="space-y-4 sm:hidden">
                            {payments.map((p) => (
                                <div
                                    key={p._id}
                                    className="bg-white/10 border border-white/10 rounded-xl p-4"
                                >
                                    <div className="flex justify-between mb-2">
                                        <p className="font-semibold">
                                            ₹{Number(p.amount).toLocaleString()}
                                        </p>
                                        <StatusBadge status={p.status} />
                                    </div>

                                    <p className="text-xs text-gray-400">
                                        {p.createdAt
                                            ? new Date(p.createdAt).toLocaleDateString()
                                            : "—"}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* DESKTOP */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-sm border border-white/10 rounded-lg">
                                <thead className="bg-white/10">
                                    <tr>
                                        <th className="p-3 text-right">Amount</th>
                                        <th className="p-3 text-center">Status</th>
                                        <th className="p-3 text-center">Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((p) => (
                                        <tr
                                            key={p._id}
                                            className="border-t border-white/10 hover:bg-white/5"
                                        >
                                            <td className="p-3 text-right font-semibold">
                                                ₹{Number(p.amount).toLocaleString()}
                                            </td>
                                            <td className="p-3 text-center">
                                                <StatusBadge status={p.status} />
                                            </td>
                                            <td className="p-3 text-center text-gray-400 text-sm">
                                                {p.createdAt
                                                    ? new Date(p.createdAt).toLocaleDateString()
                                                    : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
