import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/axios";

/**
 * ADMIN RESIDENTS
 * PHASE 3 – Action Micro-Interactions
 */

export default function AdminResidents() {
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        room: "",
        rent: ""
    });

    const [billingTarget, setBillingTarget] = useState(null);
    const [billAmount, setBillAmount] = useState("");
    const [billDescription, setBillDescription] = useState("");

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

    const addResident = async () => {
        if (!form.name || !form.email || !form.password || !form.room || !form.rent) {
            toast.error("All fields are required");
            return;
        }

        if (Number(form.rent) <= 0) {
            toast.error("Rent must be greater than 0");
            return;
        }

        try {
            await api.post("/admin/residents", {
                ...form,
                rent: Number(form.rent)
            });

            toast.success("Resident added successfully");
            setForm({ name: "", email: "", password: "", room: "", rent: "" });
            fetchResidents();
        } catch (err) {
            toast.error(err.response?.data || "Failed to add resident");
        }
    };

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

    const deleteResident = async (id) => {
        if (!window.confirm("Delete this resident permanently?")) return;

        try {
            await api.delete(`/admin/residents/${id}`);
            toast.success("Resident deleted successfully");
            fetchResidents();
        } catch (err) {
            toast.error(err.response?.data || "Failed to delete resident");
        }
    };

    const MotionButton = ({ children, className, ...props }) => (
        <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={className}
            {...props}
        >
            {children}
        </motion.button>
    );

    return (
        <DashboardLayout>
            <div className="space-y-10 text-gray-100">
                <div>
                    <h1 className="text-3xl font-bold">Residents</h1>
                    <p className="text-gray-400 mt-1">
                        Manage residents and send direct bills
                    </p>
                </div>

                {/* ADD RESIDENT */}
                <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        Add New Resident
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        {["name", "email", "password", "room", "rent"].map((field) => (
                            <input
                                key={field}
                                type={field === "password" ? "password" : field === "rent" ? "number" : "text"}
                                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                className="rounded-lg bg-black/30 border border-white/10 p-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={form[field]}
                                onChange={(e) =>
                                    setForm({ ...form, [field]: e.target.value })
                                }
                            />
                        ))}

                        <MotionButton
                            onClick={addResident}
                            className="md:col-span-5 bg-blue-600/90 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                            Add Resident
                        </MotionButton>
                    </div>
                </div>

                {/* RESIDENT LIST */}
                <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        Resident List
                    </h2>

                    {loading ? (
                        <p className="text-center text-gray-400">
                            Loading residents…
                        </p>
                    ) : residents.length === 0 ? (
                        <p className="text-center text-gray-400">
                            No residents found.
                        </p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-gray-400 border-b border-white/10">
                                    <th className="p-2 text-left">Name</th>
                                    <th className="p-2 text-left">Email</th>
                                    <th className="p-2 text-center">Room</th>
                                    <th className="p-2 text-center">Rent</th>
                                    <th className="p-2 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {residents.map((r) => (
                                    <tr
                                        key={r._id}
                                        className="border-b border-white/5 hover:bg-white/5 transition"
                                    >
                                        <td className="p-2">{r.userId?.name}</td>
                                        <td className="p-2">{r.userId?.email}</td>
                                        <td className="p-2 text-center">{r.room}</td>
                                        <td className="p-2 text-center">{r.rent}</td>
                                        <td className="p-2 text-center space-x-2">
                                            <MotionButton
                                                onClick={() => setBillingTarget(r)}
                                                className="bg-green-600/90 hover:bg-green-700 text-white px-3 py-1 rounded-lg"
                                            >
                                                Send Bill
                                            </MotionButton>

                                            <MotionButton
                                                onClick={() => deleteResident(r._id)}
                                                className="bg-red-600/90 hover:bg-red-700 text-white px-3 py-1 rounded-lg"
                                            >
                                                Delete
                                            </MotionButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* BILLING MODAL */}
            {billingTarget && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-96 text-white"
                    >
                        <h3 className="text-lg font-semibold mb-4">
                            Send Bill to {billingTarget.userId?.email}
                        </h3>

                        <input
                            type="number"
                            placeholder="Amount"
                            className="w-full rounded-lg bg-black/30 border border-white/10 p-2 mb-3"
                            value={billAmount}
                            onChange={(e) => setBillAmount(e.target.value)}
                        />

                        <textarea
                            placeholder="Description (optional)"
                            className="w-full rounded-lg bg-black/30 border border-white/10 p-2 mb-4"
                            rows={3}
                            value={billDescription}
                            onChange={(e) => setBillDescription(e.target.value)}
                        />

                        <div className="flex justify-end gap-3">
                            <MotionButton
                                onClick={() => setBillingTarget(null)}
                                className="px-4 py-2 rounded-lg border border-white/10"
                            >
                                Cancel
                            </MotionButton>

                            <MotionButton
                                onClick={sendBill}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                            >
                                Send Bill
                            </MotionButton>
                        </div>
                    </motion.div>
                </div>
            )}
        </DashboardLayout>
    );
}
