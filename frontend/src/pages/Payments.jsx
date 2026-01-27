import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/axios";

/**
 * Phase 3 – Admin Payments Page
 * - View all payments
 * - Filter paid / unpaid
 * - Mark payment as paid
 */

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    /* ================= FETCH PAYMENTS ================= */
    const fetchPayments = async () => {
        try {
            setLoading(true);
            const res = await api.get("/payments");
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

    /* ================= MARK AS PAID ================= */
    const markAsPaid = async (id) => {
        if (!window.confirm("Mark this payment as paid?")) return;

        try {
            await api.put(`/payments/${id}/paid`);
            toast.success("Payment marked as paid");
            fetchPayments();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update payment");
        }
    };

    /* ================= FILTER ================= */
    const filteredPayments =
        filter === "all"
            ? payments
            : payments.filter((p) => p.status === filter);

    return (
        <DashboardLayout>
            <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-bold mb-6">
                    Payments
                </h2>

                {/* ================= FILTER BAR ================= */}
                <div className="mb-4 flex gap-3">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="border rounded px-3 py-2"
                    >
                        <option value="all">All</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                    </select>
                </div>

                {/* ================= PAYMENTS TABLE ================= */}
                {loading ? (
                    <p className="text-center text-gray-500">
                        Loading payments...
                    </p>
                ) : filteredPayments.length === 0 ? (
                    <p className="text-center text-gray-500">
                        No payments found.
                    </p>
                ) : (
                    <table className="w-full border">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2">Resident</th>
                                <th className="p-2">Amount</th>
                                <th className="p-2">Description</th>
                                <th className="p-2">Status</th>
                                <th className="p-2">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredPayments.map((p) => (
                                <tr
                                    key={p._id}
                                    className="border-b text-center"
                                >
                                    <td className="p-2">
                                        {p.residentId?.email}
                                    </td>

                                    <td className="p-2 font-semibold">
                                        ${p.amount}
                                    </td>

                                    <td className="p-2">
                                        {p.description}
                                    </td>

                                    <td className="p-2 capitalize">
                                        {p.status}
                                    </td>

                                    <td className="p-2">
                                        {p.status === "unpaid" ? (
                                            <button
                                                onClick={() =>
                                                    markAsPaid(p._id)
                                                }
                                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
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
                )}
            </div>
        </DashboardLayout>
    );
}
