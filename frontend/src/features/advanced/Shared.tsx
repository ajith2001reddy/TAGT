export function SectionCard({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-widest text-violet-300/70">{title}</p>
            <p className="mt-2 text-sm text-white/60">{subtitle}</p>
        </div>
    )
}

export function PageShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
    return (
        <div className="space-y-5 max-w-6xl">
            <div>
                <h1 className="text-2xl font-bold text-white">{title}</h1>
                <p className="text-sm text-white/40">{description}</p>
            </div>
            {children}
        </div>
    )
}
