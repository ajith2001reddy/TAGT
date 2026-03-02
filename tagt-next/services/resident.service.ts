import api from "@/services/api";

export type ResidentRequest = {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
};

export type ResidentPayment = {
  _id: string;
  amount: number;
  status: string;
  month?: string;
  dueDate?: string;
};

export type CreateRequestPayload = {
  title: string;
  description: string;
  priority: string;
};

export async function getMyRequests(): Promise<ResidentRequest[]> {
  const response = await api.get<{ requests: ResidentRequest[] }>("/requests/me");
  return response.data.requests ?? [];
}

export async function getMyPayments(): Promise<ResidentPayment[]> {
  const response = await api.get<{ payments: ResidentPayment[] }>("/payments/my");
  return response.data.payments ?? [];
}

export async function createMaintenanceRequest(payload: CreateRequestPayload): Promise<void> {
  await api.post("/requests", payload);
}
