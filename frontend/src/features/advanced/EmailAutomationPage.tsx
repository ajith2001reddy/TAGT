import { ListPanel, PageShell, SectionCard } from "./Shared"

export default function EmailAutomationPage() {
  return (
    <PageShell title="Email Notification System" description="Template orchestration for reminders, escalations, and lifecycle campaigns.">
      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard title="Templates" subtitle="Active transactional + lifecycle templates" metric="24" />
        <SectionCard title="Sent Today" subtitle="Total outbound notifications" metric="1,248" />
        <SectionCard title="Open Rate" subtitle="30-day aggregate open performance" metric="61%" />
      </div>
      <ListPanel title="Priority automations" items={[
        "D-5 rent reminder sequence",
        "Maintenance completion follow-up",
        "Lease renewal campaign",
        "Welcome + onboarding flow for new residents",
      ]} />
    </PageShell>
  )
}
