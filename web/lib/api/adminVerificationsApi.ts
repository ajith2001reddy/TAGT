import { api } from "../api";

export interface PendingVerification {
    _id: string;
    name: string;
    email: string;
    role: "owner" | "resident";
    verification: {
        status: "pending" | "approved" | "rejected";
        selfiePhoto: string;
        idFront: string;
        idBack: string;
        propertyDocument?: string;
        aiScore: number;
        fraudRisk: "low" | "medium" | "high" | "unknown";
    };
    createdAt: string;
}

export const fetchPendingVerifications = async (): Promise<PendingVerification[]> => {
    // Note: To support this frontend, I'll need to create a simple `GET /admin/verifications/pending` in the backend
    const res = await api.get("/admin/verifications/pending");
    return res.data.data || [];
};

export const updateVerificationStatus = async (userId: string, status: "approved" | "rejected") => {
    const res = await api.post(`/admin/${status}/${userId}`);
    return res.data;
};
