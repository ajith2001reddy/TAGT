import { ListPanel, PageShell, SectionCard } from "./Shared"

export default function MarketplacePage() {
  return (
    <PageShell title="Public Marketplace" description="Public-facing inventory channel for discovery, conversion, and booking.">
      <div className="grid gap-4 md:grid-cols-4">
        <SectionCard title="Live Listings" subtitle="Units currently visible" metric="76" />
        <SectionCard title="Leads / week" subtitle="Average inbound prospects" metric="312" />
        <SectionCard title="Conversion" subtitle="Lead-to-booking" metric="12.8%" />
        <SectionCard title="Featured 3D Tours" subtitle="Interactive hero inventory" metric="18" />
      </div>
      <ListPanel title="Marketplace capabilities" items={[
        "Search + filter by location, price, and amenities",
        "3D hero / virtual tour integration",
        "Instant booking request submission",
        "SEO-friendly listing pages",
      ]} />
import { PageShell, SectionCard } from "./Shared"

export default function MarketplacePage() {
  return (
    <PageShell title="Marketplace" description="Enterprise-grade module with premium UX scaffolding and ready integration points.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SectionCard title="Command Center" subtitle="Track KPIs, actions, and health checks in one place." />
        <SectionCard title="Automation" subtitle="Configure workflows, reminders, and role-based actions." />
        <SectionCard title="Transparency" subtitle="Timeline-style visibility for audit trails and operations." />
      </div>
    </PageShell>
  )
}
