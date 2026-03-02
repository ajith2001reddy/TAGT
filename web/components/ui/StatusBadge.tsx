export function StatusBadge({ status }: { status: string }) {
    const styles = {
        paid: "bg-green-500/20 text-green-400",
        pending: "bg-yellow-500/20 text-yellow-400",
        overdue: "bg-red-500/20 text-red-400",
        failed: "bg-red-700/20 text-red-500",
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles] || "bg-neutral-700"}`}>
            {status}
        </span>
    );
}