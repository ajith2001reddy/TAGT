import { api } from "@/lib/api";

export interface Notification {
    _id: string;
    title: string;
    message: string;
    type: "payment" | "maintenance" | "support" | "system" | "resident";
    isRead: boolean;
    createdAt: string;
}

export async function fetchNotifications(limit = 20): Promise<Notification[]> {
    const { data } = await api.get("/v2/notifications", { params: { limit } });
    return data.data ?? [];
}

export async function markAsRead(id: string): Promise<void> {
    await api.patch(`/v2/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
    await api.patch("/v2/notifications/read-all");
}
