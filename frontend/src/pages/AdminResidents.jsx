import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/axios";

export default function AdminResidents() {
    const [residents, setResidents] = useState([]);
    const [rooms, setRooms] = useState([]);
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
            const res = await api.get("/admin/residents");
            setResidents(res.data || []);
        } catch {
            toast.error("Failed to load residents");
            setResidents([]);
        }
    }, []);

    /* ================= FETCH ROOMS ================= */
    const fetchRooms = useCallback(async () => {
        try {
            const res = await api.get("/rooms");
            setRooms(res.data?.rooms || res.data || []);
        } catch {
            toast.error("Failed to load rooms");
            setRooms([]);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchResidents(), fetchRooms()]).finally(() =>
            setLoading(false)
        );
    }, [fetchResidents, fetchRooms]);

    /* ================= ADD RESIDENT ================= */
    const addResident = async () => {
        const { name, email, password, roomId } = form;

        if (!name || !email || !password) {
            toast.error("Name, email, and password are required");
            return;
        }

        const selectedRoom = rooms.find((r) => r._id === roomId);
        if (selectedRoom && selectedRoom.availableBeds <= 0) {
            toast.error("Selected room has no available beds");
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
            setForm({ name: "", email: "", password: "", roomId: "" });

            fetchResidents();
            fetchRooms(); // 🔥 refresh availability
        } catch {
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
        } catch {
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
            <div className="space-y-10">
                <div>
                    <h1 className="text-3xl font-bold">Residents</h1>
                    <p className="text-gray-500 mt-1">
                        Manage residents and room assignments
                    </p>
                </div>

                {/* ADD RESIDENT */}
                <div className="bg-white rounded-2xl border p-6">
                    <h2 className="text-lg font-semibold mb-4">
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

                        {/* ROOM SELECT */}
                        <select
                            className="border rounded-lg p-2"
                            value={form.roomId}
                            onChange={(e) =>
                                setForm({ ...form, roomId: e.target.value })
                            }
                        >
                            <option value="">No Room</option>
                            {rooms.map((r) => (
                                <option
                                    key={r._id}
                                    value={r._id}
                                    disabled={r.availableBeds <= 0}
                                >
                                    Room {r.roomNumber} — {r.availableBeds} beds
                                </option>
                            ))}
                        </select>

                        <MotionButton
                            onClick={addResident}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                        >
                            Add Resident
                        </MotionButton>
                    </div>
                </div>

                {/* RESIDENT LIST */}
                <div className="bg-white rounded-2xl border p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        Resident List
                    </h2>

                    {loading ? (
                        <p className="text-center text-gray-500">
                            Loading residents…
                        </p>
                    ) : residents.length === 0 ? (
                        <p className="text-center text-gray-500">
                            No residents found.
                        </p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-gray-500">
                                    <th className="p-2 text-left">Name</th>
                                    <th className="p-2 text-left">Email</th>
                                    <th className="p-2 text-center">Room</th>
                                    <th className="p-2 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {residents.map((r) => (
                                    <tr key={r._id} className="border-b">
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
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl p-6 w-96"
                    >
                        <h3 className="text-lg font-semibold mb-4">
                            Send Bill to {billingTarget.email}
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
                            placeholder="Description"
                            className="w-full border rounded-lg p-2 mb-4"
                            rows={3}
                            value={billDescription}
                            onChange={(e) =>
                                setBillDescription(e.target.value)
                            }
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setBillingTarget(null)}
                                className="px-4 py-2 border rounded-lg"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={sendBill}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg"
                            >
                                Send Bill
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </DashboardLayout>
    );
}
