import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/axios";

/**
 * ResidentPayments
 * Phase 3
 *
 * - Resident sees ONLY their own payments
 * - Read-only (no mark paid)
 * - Same Payment system as admin, role-based access
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
            <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-bold mb-6">
                    My Payments
                </h2>

                {/* ================= CONTENT ================= */}
                {loading ? (
                    <p className="text-center text-gray-500">
                        Loading payments...
                    </p>
                ) : payments.length === 0 ? (
                    <p className="text-center text-gray-500">
                        No payments assigned to you yet.
                    </p>
                ) : (
                    <table className="w-full border">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2">Amount</th>
                                <th className="p-2">Description</th>
                                <th className="p-2">Status</th>
                                <th className="p-2">Created</th>
                            </tr>
                        </thead>

                        <tbody>
                            {payments.map((p) => (
                                <tr
                                    key={p._id}
                                    className="border-b text-center"
                                >
                                    <td className="p-2 font-semibold">
                                        ${p.amount}
                                    </td>

                                    <td className="p-2">
                                        {p.description || "—"}
                                    </td>

                                    <td
                                        className={`p-2 capitalize font-medium ${p.status === "paid"
                                                ? "text-green-600"
                                                : "text-red-600"
                                            }`}
                                    >
                                        {p.status}
                                    </td>

                                    <td className="p-2 text-sm text-gray-500">
                                        {new Date(
                                            p.createdAt
                                        ).toLocaleDateString()}
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
