import { useEffect, useState } from "react";
import { fetchRooms, fetchRoomStats, Room, RoomStats } from "./rooms.service";

export function useRooms() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [stats, setStats] = useState<RoomStats | null>(null);
    const [loading, setLoading] = useState(true);

    async function load() {
        try {
            const [roomsData, statsData] = await Promise.all([
                fetchRooms(),
                fetchRoomStats()
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
        load().finally(() => setLoading(false));
    }, []);

    return { rooms, stats, loading, reload: load };
}