import { api } from "@/lib/api";

export interface Lease {
    _id: string;
    propertyId: { _id: string; name: string; address: string };
    residentId: { _id: string; name: string; email: string };
    fileUrl: string;
    signedFileUrl?: string;
    status: "pending" | "signed" | "rejected";
    signature?: {
        residentName: string;
        acceptedAt: string;
        ipAddress: string;
        userAgent: string;
        typedName: string;
    };
    createdAt: string;
}

export async function fetchLeases(): Promise<Lease[]> {
    const response = await api.get("/v2/leases");
    return response.data?.data || [];
}

export async function uploadLease(payload: { residentId: string; propertyId: string; fileUrl: string }) {
    return api.post("/v2/leases", payload);
}

export async function fetchMyActiveLease(): Promise<Lease | null> {
    const response = await api.get("/v2/resident/lease/active");
    return response.data?.data || null;
}

export async function signLease(payload: { typedName: string; ipAddress?: string; userAgent?: string }) {
    return api.post("/v2/resident/lease/sign", payload);
}
