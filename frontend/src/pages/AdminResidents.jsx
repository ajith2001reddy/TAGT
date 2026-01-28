import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/axios";

/**
 * ADMIN RESIDENTS (PROFESSIONAL)
 * - Clean resident management
 * - Clear billing flow
 * - Safe, calm admin UX
 */

export default function AdminResidents() {
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);

    /* ===== ADD RESIDENT FORM ===== */
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        room: "",
        rent: ""
    });

    /* ===== BILLING MODAL ===== */
    const [billingTarget, setBillingTarget] = useState(null);
    const [billAmount, setBillAmount] = useState("");
    const [billDescription, setBillDescription] = useState("");

    /* ================= FETCH RESIDENTS ================= */
    const fetchResidents = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/residents");
            setResidents(Array.isArray(res.data) ? res.data : []);
        } catch {
            toast.error("Failed to load residents");
            setResidents([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchResidents();
    }, [fetchResidents]);

    /* ================= ADD RESIDENT ================= */
    const addResident = async () => {
        if (!form.name || !form.email || !form.password) {
            toast.error("Name, email, and password are required");
            return;
        }

        try {
            await api.post("/admin/residents", form);
            toast.success("Resident added successfully");

            setForm({
                name: "",
                email: "",
                password: "",
                room: "",
                rent: ""
            });

            fetchResidents();
        } catch {
            toast.error("Failed to add resident");
        }
    };

    /* ================= SEND BILL ================= */
    const sendBill = async () => {
        if (!billAmount || Number(billAmount) <= 0) {
            toast.error("Enter a valid amount");
            return;
        }

        try {
            await api.post("/payments", {
                residentId: billingTarget.userId._id,
                amount: Number(billAmount),
                description: billDescription || "Direct charge",
                type: "manual"
            });

            toast.success("Bill sent successfully");
            setBillingTarget(null);
            setBillAmount("");
            setBillDescription("");
        } catch {
            toast.error("Failed to send bill");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-10">
                {/* ================= HEADER ================= */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Residents
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Manage residents and send direct bills
                    </p>
                </div>

                {/* ================= ADD RESIDENT ================= */}
                <div className="bg-white rounded-2xl border p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Add New Resident
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <input
                            placeholder="Name"
                            className="border rounded-lg p-2"
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                        />

                        <input
                            placeholder="Email"
                            className="border rounded-lg p-2"
                            value={form.email}
                            onChange={(e) =>
                                setForm({ ...form, email: e.target.value })
                            }
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            className="border rounded-lg p-2"
                            value={form.password}
                            onChange={(e) =>
                                setForm({ ...form, password: e.target.value })
                            }
                        />

                        <input
                            placeholder="Room"
                            className="border rounded-lg p-2"
                            value={form.room}
                            onChange={(e) =>
                                setForm({ ...form, room: e.target.value })
                            }
                        />

                        <input
                            placeholder="Rent"
                            className="border rounded-lg p-2"
                            value={form.rent}
                            onChange={(e) =>
                                setForm({ ...form, rent: e.target.value })
                            }
                        />

                        <button
                            onClick={addResident}
                            className="md:col-span-5 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            Add Resident
                        </button>
                    </div>
                </div>

                {/* ================= RESIDENTS LIST ================= */}
                <div className="bg-white rounded-2xl border p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Resident List
                    </h2>

                    {loading ? (
                        <p className="text-gray-500 text-center">
                            Loading residents…
                        </p>
                    ) : residents.length === 0 ? (
                        <p className="text-gray-500 text-center">
                            No residents found.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="border-b text-gray-500">
                                        <th className="p-2 text-left">
                                            Name
                                        </th>
                                        <th className="p-2 text-left">
                                            Email
                                        </th>
                                        <th className="p-2">
                                            Room
                                        </th>
                                        <th className="p-2">
                                            Rent
                                        </th>
                                        <th className="p-2">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {residents.map((r) => (
                                        <tr
                                            key={r._id}
                                            className="border-b hover:bg-gray-50"
                                        >
                                            <td className="p-2">
                                                {r.userId?.name}
                                            </td>
                                            <td className="p-2">
                                                {r.userId?.email}
                                            </td>
                                            <td className="p-2 text-center">
                                                {r.room}
                                            </td>
                                            <td className="p-2 text-center">
                                                {r.rent}
                                            </td>
                                            <td className="p-2 text-center">
                                                <button
                                                    onClick={() =>
                                                        setBillingTarget(r)
                                                    }
                                                    className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
                                                >
                                                    Send Bill
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ================= BILLING MODAL ================= */}
            {billingTarget && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-96">
                        <h3 className="text-lg font-semibold mb-4">
                            Send Bill to{" "}
                            {billingTarget.userId?.email}
                        </h3>

                        <input
                            type="number"
                            placeholder="Amount"
                            className="w-full border rounded-lg p-2 mb-3"
                            value={billAmount}
                            onChange={(e) =>
                                setBillAmount(e.target.value)
                            }
                        />

                        <textarea
                            placeholder="Description (optional)"
                            className="w-full border rounded-lg p-2 mb-4"
                            rows={3}
                            value={billDescription}
                            onChange={(e) =>
                                setBillDescription(e.target.value)
                            }
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() =>
                                    setBillingTarget(null)
                                }
                                className="px-4 py-2 rounded-lg border"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={sendBill}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                            >
                                Send Bill
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
