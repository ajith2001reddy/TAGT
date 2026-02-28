import { ListPanel, PageShell, SectionCard } from "./Shared"

export default function NotificationCenterPage() {
  return (
    <PageShell title="In-App Notification Center" description="Operational signal hub for admins, staff, and residents.">
      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard title="Unread" subtitle="Pending actions" metric="27" />
        <SectionCard title="Critical" subtitle="High-priority alerts" metric="4" />
        <SectionCard title="Delivery Rate" subtitle="Push + email successful delivery" metric="99.2%" />
      </div>
      <ListPanel title="Live streams" items={[
        "Payment overdue reminders",
        "Maintenance escalation updates",
        "Booking approvals / declines",
        "Resident verification prompts",
      ]} />
    </PageShell>
  )
}
