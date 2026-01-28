import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/axios";

/**
 * ADMIN ROOMS
 * - Room & bed management
 * - Visual availability
 * - Safe occupancy updates
 * - No destructive actions without confirmation
 */

export default function AdminRooms() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    /* ===== ADD ROOM FORM ===== */
    const [form, setForm] = useState({
        roomNumber: "",
        totalBeds: "",
        note: ""
    });

    /* ===== OCCUPANCY MODAL ===== */
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [occupiedBeds, setOccupiedBeds] = useState("");

    /* ================= FETCH ROOMS ================= */
    const fetchRooms = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/rooms");
            setRooms(Array.isArray(res.data) ? res.data : []);
        } catch {
            toast.error("Failed to load rooms");
            setRooms([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    /* ================= ADD ROOM ================= */
    const addRoom = async () => {
        if (!form.roomNumber || !form.totalBeds) {
            toast.error("Room number and total beds are required");
            return;
        }

        if (Number(form.totalBeds) <= 0) {
            toast.error("Total beds must be greater than 0");
            return;
        }

        try {
            await api.post("/rooms", {
                roomNumber: form.roomNumber,
                totalBeds: Number(form.totalBeds),
                note: form.note
            });

            toast.success("Room added successfully");
            setForm({ roomNumber: "", totalBeds: "", note: "" });
            fetchRooms();
        } catch {
            toast.error("Failed to add room");
        }
    };

    /* ================= UPDATE OCCUPANCY ================= */
    const updateOccupancy = async () => {
        if (occupiedBeds === "" || Number(occupiedBeds) < 0) {
            toast.error("Enter a valid occupied beds value");
            return;
        }

        if (Number(occupiedBeds) > selectedRoom.totalBeds) {
            toast.error("Occupied beds cannot exceed total beds");
            return;
        }

        try {
            await api.put(
                `/rooms/${selectedRoom._id}/occupancy`,
                { occupiedBeds: Number(occupiedBeds) }
            );

            toast.success("Occupancy updated");
            setSelectedRoom(null);
            setOccupiedBeds("");
            fetchRooms();
        } catch {
            toast.error("Failed to update occupancy");
        }
    };

    /* ================= DELETE ROOM ================= */
    const deleteRoom = async (room) => {
        if (room.occupiedBeds > 0) {
            toast.error("Cannot delete a room with occupied beds");
            return;
        }

        const confirm = window.confirm(
            `Delete room ${room.roomNumber}? This cannot be undone.`
        );

        if (!confirm) return;

        try {
            await api.delete(`/rooms/${room._id}`);
            toast.success("Room deleted");
            fetchRooms();
        } catch {
            toast.error("Failed to delete room");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-10">
                {/* ================= HEADER ================= */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Rooms & Bed Management
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Manage rooms, capacity, and occupancy
                    </p>
                </div>

                {/* ================= ADD ROOM ================= */}
                <div className="bg-white rounded-2xl border p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        Add New Room
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                            placeholder="Room Number"
                            className="border rounded-lg p-2"
                            value={form.roomNumber}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    roomNumber: e.target.value
                                })
                            }
                        />

                        <input
                            type="number"
                            placeholder="Total Beds"
                            className="border rounded-lg p-2"
                            value={form.totalBeds}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    totalBeds: e.target.value
                                })
                            }
                        />

                        <input
                            placeholder="Note (optional)"
                            className="border rounded-lg p-2"
                            value={form.note}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    note: e.target.value
                                })
                            }
                        />

                        <button
                            onClick={addRoom}
                            className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
                        >
                            Add Room
                        </button>
                    </div>
                </div>

                {/* ================= ROOMS TABLE ================= */}
                <div className="bg-white rounded-2xl border p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        Rooms
                    </h2>

                    {loading ? (
                        <p className="text-gray-500 text-center">
                            Loading rooms…
                        </p>
                    ) : rooms.length === 0 ? (
                        <p className="text-gray-500 text-center">
                            No rooms added yet.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-gray-500">
                                        <th className="p-2 text-left">
                                            Room
                                        </th>
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
                                    {rooms.map((r) => (
                                        <tr
                                            key={r._id}
                                            className="border-b hover:bg-gray-50"
                                        >
                                            <td className="p-2">
                                                {r.roomNumber}
                                            </td>

                                            <td className="p-2 text-center">
                                                {r.totalBeds}
                                            </td>

                                            <td className="p-2 text-center">
                                                {r.occupiedBeds}
                                            </td>

                                            <td className="p-2 text-center font-semibold">
                                                {r.availableBeds}
                                            </td>

                                            <td className="p-2 text-center space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedRoom(r);
                                                        setOccupiedBeds(
                                                            r.occupiedBeds
                                                        );
                                                    }}
                                                    className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                >
                                                    Update
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        deleteRoom(r)
                                                    }
                                                    className="px-3 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                                                >
                                                    Delete
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

            {/* ================= OCCUPANCY MODAL ================= */}
            {selectedRoom && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-96">
                        <h3 className="text-lg font-semibold mb-4">
                            Update Occupancy – Room{" "}
                            {selectedRoom.roomNumber}
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
                                onClick={() =>
                                    setSelectedRoom(null)
                                }
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
