import { ListPanel, PageShell, SectionCard } from "./Shared"

export default function ResidentProfilesPage() {
  return (
    <PageShell title="Resident Profile Hub" description="Unified profile system for payment behavior, support history, and lifecycle tracking.">
      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard title="Profiles Complete" subtitle="Residents with full profile metadata" metric="88%" />
        <SectionCard title="At-Risk Residents" subtitle="Flagged by churn + arrears signals" metric="14" />
        <SectionCard title="Avg Satisfaction" subtitle="Survey + ticket resolution sentiment" metric="4.6/5" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ListPanel title="Profile sections" items={[
          "Identity + contact verification",
          "Lease timeline + renewal prediction",
          "Payment reliability index",
          "Maintenance interaction history",
        ]} />
        <ListPanel title="Automation hooks" items={[
          "Escalate unresolved issues after SLA breach",
          "Auto-remind residents before due dates",
          "Trigger retention outreach for churn risk > 60",
        ]} />
      </div>
    </PageShell>
  )
}
