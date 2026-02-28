import { ListPanel, PageShell, SectionCard } from "./Shared"

export default function RealTimeHubPage() {
  return (
    <PageShell title="Real-Time Operations Hub" description="Socket-powered event readiness board for transparent live operations.">
      <div className="grid gap-4 md:grid-cols-4">
        <SectionCard title="Events/min" subtitle="Current event throughput" metric="182" />
        <SectionCard title="Connected Clients" subtitle="Live dashboard subscribers" metric="43" />
        <SectionCard title="Latency" subtitle="Average event delivery latency" metric="84ms" />
        <SectionCard title="Failed Events" subtitle="Last 24h failures" metric="0.4%" />
      </div>
      <ListPanel title="Live channels" items={[
        "payments.updated",
        "requests.status.changed",
        "resident.created",
        "room.maintenance.toggled",
      ]} />
    </PageShell>
  )
}
