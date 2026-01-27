import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/axios";

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

    return (
        <DashboardLayout>
            <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-bold mb-6">Residents</h2>

                {/* ADD RESIDENT FORM */}
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

                {/* RESIDENTS TABLE */}
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </DashboardLayout>
    );
}
