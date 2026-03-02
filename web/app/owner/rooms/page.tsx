"use client";

import { useState } from "react";
import { useRooms } from "@/features/owner/useRooms";
import { createRoom, deleteRoom } from "@/features/owner/rooms.service";

export default function RoomsPage() {
    const { rooms, loading, reload } = useRooms();

    const [roomNumber, setRoomNumber] = useState("");
    const [rent, setRent] = useState("");
    const [beds, setBeds] = useState("");

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();

        await createRoom({
            roomNumber,
            rent: Number(rent),
            totalBeds: Number(beds),
        });

        setRoomNumber("");
        setRent("");
        setBeds("");
        reload();
    }

    async function handleDelete(id: string) {
        await deleteRoom(id);
        reload();
    }

    if (loading) return <p>Loading rooms...</p>;

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">Rooms</h1>

            <form onSubmit={handleCreate} className="space-y-3 max-w-md">
                <input
                    placeholder="Room Number"
                    className="w-full p-2 bg-neutral-800 rounded"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    required
                />

                <input
                    placeholder="Rent"
                    type="number"
                    className="w-full p-2 bg-neutral-800 rounded"
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
                    required
                />

                <input
                    placeholder="Total Beds"
                    type="number"
                    className="w-full p-2 bg-neutral-800 rounded"
                    value={beds}
                    onChange={(e) => setBeds(e.target.value)}
                    required
                />

                <button className="bg-violet-600 px-4 py-2 rounded">
                    Add Room
                </button>
            </form>

            <div className="space-y-3">
                {rooms.map((room) => (
                    <div
                        key={room._id}
                        className="flex justify-between items-center bg-neutral-900 p-4 rounded"
                    >
                        <div>
                            <p className="font-semibold">{room.roomNumber}</p>
                            <p className="text-sm text-white/50">
                                ₹{room.rent} | {room.occupiedBeds}/{room.totalBeds} beds
                            </p>
                        </div>

                        <button
                            onClick={() => handleDelete(room._id)}
                            className="text-red-500"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}