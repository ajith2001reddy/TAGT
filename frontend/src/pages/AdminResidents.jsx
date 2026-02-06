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
        room: "", // ✅ room number
        rent: "", // ✅ manual rent
    });

    /* ================= FETCH RESIDENTS ================= */
    const fetchResidents = async () => {
        try {
            setLoading(true);
            const res = await api.get("/resident");
            setResidents(res.data?.residents || []);
        } catch {
            toast.error("Failed to load residents");
        } finally {
            setLoading(false);
        }
    };

    /* ================= FETCH ROOMS ================= */
    const fetchRooms = async () => {
        try {
            const res = await api.get("/rooms");
            setRooms(res.data?.rooms || []);
        } catch {
            toast.error("Failed to load rooms");
        }
    };

    useEffect(() => {
        fetchResidents();
        fetchRooms();
    }, []);

    /* ================= ADD RESIDENT ================= */
    const addResident = async () => {
        if (!form.name || !form.email || !form.password) {
            toast.error("Name, email and password are required");
            return;
        }

        if (!form.room && !form.rent) {
            toast.error("Select a room OR enter manual rent");
            return;
        }

        if (form.rent && Number(form.rent) <= 0) {
            toast.error("Rent must be greater than 0");
            return;
        }

        setSaving(true);

        try {
            await api.post("/resident", {
                name: form.name,
                email: form.email,
                password: form.password,
                room: form.room || undefined, // ✅ send room number
                rent: form.rent ? Number(form.rent) : undefined,
            });

            toast.success("Resident added & first bill created");

            setForm({
                name: "",
                email: "",
                password: "",
                room: "",
                rent: "",
            });

            fetchResidents();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add resident");
        } finally {
            setSaving(false);
        }
    };

    /* ================= DELETE RESIDENT ================= */
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
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Residents</h1>

                {/* ================= ADD FORM ================= */}
                <div className="bg-white/10 border border-white/10 rounded-xl p-4 space-y-3">
                    <h2 className="font-semibold">Add Resident</h2>

                    <input
                        className="w-full p-2 rounded bg-black/30 border border-white/10"
                        placeholder="Name"
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                    />

                    <input
                        className="w-full p-2 rounded bg-black/30 border border-white/10"
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                    />

                    <input
                        type="password"
                        className="w-full p-2 rounded bg-black/30 border border-white/10"
                        placeholder="Password"
                        value={form.password}
                        onChange={(e) =>
                            setForm({ ...form, password: e.target.value })
                        }
                    />

                    {/* ROOM DROPDOWN */}
                    <select
                        className="w-full p-2 rounded bg-black/30 border border-white/10"
                        value={form.room}
                        onChange={(e) =>
                            setForm({ ...form, room: e.target.value })
                        }
                    >
                        <option value="">Select Room (optional)</option>
                        {rooms.map((r) => (
                            <option key={r._id} value={r.roomNumber}>
                                Room {r.roomNumber} — ₹{r.rent}
                            </option>
                        ))}
                    </select>

                    {/* MANUAL RENT */}
                    <input
                        type="number"
                        className="w-full p-2 rounded bg-black/30 border border-white/10"
                        placeholder="Manual Rent (if no room)"
                        value={form.rent}
                        onChange={(e) =>
                            setForm({ ...form, rent: e.target.value })
                        }
                    />

                    <Button disabled={saving} onClick={addResident}>
                        {saving ? "Saving..." : "Add Resident"}
                    </Button>
                </div>

                {/* ================= LIST ================= */}
                {loading ? (
                    <p className="text-gray-400 text-center">Loading…</p>
                ) : residents.length === 0 ? (
                    <p className="text-gray-400 text-center">
                        No residents found
                    </p>
                ) : (
                    <div className="overflow-x-auto rounded-xl bg-white/10 border border-white/10">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-gray-400 border-b border-white/10">
                                    <th className="px-4 py-3 text-left">Name</th>
                                    <th className="px-4 py-3 text-left">Email</th>
                                    <th className="px-4 py-3 text-left">Room</th>
                                    <th className="px-4 py-3 text-right">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {residents.map((r) => (
                                    <tr
                                        key={r._id}
                                        className="border-t border-white/5"
                                    >
                                        <td className="px-4 py-3">{r.name}</td>
                                        <td className="px-4 py-3">{r.email}</td>
                                        <td className="px-4 py-3">
                                            {r.roomId?.roomNumber || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                className="bg-red-600"
                                                onClick={() =>
                                                    deleteResident(r._id)
                                                }
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
