import api from "@/lib/api";

export type Room = {
    _id: string;
    roomNumber: string;
    rent: number;
    totalBeds: number;
    occupiedBeds: number;
};

export async function fetchRooms(): Promise<Room[]> {
    const { data } = await api.get("/rooms");
    return data.rooms;
}

export async function createRoom(payload: {
    roomNumber: string;
    rent: number;
    totalBeds: number;
}) {
    const { data } = await api.post("/rooms", payload);
    return data.room;
}

export async function deleteRoom(id: string) {
    await api.delete(`/rooms/${id}`);
}