export function StatCard({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) {
    return (
        <div className="rounded-xl bg-neutral-900 p-6 border border-white/10">
            <p className="text-sm text-white/50">{label}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
    );
}