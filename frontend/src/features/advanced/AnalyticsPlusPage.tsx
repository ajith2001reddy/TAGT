import { ListPanel, PageShell, SectionCard } from "./Shared"

export default function AnalyticsPlusPage() {
  return (
    <PageShell title="Enhanced Analytics Dashboard" description="Decision-grade intelligence across finance, operations, and resident experience.">
      <div className="grid gap-4 md:grid-cols-4">
        <SectionCard title="Revenue Growth" subtitle="Month-over-month" metric="+8.7%" />
        <SectionCard title="Collection Rate" subtitle="On-time payments" metric="96.1%" />
        <SectionCard title="Churn Risk" subtitle="Residents above risk threshold" metric="11%" />
        <SectionCard title="Avg Resolution" subtitle="Maintenance completion time" metric="22h" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ListPanel title="Insight packs" items={[
          "Revenue leakage detector",
          "Room utilization heatmap by block",
          "Churn probability timeline",
          "Payment behavior cohorts",
        ]} />
        <ListPanel title="Actionable recommendations" items={[
          "Increase outreach to residents with 2+ pending payments",
          "Shift maintenance staff to high-density complaint zones",
          "Prioritize renewal offers for low-risk long-tenure residents",
        ]} />
      </div>
    </PageShell>
  )
}
