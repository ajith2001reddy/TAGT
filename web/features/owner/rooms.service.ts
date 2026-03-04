// web/features/owner/rooms.service.ts
// FIX: Updated /rooms → /v2/rooms and /rooms/stats → /v2/rooms/stats
// to match the actual backend v2 route registration.

import { api } from "@/lib/api";

export interface Room {
    _id: string;
    roomNumber: string;
    rent: number;
    totalBeds: number;
    occupiedBeds: number;
    status: "available" | "occupied" | "maintenance";
    propertyId: string;
    maintenanceMode?: boolean;
}

export interface Bed {
    _id: string;
    bedLabel: string;
    roomId: string;
    status: "available" | "occupied" | "reserved" | "maintenance";
    residentId?: string | null;
}

export interface RoomStats {
    totalRooms: number;
    totalBeds: number;
    occupiedBeds: number;
    avgRent: number;
    totalRent: number;
}

export async function fetchRooms(propertyId?: string): Promise<Room[]> {
    const params = propertyId ? { propertyId } : {};
    const response = await api.get("/v2/rooms", { params });
    return response.data?.data || [];
}

export async function createRoom(payload: {
    roomNumber: string;
    rent: number;
    totalBeds: number;
    propertyId?: string;
}) {
    return api.post("/v2/rooms", {
        roomNumber: payload.roomNumber,
        rent: payload.rent,
        totalBeds: payload.totalBeds,
        ...(payload.propertyId ? { propertyId: payload.propertyId } : {}),
    });
}

export async function deleteRoom(id: string) {
    return api.delete(`/v2/rooms/${id}`);               // FIXED: was /rooms/:id
}

export async function updateRoom(id: string, payload: Partial<Room>) {
    return api.put(`/v2/rooms/${id}`, payload);
}

export async function fetchBeds(params: { propertyId?: string; roomId?: string }): Promise<Bed[]> {
    const response = await api.get("/v2/beds", { params });
    return response.data?.data || [];
}

export async function fetchRoomStats(propertyId?: string): Promise<RoomStats | null> {
    const params = propertyId ? { propertyId } : {};
    const response = await api.get("/v2/rooms/stats", { params });
    return response.data?.data || null;
}

export async function assignResidentToBed(bedId: string, residentId: string) {
    return api.post(`/v2/beds/${bedId}/assign`, { residentId });
}

export async function updateBedStatus(bedId: string, status: Bed["status"]) {
    return api.patch(`/v2/beds/${bedId}/status`, { status });
}