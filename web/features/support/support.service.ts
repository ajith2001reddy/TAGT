import { api } from "@/lib/api";

export type TicketStatus = "open" | "in_progress" | "resolved";
export type TicketCategory =
    | "payment"
    | "technical"
    | "maintenance"
    | "maintenance_escalation"
    | "account"
    | "billing"
    | "other";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface SupportTicket {
    _id: string;
    title: string;
    category: TicketCategory;
    priority: TicketPriority;
    message: string;
    status: TicketStatus;
    role: "resident" | "owner";
    createdAt: string;
    updatedAt: string;
    userId?: { _id: string; name: string; email: string };
    propertyId?: { _id: string; name: string; city: string };
    resolvedBy?: { _id: string; name: string };
    resolvedAt?: string;
    internalNotes?: Array<{ note: string; addedBy?: { name: string }; addedAt: string }>;
}

export interface SupportMessage {
    _id: string;
    ticketId: string;
    senderId: { _id: string; name: string; role: string };
    senderRole: string;
    message: string;
    isInternal: boolean;
    createdAt: string;
}

export interface TicketSummary {
    open: number;
    in_progress: number;
    resolved: number;
}

// ── User endpoints ──────────────────────────────────────────
export async function createTicket(payload: {
    title: string;
    category: TicketCategory;
    priority: TicketPriority;
    message: string;
}): Promise<SupportTicket> {
    const { data } = await api.post("/v2/support/tickets", payload);
    return data.data;
}

export async function fetchMyTickets(params?: {
    status?: TicketStatus;
    category?: TicketCategory;
}): Promise<SupportTicket[]> {
    const { data } = await api.get("/v2/support/tickets", { params });
    return data.data ?? [];
}

export async function fetchTicket(id: string): Promise<{ ticket: SupportTicket; messages: SupportMessage[] }> {
    const { data } = await api.get(`/v2/support/tickets/${id}`);
    return data.data;
}

export async function replyToTicket(id: string, message: string): Promise<SupportMessage> {
    const { data } = await api.post(`/v2/support/tickets/${id}/reply`, { message });
    return data.data;
}

// ── Admin endpoints ─────────────────────────────────────────
export async function fetchAllTickets(params?: {
    status?: TicketStatus;
    category?: TicketCategory;
    priority?: TicketPriority;
    role?: string;
    page?: number;
    limit?: number;
}): Promise<{ tickets: SupportTicket[]; summary: TicketSummary; total: number }> {
    const { data } = await api.get("/v2/support/tickets/all", { params });
    return { tickets: data.data ?? [], summary: data.summary, total: data.pagination?.total ?? 0 };
}

export async function updateTicketStatus(id: string, status: TicketStatus): Promise<SupportTicket> {
    const { data } = await api.patch(`/v2/support/tickets/${id}/status`, { status });
    return data.data;
}

export async function addInternalNote(id: string, note: string): Promise<SupportTicket["internalNotes"]> {
    const { data } = await api.post(`/v2/support/tickets/${id}/note`, { note });
    return data.data;
}

// ── Helpers ─────────────────────────────────────────────────
export const CATEGORY_LABELS: Record<TicketCategory, string> = {
    payment: "Payment Problem",
    technical: "Technical Bug",
    maintenance: "Maintenance Issue",
    maintenance_escalation: "⚠️ Escalate Maintenance",
    account: "Account Issue",
    billing: "Billing",
    other: "Other",
};

export const PRIORITY_COLORS: Record<TicketPriority, string> = {
    low: "#4caf50",
    medium: "#ff9800",
    high: "#f44336",
    urgent: "#b71c1c",
};

export const STATUS_COLORS: Record<TicketStatus, string> = {
    open: "#00d4ff",
    in_progress: "#ff9800",
    resolved: "#4caf50",
};
