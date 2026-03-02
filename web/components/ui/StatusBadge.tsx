export function StatusBadge({ status }: { status: string }) {
    const classMap: Record<string, string> = {
        paid: "badge-paid",
        pending: "badge-pending",
        overdue: "badge-overdue",
        failed: "badge-failed",
        "in-progress": "badge-pending",
        resolved: "badge-paid",
    };

    return (
        <span className={`badge ${classMap[status] || "badge-pending"}`}>
            {status}
        </span>
    );
}