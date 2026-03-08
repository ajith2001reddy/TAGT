import { api } from "@/lib/api";

export interface UserProfile {
    _id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    role: "super_admin" | "owner" | "resident";
    isActive: boolean;
    firebaseUid?: string;
    propertyId?: any;
    roomId?: any;
    bedId?: any;
    propertyIds?: string[];
    isPasswordSet: boolean;
}

export async function fetchProfile(): Promise<UserProfile> {
    const response = await api.get("/v2/profile");
    return response.data.data;
}

export async function updateProfile(data: { name?: string; phoneNumber?: string }): Promise<UserProfile> {
    const response = await api.put("/v2/profile", data);
    return response.data.data;
}

export async function changePassword(data: { currentPassword?: string; newPassword: string }) {
    return api.post("/v2/profile/change-password", data);
}

export async function adminUpdateUser(id: string, data: Partial<UserProfile>) {
    return api.put(`/v2/admin/users/${id}`, data);
}
