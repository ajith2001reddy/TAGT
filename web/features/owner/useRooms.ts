import { useEffect, useState } from "react";
import { fetchRooms, fetchRoomStats, Room, RoomStats } from "./rooms.service";
import { useProperty } from "@/context/PropertyContext";

export function useRooms() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [stats, setStats] = useState<RoomStats | null>(null);
    const [loading, setLoading] = useState(true);
    const { property } = useProperty();

    async function load() {
        try {
            const propertyId = property?._id;
            const [roomsData, statsData] = await Promise.all([
                fetchRooms(propertyId),
                fetchRoomStats(propertyId)
            ]);
            setRooms(roomsData);
            setStats(statsData);
        } catch (err) {
            console.error("Failed to load rooms or stats", err);
            setRooms([]);
            setStats(null);
        }
    }

    useEffect(() => {
        Promise.resolve().then(() => {
            setLoading(true);
            load().finally(() => setLoading(false));
        });
    }, [property?._id]); // Re-fetch when selected property changes

    return { rooms, stats, loading, reload: load };
}