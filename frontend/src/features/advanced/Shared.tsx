export function SectionCard({ title, subtitle, metric }: { title: string; subtitle: string; metric?: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-widest text-violet-300/70">{title}</p>
            <p className="mt-2 text-sm text-white/60">{subtitle}</p>
            {metric && <p className="mt-3 text-xl font-bold text-white">{metric}</p>}
        </div>
    )
}

export function PageShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
    return (
        <div className="space-y-5 max-w-6xl">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-cyan-500/5 p-5">
                <h1 className="text-2xl font-bold text-white">{title}</h1>
                <p className="text-sm text-white/50 mt-1">{description}</p>
            </div>
            {children}
        </div>
    )
}

export function ListPanel({ title, items }: { title: string; items: string[] }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
                {items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-300/80" />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
