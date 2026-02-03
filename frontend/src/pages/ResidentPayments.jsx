import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import AppLayout from "../components/AppLayout";
import api from "../api/axios";

/**
 * RESIDENT PAYMENTS – MOBILE SAFE
 */

export default function ResidentPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    /* ================= FETCH RESIDENT PAYMENTS ================= */
    const fetchPayments = async () => {
        try {
            setLoading(true);

            const res = await api.get("/payments/my");

            const cleaned = (Array.isArray(res.data) ? res.data : []).map(
                (p) => ({
                    ...p,
                    amount: Number(p.amount),
                    status: String(p.status || "unpaid").toLowerCase()
                })
            );

            setPayments(cleaned);
        } catch (err) {
            console.error("RESIDENT PAYMENTS ERROR:", err);
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
                <h2 className="text-2xl font-bold">
                    My Payments
                </h2>

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
                        {/* ================= MOBILE VIEW ================= */}
                        <div className="space-y-4 sm:hidden">
                            {payments.map((p) => (
                                <div
                                    key={p._id}
                                    className="bg-white/10 border border-white/10 rounded-xl p-4"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-semibold">
                                            ${Number(p.amount).toLocaleString()}
                                        </p>
                                        <StatusBadge status={p.status} />
                                    </div>

                                    <p className="text-sm text-gray-300 mb-1">
                                        {p.description || "—"}
                                    </p>

                                    <p className="text-xs text-gray-400">
                                        {p.createdAt
                                            ? new Date(p.createdAt).toLocaleDateString()
                                            : "—"}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* ================= DESKTOP TABLE ================= */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-sm text-gray-200 border border-white/10 rounded-lg">
                                <thead className="bg-white/10">
                                    <tr>
                                        <th className="p-3 text-right">
                                            Amount
                                        </th>
                                        <th className="p-3 text-left">
                                            Description
                                        </th>
                                        <th className="p-3 text-center">
                                            Status
                                        </th>
                                        <th className="p-3 text-center">
                                            Created
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {payments.map((p) => (
                                        <tr
                                            key={p._id}
                                            className="border-t border-white/10 hover:bg-white/5 transition"
                                        >
                                            <td className="p-3 text-right font-semibold">
                                                ${Number(p.amount).toLocaleString()}
                                            </td>

                                            <td className="p-3">
                                                {p.description || "—"}
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
