import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/axios";

export default function Adminroomss() {
    const [roomss, setroomss] = useState([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        roomsNumber: "",
        totalBeds: "",
        note: ""
    });

    const [selectedrooms, setSelectedrooms] = useState(null);
    const [occupiedBeds, setOccupiedBeds] = useState("");

    /* ================= FETCH roomsS ================= */
    const fetchroomss = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/roomss");
            setroomss(Array.isArray(res.data) ? res.data : []);
        } catch {
            toast.error("Failed to load roomss");
            setroomss([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchroomss();
    }, [fetchroomss]);

    /* ================= ADD rooms ================= */
    const addrooms = async () => {
        if (!form.roomsNumber || !form.totalBeds) {
            toast.error("rooms number and total beds are required");
            return;
        }

        if (Number(form.totalBeds) <= 0) {
            toast.error("Total beds must be greater than 0");
            return;
        }

        try {
            await api.post("/roomss", {
                roomsNumber: form.roomsNumber,
                totalBeds: Number(form.totalBeds),
                note: form.note
            });

            toast.success("rooms added successfully");
            setForm({ roomsNumber: "", totalBeds: "", note: "" });
            fetchroomss();
        } catch {
            toast.error("Failed to add rooms");
        }
    };

    /* ================= UPDATE OCCUPANCY ================= */
    const updateOccupancy = async () => {
        if (!selectedrooms) return;

        const value = Number(occupiedBeds);

        if (!Number.isInteger(value) || value < 0) {
            toast.error("Enter a valid occupied beds value");
            return;
        }

        if (value > selectedrooms.totalBeds) {
            toast.error("Occupied beds cannot exceed total beds");
            return;
        }

        try {
            await api.put(
                `/roomss/${selectedrooms._id}/occupancy`,
                { occupiedBeds: value }
            );

            toast.success("Occupancy updated");
            setSelectedrooms(null);
            setOccupiedBeds("");
            fetchroomss();
        } catch {
            toast.error("Failed to update occupancy");
        }
    };

    /* ================= DELETE rooms ================= */
    const deleterooms = async (rooms) => {
        if (rooms.occupiedBeds > 0) {
            toast.error("Cannot delete a rooms with occupied beds");
            return;
        }

        const confirm = window.confirm(
            `Delete rooms ${rooms.roomsNumber}? This cannot be undone.`
        );

        if (!confirm) return;

        try {
            await api.delete(`/roomss/${rooms._id}`);
            toast.success("rooms deleted");
            fetchroomss();
        } catch {
            toast.error("Failed to delete rooms");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        roomss & Bed Management
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Manage roomss, capacity, and occupancy
                    </p>
                </div>

                {/* ADD rooms */}
                <div className="bg-white rounded-2xl border p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        Add New rooms
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                            placeholder="rooms Number"
                            className="border rounded-lg p-2"
                            value={form.roomsNumber}
                            onChange={(e) =>
                                setForm({ ...form, roomsNumber: e.target.value })
                            }
                        />

                        <input
                            type="number"
                            placeholder="Total Beds"
                            className="border rounded-lg p-2"
                            value={form.totalBeds}
                            onChange={(e) =>
                                setForm({ ...form, totalBeds: e.target.value })
                            }
                        />

                        <input
                            placeholder="Note (optional)"
                            className="border rounded-lg p-2"
                            value={form.note}
                            onChange={(e) =>
                                setForm({ ...form, note: e.target.value })
                            }
                        />

                        <button
                            onClick={addrooms}
                            className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
                        >
                            Add rooms
                        </button>
                    </div>
                </div>

                {/* roomsS TABLE */}
                <div className="bg-white rounded-2xl border p-6">
                    <h2 className="text-lg font-semibold mb-4">roomss</h2>

                    {loading ? (
                        <p className="text-gray-500 text-center">
                            Loading roomss…
                        </p>
                    ) : roomss.length === 0 ? (
                        <p className="text-gray-500 text-center">
                            No roomss added yet.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-gray-500">
                                        <th className="p-2 text-left">rooms</th>
                                        <th className="p-2 text-center">
                                            Total Beds
                                        </th>
                                        <th className="p-2 text-center">
                                            Occupied
                                        </th>
                                        <th className="p-2 text-center">
                                            Available
                                        </th>
                                        <th className="p-2 text-center">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roomss.map((r) => {
                                        const availableBeds =
                                            r.totalBeds - r.occupiedBeds;

                                        return (
                                            <tr
                                                key={r._id}
                                                className="border-b hover:bg-gray-50"
                                            >
                                                <td className="p-2">
                                                    {r.roomsNumber}
                                                </td>
                                                <td className="p-2 text-center">
                                                    {r.totalBeds}
                                                </td>
                                                <td className="p-2 text-center">
                                                    {r.occupiedBeds}
                                                </td>
                                                <td className="p-2 text-center font-semibold">
                                                    {availableBeds}
                                                </td>
                                                <td className="p-2 text-center space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedrooms(r);
                                                            setOccupiedBeds(
                                                                String(
                                                                    r.occupiedBeds
                                                                )
                                                            );
                                                        }}
                                                        className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                    >
                                                        Update
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            deleterooms(r)
                                                        }
                                                        className="px-3 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* OCCUPANCY MODAL */}
            {selectedrooms && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-96">
                        <h3 className="text-lg font-semibold mb-4">
                            Update Occupancy – rooms{" "}
                            {selectedrooms.roomsNumber}
                        </h3>

                        <input
                            type="number"
                            className="w-full border rounded-lg p-2 mb-4"
                            value={occupiedBeds}
                            onChange={(e) =>
                                setOccupiedBeds(e.target.value)
                            }
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedrooms(null)}
                                className="px-4 py-2 border rounded-lg"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={updateOccupancy}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
