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
    // Note: To support this frontend, I'll need to create a simple `GET /v2/admin/verifications/pending` in the backend
    const res = await api.get("/v2/admin/verifications/pending");
    return res.data.data || [];
};

export const updateVerificationStatus = async (userId: string, status: "approved" | "rejected") => {
    // Backend expects `/v2/admin/verifications/:id/approve` and `/v2/admin/verifications/:id/reject`
    const route = status === "approved" ? "approve" : "reject";
    const res = await api.post(`/v2/admin/verifications/${userId}/${route}`);
    return res.data;
};
