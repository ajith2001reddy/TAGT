import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/axios";

export default function AdminResidents() {
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);

    /* ===== ADD RESIDENT FORM ===== */
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        roomId: ""
    });

    /* ===== BILLING ===== */
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
        const { name, email, password, roomId } = form;

        if (!name || !email || !password) {
            toast.error("Name, email, and password are required");
            return;
        }

        try {
            await api.post("/admin/residents", {
                name,
                email,
                password,
                roomId: roomId || null
            });

            toast.success("Resident added successfully");
            setForm({
                name: "",
                email: "",
                password: "",
                roomId: ""
            });

            fetchResidents();
        } catch (err) {
            console.error(err);
            toast.error("Failed to add resident");
        }
    };

    /* ================= SEND BILL ================= */
    const sendBill = async () => {
        if (!billingTarget?._id) {
            toast.error("Invalid resident selected");
            return;
        }

        const amount = Number(billAmount);
        if (!Number.isFinite(amount) || amount <= 0) {
            toast.error("Enter a valid amount");
            return;
        }

        try {
            await api.post("/payments", {
                residentId: billingTarget._id,
                amount,
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
                <div className="rounded-2xl bg-white/10 border border-white/10 p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        Add New Resident
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {["name", "email", "password", "roomId"].map(
                            (field) => (
                                <input
                                    key={field}
                                    type={
                                        field === "password"
                                            ? "password"
                                            : "text"
                                    }
                                    placeholder={field.toUpperCase()}
                                    className="rounded-lg bg-black/30 border border-white/10 p-2 text-sm"
                                    value={form[field]}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            [field]: e.target.value
                                        })
                                    }
                                />
                            )
                        )}

                        <MotionButton
                            onClick={addResident}
                            className="md:col-span-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
                        >
                            Add Resident
                        </MotionButton>
                    </div>
                </div>

                {/* RESIDENT LIST */}
                <div className="rounded-2xl bg-white/10 border border-white/10 p-6">
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
                                    <th className="p-2 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {residents.map((r) => (
                                    <tr
                                        key={r._id}
                                        className="border-b border-white/5"
                                    >
                                        <td className="p-2">{r.name}</td>
                                        <td className="p-2">{r.email}</td>
                                        <td className="p-2 text-center">
                                            {r.roomId?.roomNumber || "-"}
                                        </td>
                                        <td className="p-2 text-center">
                                            <MotionButton
                                                onClick={() =>
                                                    setBillingTarget(r)
                                                }
                                                className="bg-green-600 text-white px-3 py-1 rounded-lg"
                                            >
                                                Send Bill
                                            </MotionButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* BILL MODAL */}
            {billingTarget && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white/10 border border-white/10 rounded-2xl p-6 w-96"
                    >
                        <h3 className="text-lg font-semibold mb-4">
                            Send Bill to {billingTarget.email}
                        </h3>

                        <input
                            type="number"
                            placeholder="Amount"
                            className="w-full rounded-lg bg-black/30 border border-white/10 p-2 mb-3"
                            value={billAmount}
                            onChange={(e) =>
                                setBillAmount(e.target.value)
                            }
                        />

                        <textarea
                            placeholder="Description"
                            className="w-full rounded-lg bg-black/30 border border-white/10 p-2 mb-4"
                            rows={3}
                            value={billDescription}
                            onChange={(e) =>
                                setBillDescription(e.target.value)
                            }
                        />

                        <div className="flex justify-end gap-3">
                            <MotionButton
                                onClick={() => setBillingTarget(null)}
                                className="px-4 py-2 border border-white/10 rounded-lg"
                            >
                                Cancel
                            </MotionButton>

                            <MotionButton
                                onClick={sendBill}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg"
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
