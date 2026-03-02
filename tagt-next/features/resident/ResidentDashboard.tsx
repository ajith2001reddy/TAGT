"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { PaymentsList } from "@/features/resident/components/PaymentsList";
import { RequestForm } from "@/features/resident/components/RequestForm";
import { RequestList } from "@/features/resident/components/RequestList";
import { ResidentSummaryCards } from "@/features/resident/components/ResidentSummaryCards";
import { useResidentDashboard } from "@/features/resident/hooks/useResidentDashboard";

export default function ResidentDashboard() {
  const { user } = useAuth();
  const {
    requests,
    payments,
    loading,
    submitting,
    showForm,
    setShowForm,
    form,
    setForm,
    error,
    submitRequest,
    openRequestCount,
    totalDue,
  } = useResidentDashboard();

  const firstName = useMemo(() => user?.name?.split(" ")[0] ?? "Resident", [user?.name]);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Hello, {firstName} 👋</h1>
        <p className="mt-0.5 text-sm text-white/30">Here&apos;s what&apos;s happening with your unit</p>
      </div>

      <ResidentSummaryCards openRequestCount={openRequestCount} totalDue={totalDue} />

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/70">Maintenance Requests</h2>
          <button
            onClick={() => setShowForm((previous) => !previous)}
            className="flex items-center gap-1 text-xs text-violet-400 transition hover:text-violet-300"
          >
            <span className="text-base leading-none">{showForm ? "✕" : "+"}</span>
            {showForm ? "Cancel" : "New request"}
          </button>
        </div>

        {showForm ? (
          <RequestForm
            form={form}
            onChange={setForm}
            onSubmit={submitRequest}
            submitting={submitting}
            error={error}
          />
        ) : null}

        <RequestList loading={loading} requests={requests} />
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-semibold text-white/70">Recent Payments</h2>
        <PaymentsList payments={payments} />
      </Card>
    </div>
  );
}
