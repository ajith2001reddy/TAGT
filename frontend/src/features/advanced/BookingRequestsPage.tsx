import { ListPanel, PageShell, SectionCard } from "./Shared"

export default function BookingRequestsPage() {
  return (
    <PageShell title="Booking Request Flow" description="Track incoming applications from inquiry to approval.">
      <div className="grid gap-4 md:grid-cols-4">
        <SectionCard title="New" subtitle="Unreviewed requests" metric="16" />
        <SectionCard title="Screening" subtitle="Background / docs in progress" metric="9" />
        <SectionCard title="Approved" subtitle="Ready for onboarding" metric="21" />
        <SectionCard title="Declined" subtitle="Rejected this month" metric="3" />
      </div>
      <ListPanel title="Flow stages" items={[
        "Inquiry submitted",
        "Document verification",
        "Background + risk checks",
        "Admin decision + room assignment",
      ]} />
import { PageShell, SectionCard } from "./Shared"

export default function BookingRequestsPage() {
  return (
    <PageShell title="BookingRequests" description="Enterprise-grade module with premium UX scaffolding and ready integration points.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SectionCard title="Command Center" subtitle="Track KPIs, actions, and health checks in one place." />
        <SectionCard title="Automation" subtitle="Configure workflows, reminders, and role-based actions." />
        <SectionCard title="Transparency" subtitle="Timeline-style visibility for audit trails and operations." />
      </div>
    </PageShell>
  )
}
