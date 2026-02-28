import { Link } from "react-router-dom"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h1 className="text-5xl font-black">PG / Hotel Multi-Tenant SaaS</h1>
        <p className="mt-4 text-white/60 max-w-2xl">Production-grade platform for providers, owners, and residents with secure property-based isolation, analytics, payments, and maintenance workflows.</p>
        <div className="mt-8 flex gap-3">
          <Link to="/register" className="px-5 py-3 bg-violet-500 rounded-xl">Start as Owner</Link>
          <Link to="/login" className="px-5 py-3 bg-white/10 rounded-xl">Login</Link>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-4">
        {[
          ["Multi-Tenant Isolation", "Every room, payment, resident, and request is scoped by propertyId."],
          ["Role-Based Workflows", "super_admin, owner, and resident dashboards with protected routes."],
          ["Scale Ready", "Designed for 10k+ properties and 100k+ residents with lean paginated APIs."],
        ].map(([title, text]) => (
          <div key={title} className="border border-white/10 rounded-2xl p-5 bg-white/[0.02]">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-white/60 mt-2">{text}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
