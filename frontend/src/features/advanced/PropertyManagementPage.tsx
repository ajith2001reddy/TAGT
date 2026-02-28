import { ListPanel, PageShell, SectionCard } from "./Shared"

export default function PropertyManagementPage() {
  return (
    <PageShell title="Property Management System" description="Portfolio-wide visibility for occupancy, revenue, and maintenance readiness.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SectionCard title="Active Properties" subtitle="Total properties under management" metric="12" />
        <SectionCard title="Occupancy" subtitle="Current occupied units" metric="93.4%" />
        <SectionCard title="Monthly Rent Roll" subtitle="Expected billing this month" metric="$214,300" />
        <SectionCard title="Maintenance Blocks" subtitle="Units temporarily unavailable" metric="8" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ListPanel title="Recommended next actions" items={[
          "Launch a portfolio-level vacancy pricing strategy",
          "Convert low-performing units into premium tier inventory",
          "Create maintenance SLA alerts for properties over 72 hours",
        ]} />
        <ListPanel title="Governance checks" items={[
          "Lease expiry forecasting within 60/90/120 day windows",
          "Utility variance alerts by property cluster",
          "Audit occupancy anomalies and manual overrides",
        ]} />
      </div>
    </PageShell>
  )
}
