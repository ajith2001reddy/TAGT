import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout";
import Button from "../components/Button";
import api from "../api/axios";

/**
 * ADMIN PAYMENTS – MOBILE SAFE
 */

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

    const StatusBadge = ({ status }) => (
        <span
            className={`px-2 py-1 rounded text-xs font-semibold capitalize ${isUnpaid(status)
                    ? "bg-red-600/20 text-red-400"
                    : "bg-green-600/20 text-green-400"
                }`}
        >
            {isUnpaid(status) ? "unpaid" : "paid"}
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
                        className="bg-black/30 text-gray-100 border border-white/10 rounded-lg px-3 py-2 min-h-[40px]"
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
                    <>
                        {/* ================= MOBILE VIEW ================= */}
                        <div className="space-y-4 sm:hidden">
                            {filteredPayments.map((p) => (
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
                                        {p.residentId?.email}
                                    </p>

                                    <p className="text-sm text-gray-400 mb-2">
                                        {p.description || "—"}
                                    </p>

                                    {isUnpaid(p.status) && (
                                        <Button
                                            onClick={() => markAsPaid(p._id)}
                                            className="w-full"
                                        >
                                            Mark Paid
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* ================= DESKTOP TABLE ================= */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-sm text-gray-200 border border-white/10 rounded-lg">
                                <thead className="bg-white/10">
                                    <tr>
                                        <th className="p-3 text-left">
                                            Resident
                                        </th>
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
                                            Action
                                        </th>
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
                                            <td className="p-3 text-center">
                                                <StatusBadge status={p.status} />
                                            </td>
                                            <td className="p-3 text-center">
                                                {isUnpaid(p.status) ? (
                                                    <Button
                                                        onClick={() =>
                                                            markAsPaid(p._id)
                                                        }
                                                    >
                                                        Mark Paid
                                                    </Button>
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
                    </>
                )}
            </div>
        </AppLayout>
    );
}
