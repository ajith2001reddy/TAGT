import { api } from "@/lib/api";

export interface Resident {
    _id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    alternateNumber?: string;
    gender?: string;
    aadhaarNumber?: string;
    companyName?: string;
    relation?: string;
    isActive?: boolean;
    propertyId?: {
        _id: string;
        name: string;
    } | string;
    roomId?: {
        _id: string;
        roomNumber: string;
        rent: number;
    };
    notes?: Array<{
        text: string;
        addedBy: string;
        addedAt: string;
    }>;
}

export interface ResidentHistory {
    resident: {
        name: string;
        email: string;
        roomId: { roomNumber: string; rent: number };
    };
    payments: Array<{
        _id: string;
        month: string;
        amount: number;
        status: string;
        lateFee?: number;
        paidAt?: string;
    }>;
}

export interface ResidentCreatePayload {
    name: string;
    email: string;
    phoneNumber?: string;
    alternateNumber?: string;
    gender?: string;
    aadhaarNumber?: string;
    companyName?: string;
    relation?: string;
    roomId: string | null;
}

export async function fetchResidents(): Promise<Resident[]> {
    const response = await api.get("/v2/residents");
    return response.data?.data || [];
}

export async function createResident(payload: ResidentCreatePayload) {
    return api.post("/v2/residents", payload);
}

export async function deactivateResident(id: string) {
    return api.patch(`/v2/residents/${id}/deactivate`);
}

export async function moveResidentRoom(id: string, newRoomId: string) {
    return api.patch(`/v2/residents/${id}/move-room`, { newRoomId });
}

export async function addResidentNote(id: string, note: string) {
    return api.post(`/v2/residents/${id}/notes`, { note });
}

export async function fetchResidentHistory(id: string): Promise<ResidentHistory | null> {
    const response = await api.get(`/v2/residents/${id}/history`);
    return response.data?.data || null;
}
export async function sendNotification(id: string, type: string, message: string) {
    return api.post(`/v2/residents/${id}/notification`, { type, message });
}
