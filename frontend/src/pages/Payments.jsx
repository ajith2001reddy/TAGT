import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import AppLayout from "../components/AppLayout";
import Button from "../components/Button";
import api from "../api/axios";

/**
 * ADMIN PAYMENTS
 * - View all payments
 * - Mark payment as paid
 * - Delete payment
 */

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    const fetchPayments = async () => {
        try {
            setLoading(true);

            // ✅ correct parsing
            const res = await api.get("/payments");
            setPayments(res.data?.payments || []);
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

    const markAsPaid = async (id) => {
        if (!window.confirm("Mark this payment as paid?")) return;

        try {
            // ✅ correct endpoint
            await api.put(`/payments/${id}/paid`);
            toast.success("Payment marked as paid");
            fetchPayments();
        } catch {
            toast.error("Failed to update payment");
        }
    };

    const deletePayment = async (id) => {
        if (!window.confirm("Delete this payment?")) return;

        try {
            await api.delete(`/payments/${id}`);
            toast.success("Payment deleted");
            fetchPayments();
        } catch {
            toast.error("Failed to delete payment");
        }
    };

    const filteredPayments =
        filter === "all"
            ? payments
            : filter === "paid"
                ? payments.filter((p) => p.status === "paid")
                : payments.filter((p) => p.status !== "paid");

    const StatusBadge = ({ status }) => (
        <span
            className={`px-2 py-1 rounded text-xs font-semibold capitalize ${status === "paid"
                    ? "bg-green-600/20 text-green-400"
                    : "bg-red-600/20 text-red-400"
                }`}
        >
            {status === "paid" ? "paid" : "unpaid"}
        </span>
    );

    return (
        <AppLayout>
            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Payments</h2>

                {/* FILTER */}
                <div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-black/30 text-gray-100 border border-white/10 rounded-lg px-3 py-2"
                    >
                        <option value="all">All</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                    </select>
                </div>

                {loading ? (
                    <p className="text-center text-gray-400">Loading payments…</p>
                ) : filteredPayments.length === 0 ? (
                    <p className="text-center text-gray-400">No payments found.</p>
                ) : (
                    <>
                        {/* MOBILE */}
                        <div className="space-y-4 sm:hidden">
                            {filteredPayments.map((p) => (
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

                                    <p className="text-sm text-gray-300 mb-3">
                                        {p.residentId?.email}
                                    </p>

                                    {p.status !== "paid" && (
                                        <Button
                                            onClick={() => markAsPaid(p._id)}
                                            className="w-full mb-2"
                                        >
                                            Mark Paid
                                        </Button>
                                    )}

                                    {/* ✅ delete button */}
                                    <Button
                                        onClick={() => deletePayment(p._id)}
                                        className="w-full bg-red-600"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {/* DESKTOP */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-sm border border-white/10 rounded-lg">
                                <thead className="bg-white/10">
                                    <tr>
                                        <th className="p-3 text-left">Resident</th>
                                        <th className="p-3 text-right">Amount</th>
                                        <th className="p-3 text-center">Status</th>
                                        <th className="p-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPayments.map((p) => (
                                        <tr
                                            key={p._id}
                                            className="border-t border-white/10 hover:bg-white/5"
                                        >
                                            <td className="p-3">{p.residentId?.email}</td>
                                            <td className="p-3 text-right font-semibold">
                                                ₹{Number(p.amount).toLocaleString()}
                                            </td>
                                            <td className="p-3 text-center">
                                                <StatusBadge status={p.status} />
                                            </td>
                                            <td className="p-3 text-center space-x-2">
                                                {p.status !== "paid" && (
                                                    <Button onClick={() => markAsPaid(p._id)}>
                                                        Mark Paid
                                                    </Button>
                                                )}

                                                <Button
                                                    onClick={() => deletePayment(p._id)}
                                                    className="bg-red-600"
                                                >
                                                    Delete
                                                </Button>
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
