import { api } from "@/lib/api";

export interface Bed {
    _id: string;
    roomId: string;
    propertyId: string;
    bedNumber: string;
    status: "available" | "occupied" | "maintenance";
    residentId?: {
        _id: string;
        name: string;
        email: string;
    } | null;
}

export interface Room {
    _id: string;
    roomNumber: string;
    rent: number;
    totalBeds: number;
    occupiedBeds: number;
    beds?: string[] | Bed[];
}

export interface RoomStats {
    totalRooms: number;
    totalBeds: number;
    occupiedBeds: number;
    avgRent: number;
    totalRent: number;
}

export async function fetchRooms(): Promise<Room[]> {
    const response = await api.get("/v2/rooms");
    return response.data?.data || [];
}

export async function createRoom(payload: {
    roomNumber: string;
    rent: number;
    totalBeds: number;
}) {
    return api.post("/v2/rooms", {
        roomNumber: payload.roomNumber,
        rent: payload.rent,
        totalBeds: payload.totalBeds,
    });
}

export async function deleteRoom(id: string) {
    return api.delete(`/v2/rooms/${id}`);
}

export async function fetchBeds(params: { propertyId?: string; roomId?: string }): Promise<Bed[]> {
    const response = await api.get("/v2/beds", { params });
    return response.data?.data || [];
}

export async function fetchRoomStats(): Promise<RoomStats | null> {
    const response = await api.get("/v2/rooms/stats");
    return response.data?.data || null;
}

export async function assignResidentToBed(bedId: string, residentId: string) {
    return api.post(`/v2/beds/${bedId}/assign`, { residentId });
}

export async function updateBedStatus(bedId: string, status: Bed["status"]) {
    return api.patch(`/v2/beds/${bedId}/status`, { status });
}
