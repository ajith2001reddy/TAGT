import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import AppLayout from "../components/AppLayout";
import Button from "../components/Button";
import api from "../api/axios";

export default function AdminResidents() {
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        roomNumber: "",
    });

    // ================= FETCH =================
    const fetchResidents = async () => {
        try {
            setLoading(true);
            const res = await api.get("/resident");
            setResidents(Array.isArray(res.data) ? res.data : []);
        } catch {
            toast.error("Failed to load residents");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResidents();
    }, []);

    // ================= ADD =================
    const addResident = async () => {
        if (!form.name || !form.email || !form.roomNumber) {
            toast.error("All fields are required");
            return;
        }

        setSaving(true);
        try {
            await api.post("/resident", form);
            toast.success("Resident added");
            setForm({ name: "", email: "", roomNumber: "" });
            fetchResidents();
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to add resident"
            );
        } finally {
            setSaving(false);
        }
    };

    // ================= DELETE =================
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

                {/* ADD FORM */}
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
                        className="w-full p-2 rounded bg-black/30 border border-white/10"
                        placeholder="Room Number"
                        value={form.roomNumber}
                        onChange={(e) =>
                            setForm({ ...form, roomNumber: e.target.value })
                        }
                    />

                    <Button disabled={saving} onClick={addResident}>
                        {saving ? "Saving..." : "Add Resident"}
                    </Button>
                </div>

                {/* LIST */}
                {loading ? (
                    <p className="text-gray-400 text-center">Loading…</p>
                ) : residents.length === 0 ? (
                    <p className="text-gray-400 text-center">No residents found</p>
                ) : (
                    <div className="overflow-x-auto rounded-xl bg-white/10 border border-white/10">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-gray-400 border-b border-white/10">
                                    <th className="px-4 py-3 text-left">Name</th>
                                    <th className="px-4 py-3 text-left">Email</th>
                                    <th className="px-4 py-3 text-left">Room</th>
                                    <th className="px-4 py-3 text-right">Action</th>
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
                                            {r.roomNumber || "-"}
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
