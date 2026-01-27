import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/axios";

/**
 * PHASE 3 UPGRADE
 * - Admin can send a DIRECT BILL to a resident
 * - Existing resident logic untouched
 */

export default function AdminResidents() {
    const [residents, setResidents] = useState([]);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        room: "",
        rent: ""
    });
    const [loading, setLoading] = useState(true);

    /* ===== PHASE 3: BILLING STATE ===== */
    const [billingTarget, setBillingTarget] = useState(null);
    const [billAmount, setBillAmount] = useState("");
    const [billDescription, setBillDescription] = useState("");

    /* ================= FETCH RESIDENTS ================= */
    const fetchResidents = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/residents");
            setResidents(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
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
            toast.error("Please fill all required fields");
            return;
        }

        try {
            await api.post("/admin/residents", form);
            toast.success("Resident added");

            setForm({
                name: "",
                email: "",
                password: "",
                room: "",
                rent: ""
            });

            fetchResidents();
        } catch (err) {
            console.error(err);
            toast.error("Failed to add resident");
        }
    };

    /* ================= PHASE 3: SEND BILL ================= */
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
        } catch (err) {
            console.error(err);
            toast.error("Failed to send bill");
        }
    };

    return (
        <DashboardLayout>
            <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-bold mb-6">Residents</h2>

                {/* ================= ADD RESIDENT FORM ================= */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
                    <input
                        placeholder="Name"
                        className="border p-2 rounded"
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                    />

                    <input
                        placeholder="Email"
                        className="border p-2 rounded"
                        value={form.email}
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="border p-2 rounded"
                        value={form.password}
                        onChange={(e) =>
                            setForm({ ...form, password: e.target.value })
                        }
                    />

                    <input
                        placeholder="Room"
                        className="border p-2 rounded"
                        value={form.room}
                        onChange={(e) =>
                            setForm({ ...form, room: e.target.value })
                        }
                    />

                    <input
                        placeholder="Rent"
                        className="border p-2 rounded"
                        value={form.rent}
                        onChange={(e) =>
                            setForm({ ...form, rent: e.target.value })
                        }
                    />

                    <button
                        onClick={addResident}
                        className="md:col-span-5 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Add Resident
                    </button>
                </div>

                {/* ================= RESIDENTS TABLE ================= */}
                {loading ? (
                    <p className="text-center text-gray-500">Loading...</p>
                ) : residents.length === 0 ? (
                    <p className="text-center text-gray-500">
                        No residents found.
                    </p>
                ) : (
                    <table className="w-full border">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2">Name</th>
                                <th className="p-2">Email</th>
                                <th className="p-2">Room</th>
                                <th className="p-2">Rent</th>
                                <th className="p-2">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {residents.map((r) => (
                                <tr
                                    key={r._id}
                                    className="border-b text-center"
                                >
                                    <td className="p-2">
                                        {r.userId?.name}
                                    </td>
                                    <td className="p-2">
                                        {r.userId?.email}
                                    </td>
                                    <td className="p-2">{r.room}</td>
                                    <td className="p-2">{r.rent}</td>
                                    <td className="p-2">
                                        <button
                                            onClick={() =>
                                                setBillingTarget(r)
                                            }
                                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                        >
                                            Send Bill
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ================= BILLING MODAL ================= */}
            {billingTarget && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="bg-white p-6 rounded w-96">
                        <h3 className="font-bold mb-3">
                            Send Bill to{" "}
                            {billingTarget.userId?.email}
                        </h3>

                        <input
                            type="number"
                            placeholder="Amount"
                            className="w-full border p-2 mb-3"
                            value={billAmount}
                            onChange={(e) =>
                                setBillAmount(e.target.value)
                            }
                        />

                        <textarea
                            placeholder="Description (optional)"
                            className="w-full border p-2 mb-4"
                            value={billDescription}
                            onChange={(e) =>
                                setBillDescription(e.target.value)
                            }
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() =>
                                    setBillingTarget(null)
                                }
                            >
                                Cancel
                            </button>
                            <button
                                onClick={sendBill}
                                className="bg-green-600 text-white px-4 py-2 rounded"
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
