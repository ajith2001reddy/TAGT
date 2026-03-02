import { useEffect, useState } from "react";
import { fetchRooms, Room } from "./rooms.service";

export function useRooms() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        const data = await fetchRooms();
        setRooms(data);
    }

    useEffect(() => {
        load().finally(() => setLoading(false));
    }, []);

    return { rooms, loading, reload: load };
}