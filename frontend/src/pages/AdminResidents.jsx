import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import AppLayout from "../components/AppLayout";
import Button from "../components/Button";
import api from "../api/axios";

export default function AdminResidents() {
    const [residents, setResidents] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        roomId: "",
    });

    /* ================= FETCH DATA ================= */
    const fetchResidents = async () => {
        try {
            const res = await api.get("/resident");
            setResidents(res.data?.residents || []);
        } catch {
            toast.error("Failed to load residents");
        }
    };

    const fetchRooms = async () => {
        try {
            const res = await api.get("/rooms");
            setRooms(res.data?.rooms || []);
        } catch {
            toast.error("Failed to load rooms");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResidents();
        fetchRooms();
    }, []);

    /* ================= ADD RESIDENT ================= */
    const addResident = async () => {
        if (!form.name || !form.email || !form.password || !form.roomId) {
            toast.error("All fields including room are required");
            return;
        }

        setSaving(true);

        try {
            await api.post("/resident", form);
            toast.success("Resident added & first bill created");

            setForm({ name: "", email: "", password: "", roomId: "" });
            fetchResidents();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add resident");
        } finally {
            setSaving(false);
        }
    };

    /* ================= SEND BILL ================= */
    const sendBill = async (resident) => {
        try {
            await api.post("/payments", {
                residentId: resident._id,
                amount: resident.roomId?.rent,
                description: "Monthly Rent",
                type: "rent",
                month: new Date().toISOString().slice(0, 7),
            });

            toast.success("Bill sent successfully");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send bill");
        }
    };

    /* ================= DELETE ================= */
    const deleteResident = async (id) => {
        if (!window.confirm("Delete this resident?")) return;

        try {
            await api.delete(`/resident/${id}`);
            toast.success("Resident deleted");
            fetchResidents();
        } catch {
            toast.error("Failed to delete resident");
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6 text-white">
                <h1 className="text-2xl font-bold">Residents</h1>

                {/* ================= ADD FORM ================= */}
                <div className="bg-white/10 border border-white/10 rounded-xl p-4 space-y-3">
                    <h2 className="font-semibold">Add Resident</h2>

                    <input
                        className="w-full p-2 rounded bg-black/30 border border-white/10"
                        placeholder="Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />

                    <input
                        className="w-full p-2 rounded bg-black/30 border border-white/10"
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />

                    <input
                        type="password"
                        className="w-full p-2 rounded bg-black/30 border border-white/10"
                        placeholder="Password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />

                    {/* ROOM SELECT */}
                    <select
                        className="w-full p-2 rounded bg-black/30 border border-white/10"
                        value={form.roomId}
                        onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                    >
                        <option value="">Select Room</option>
                        {rooms.map((room) => (
                            <option key={room._id} value={room._id}>
                                Room {room.roomNumber} — ₹{room.rent}
                            </option>
                        ))}
                    </select>

                    <Button disabled={saving} onClick={addResident}>
                        {saving ? "Saving..." : "Add Resident"}
                    </Button>
                </div>

                {/* ================= RESIDENT TABLE ================= */}
                {loading ? (
                    <p className="text-gray-400 text-center">Loading…</p>
                ) : (
                    <div className="overflow-x-auto rounded-xl bg-white/10 border border-white/10">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-gray-400 border-b border-white/10">
                                    <th className="px-4 py-3 text-left">Name</th>
                                    <th className="px-4 py-3 text-left">Email</th>
                                    <th className="px-4 py-3 text-left">Room</th>
                                    <th className="px-4 py-3 text-left">Amount</th>
                                    <th className="px-4 py-3 text-center">Send Bill</th>
                                    <th className="px-4 py-3 text-right">Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {residents.map((r) => (
                                    <tr key={r._id} className="border-t border-white/5">
                                        <td className="px-4 py-3">{r.name}</td>
                                        <td className="px-4 py-3">{r.email}</td>
                                        <td className="px-4 py-3">{r.roomId?.roomNumber || "-"}</td>
                                        <td className="px-4 py-3">
                                            {r.roomId ? `₹${r.roomId.rent}` : "-"}
                                        </td>

                                        {/* SEND BILL BUTTON */}
                                        <td className="px-4 py-3 text-center">
                                            <Button onClick={() => sendBill(r)}>
                                                Send Bill
                                            </Button>
                                        </td>

                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                className="bg-red-600"
                                                onClick={() => deleteResident(r._id)}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
