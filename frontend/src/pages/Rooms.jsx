import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/axios";

/**
 * Roomss Management (DARK THEME FIXED)
 * Phase 4 – Rooms & Bed Management (Admin)
 */

export default function Roomss() {
    const [roomss, setRoomss] = useState([]);
    const [loading, setLoading] = useState(true);

    /* ===== ADD ROOM FORM ===== */
    const [form, setForm] = useState({
        roomsNumber: "",
        totalBeds: "",
        note: ""
    });

    /* ===== OCCUPANCY MODAL ===== */
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [occupiedBeds, setOccupiedBeds] = useState("");

    /* ================= FETCH ROOMSS ================= */
    const fetchRoomss = async () => {
        try {
            setLoading(true);
            const res = await api.get("/roomss");
            setRoomss(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load roomss");
            setRoomss([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoomss();
    }, []);

    /* ================= ADD ROOM ================= */
    const addRoom = async () => {
        if (!form.roomsNumber || !form.totalBeds) {
            toast.error("Room number and total beds are required");
            return;
        }

        try {
            await api.post("/roomss", {
                roomsNumber: form.roomsNumber,
                totalBeds: Number(form.totalBeds),
                note: form.note
            });

            toast.success("Room added");
            setForm({ roomsNumber: "", totalBeds: "", note: "" });
            fetchRoomss();
        } catch (err) {
            console.error(err);
            toast.error("Failed to add room");
        }
    };

    /* ================= UPDATE OCCUPANCY ================= */
    const updateOccupancy = async () => {
        if (occupiedBeds === "" || occupiedBeds < 0) {
            toast.error("Enter a valid occupied beds value");
            return;
        }

        try {
            await api.put(
                `/roomss/${selectedRoom._id}/occupancy`,
                { occupiedBeds: Number(occupiedBeds) }
            );

            toast.success("Occupancy updated");
            setSelectedRoom(null);
            setOccupiedBeds("");
            fetchRoomss();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update occupancy");
        }
    };

    /* ================= DELETE ROOM ================= */
    const deleteRoom = async (room) => {
        if (
            !window.confirm(
                `Delete room ${room.roomsNumber}? This cannot be undone.`
            )
        )
            return;

        try {
            await api.delete(`/roomss/${room._id}`);
            toast.success("Room deleted");
            fetchRoomss();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete room");
        }
    };

    return (
        <DashboardLayout>
            <h2 className="text-2xl font-bold mb-6">
                Room & Bed Management
            </h2>

            {/* ADD ROOM */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                <input
                    placeholder="Room Number"
                    className="bg-black/30 text-gray-100 border border-white/10 p-2 rounded focus:outline-none"
                    value={form.roomsNumber}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            roomsNumber: e.target.value
                        })
                    }
                />

                <input
                    type="number"
                    placeholder="Total Beds"
                    className="bg-black/30 text-gray-100 border border-white/10 p-2 rounded focus:outline-none"
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
                    className="bg-black/30 text-gray-100 border border-white/10 p-2 rounded focus:outline-none"
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    Add Room
                </button>
            </div>

            {/* ROOM TABLE */}
            {loading ? (
                <p className="text-center text-gray-400">
                    Loading…
                </p>
            ) : roomss.length === 0 ? (
                <p className="text-center text-gray-400">
                    No rooms added yet.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-gray-200 border border-white/10 rounded-lg">
                        <thead className="bg-white/10">
                            <tr>
                                <th className="p-3">Room</th>
                                <th className="p-3">Total Beds</th>
                                <th className="p-3">Occupied</th>
                                <th className="p-3">Available</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {roomss.map((r) => (
                                <tr
                                    key={r._id}
                                    className="border-t border-white/10 text-center hover:bg-white/5"
                                >
                                    <td className="p-3">{r.roomsNumber}</td>
                                    <td className="p-3">{r.totalBeds}</td>
                                    <td className="p-3">{r.occupiedBeds}</td>
                                    <td className="p-3 font-semibold">
                                        {r.availableBeds}
                                    </td>
                                    <td className="p-3 space-x-2">
                                        <button
                                            onClick={() => {
                                                setSelectedRoom(r);
                                                setOccupiedBeds(
                                                    r.occupiedBeds
                                                );
                                            }}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                                        >
                                            Update
                                        </button>

                                        <button
                                            onClick={() => deleteRoom(r)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
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

            {/* OCCUPANCY MODAL */}
            {selectedRoom && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-xl w-96">
                        <h3 className="font-bold mb-3">
                            Update Occupancy – Room{" "}
                            {selectedRoom.roomsNumber}
                        </h3>

                        <input
                            type="number"
                            className="w-full bg-black/30 text-gray-100 border border-white/10 p-2 mb-4 rounded"
                            value={occupiedBeds}
                            onChange={(e) =>
                                setOccupiedBeds(e.target.value)
                            }
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() =>
                                    setSelectedRoom(null)
                                }
                                className="text-gray-400 hover:text-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={updateOccupancy}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
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
