"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createMaintenanceRequest,
  getMyPayments,
  getMyRequests,
  type CreateRequestPayload,
  type ResidentPayment,
  type ResidentRequest,
} from "@/services/resident.service";

const INITIAL_FORM: CreateRequestPayload = {
  title: "",
  description: "",
  priority: "medium",
};

export function useResidentDashboard() {
  const [requests, setRequests] = useState<ResidentRequest[]>([]);
  const [payments, setPayments] = useState<ResidentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateRequestPayload>(INITIAL_FORM);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [nextRequests, nextPayments] = await Promise.all([getMyRequests(), getMyPayments()]);
      setRequests(nextRequests);
      setPayments(nextPayments);
    } catch {
      setError("Unable to load resident dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const submitRequest = useCallback(async () => {
    if (!form.title || !form.description) {
      setError("Title and description are required");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createMaintenanceRequest(form);
      setForm(INITIAL_FORM);
      setShowForm(false);
      await loadDashboard();
    } catch {
      setError("Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  }, [form, loadDashboard]);

  const openRequestCount = useMemo(() => requests.filter((item) => item.status !== "resolved").length, [requests]);

  const totalDue = useMemo(
    () => payments.filter((item) => item.status !== "paid").reduce((sum, item) => sum + item.amount, 0),
    [payments],
  );

  return {
    requests,
    payments,
    loading,
    submitting,
    showForm,
    setShowForm,
    form,
    setForm,
    error,
    setError,
    submitRequest,
    openRequestCount,
    totalDue,
  };
}
