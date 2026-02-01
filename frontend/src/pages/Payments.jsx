import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/axios";

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    const isUnpaid = (status) =>
        ["unpaid", "due", "pending"].includes(
            String(status).toLowerCase()
        );

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const res = await api.get("/payments");

            const cleaned = (Array.isArray(res.data) ? res.data : [])
                .filter(
                    (p) =>
                        p &&
                        p._id &&
                        Number.isFinite(p.amount) &&
                        p.amount > 0 &&
                        p.residentId
                )
                .map((p) => ({
                    ...p,
                    status: String(p.status || "unpaid").toLowerCase()
                }));

            setPayments(cleaned);
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

    const markAsPaid = async (id) => {
        if (!window.confirm("Mark this payment as paid?")) return;

        try {
            await api.put(`/payments/${id}/paid`);
            toast.success("Payment marked as paid");
            fetchPayments();
        } catch {
            toast.error("Failed to update payment");
        }
    };

    const filteredPayments =
        filter === "all"
            ? payments
            : filter === "paid"
                ? payments.filter((p) => p.status === "paid")
                : payments.filter((p) => isUnpaid(p.status));

    return (
        <DashboardLayout>
            <h2 className="text-2xl font-bold mb-6">Payments</h2>

            <div className="mb-4">
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-black/30 text-gray-100 border border-white/10 rounded px-3 py-2"
                >
                    <option value="all">All</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                </select>
            </div>

            {loading ? (
                <p className="text-center text-gray-400">
                    Loading payments…
                </p>
            ) : filteredPayments.length === 0 ? (
                <p className="text-center text-gray-400">
                    No payments found.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-gray-200 border border-white/10 rounded-lg">
                        <thead className="bg-white/10">
                            <tr>
                                <th className="p-3 text-left">Resident</th>
                                <th className="p-3 text-right">Amount</th>
                                <th className="p-3 text-left">Description</th>
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
                                    <td className="p-3">
                                        {p.residentId?.email}
                                    </td>
                                    <td className="p-3 text-right font-semibold">
                                        ${Number(p.amount).toLocaleString()}
                                    </td>
                                    <td className="p-3">
                                        {p.description || "—"}
                                    </td>
                                    <td className="p-3 text-center capitalize">
                                        {isUnpaid(p.status)
                                            ? "unpaid"
                                            : "paid"}
                                    </td>
                                    <td className="p-3 text-center">
                                        {isUnpaid(p.status) ? (
                                            <button
                                                disabled={loading}
                                                onClick={() =>
                                                    markAsPaid(p._id)
                                                }
                                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                                            >
                                                Mark Paid
                                            </button>
                                        ) : (
                                            <span className="text-gray-500">
                                                —
                                            </span>
                                        )}
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
