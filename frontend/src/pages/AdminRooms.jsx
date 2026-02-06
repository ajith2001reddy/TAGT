import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function AdminRooms() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        roomNumber: "",
        rent: "",
        totalBeds: "",
        note: "",
    });

    /* ================= FETCH ROOMS ================= */
    const fetchRooms = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/rooms");
            setRooms(res.data?.rooms || []);
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
        if (!form.roomNumber || !form.rent || !form.totalBeds) {
            toast.error("Room number, rent, and total beds are required");
            return;
        }

        if (Number(form.rent) <= 0 || Number(form.totalBeds) <= 0) {
            toast.error("Rent and total beds must be greater than 0");
            return;
        }

        try {
            await api.post("/rooms", {
                roomNumber: form.roomNumber,
                rent: Number(form.rent),
                totalBeds: Number(form.totalBeds),
                note: form.note,
            });

            toast.success("Room added successfully");
            setForm({ roomNumber: "", rent: "", totalBeds: "", note: "" });
            fetchRooms();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add room");
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
        <div className="space-y-10 text-white">
            {/* HEADER */}
            <div>
                <h1 className="text-3xl font-bold">Rooms & Bed Management</h1>
                <p className="text-gray-400 mt-1">
                    Manage rooms, rent, and capacity
                </p>
            </div>

            {/* ================= ADD ROOM ================= */}
            <div className="bg-white/10 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">Add New Room</h2>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <input
                        placeholder="Room Number"
                        className="bg-black/30 border border-white/10 rounded-lg p-2 text-white"
                        value={form.roomNumber}
                        onChange={(e) =>
                            setForm({ ...form, roomNumber: e.target.value })
                        }
                    />

                    <input
                        type="number"
                        placeholder="Rent"
                        className="bg-black/30 border border-white/10 rounded-lg p-2 text-white"
                        value={form.rent}
                        onChange={(e) => setForm({ ...form, rent: e.target.value })}
                    />

                    <input
                        type="number"
                        placeholder="Total Beds"
                        className="bg-black/30 border border-white/10 rounded-lg p-2 text-white"
                        value={form.totalBeds}
                        onChange={(e) =>
                            setForm({ ...form, totalBeds: e.target.value })
                        }
                    />

                    <input
                        placeholder="Note (optional)"
                        className="bg-black/30 border border-white/10 rounded-lg p-2 text-white"
                        value={form.note}
                        onChange={(e) => setForm({ ...form, note: e.target.value })}
                    />

                    <button
                        onClick={addRoom}
                        className="bg-blue-600 hover:bg-blue-700 transition rounded-lg px-4 py-2 font-semibold"
                    >
                        Add Room
                    </button>
                </div>
            </div>

            {/* ================= ROOMS TABLE ================= */}
            <div className="bg-white/10 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">Rooms</h2>

                {loading ? (
                    <p className="text-gray-400 text-center">Loading rooms…</p>
                ) : rooms.length === 0 ? (
                    <p className="text-gray-400 text-center">No rooms added yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10 text-gray-400">
                                    <th className="p-2 text-left">Room</th>
                                    <th className="p-2 text-center">Rent</th>
                                    <th className="p-2 text-center">Total Beds</th>
                                    <th className="p-2 text-center">Occupied</th>
                                    <th className="p-2 text-center">Available</th>
                                    <th className="p-2 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.map((room) => {
                                    const availableBeds =
                                        room.totalBeds - room.occupiedBeds;

                                    return (
                                        <tr
                                            key={room._id}
                                            className="border-b border-white/5 hover:bg-white/5 transition"
                                        >
                                            <td className="p-2">{room.roomNumber}</td>
                                            <td className="p-2 text-center">₹{room.rent}</td>
                                            <td className="p-2 text-center">{room.totalBeds}</td>
                                            <td className="p-2 text-center">{room.occupiedBeds}</td>
                                            <td className="p-2 text-center font-semibold">
                                                {availableBeds}
                                            </td>
                                            <td className="p-2 text-center">
                                                <button
                                                    onClick={() => deleteRoom(room)}
                                                    className="px-3 py-1 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition"
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
    );
}
