import { api } from "@/lib/api";

export interface Staff {
    _id: string;
    name: string;
    email: string;
    role: "manager" | "accountant" | "staff";
    status: "active" | "invited";
}

export async function fetchStaffList(propertyId: string | null): Promise<Staff[]> {
    const { data } = await api.get("/v2/staff", { params: { propertyId } });
    return data.data ?? [];
}

export async function inviteStaff(staffData: Partial<Staff>): Promise<Staff> {
    const { data } = await api.post("/v2/staff/invite", staffData);
    return data.data;
}

export async function removeStaff(id: string): Promise<void> {
    await api.delete(`/v2/staff/${id}`);
}
