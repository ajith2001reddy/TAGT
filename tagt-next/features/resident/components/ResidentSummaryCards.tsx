import { Card } from "@/components/ui/Card";

export function ResidentSummaryCards({ openRequestCount, totalDue }: { openRequestCount: number; totalDue: number }) {
  const isDue = totalDue > 0;

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-5">
        <p className="mb-2 text-xs uppercase tracking-widest text-white/30">Open Requests</p>
        <p className="text-3xl font-bold text-white">{openRequestCount}</p>
      </Card>
      <div className={`rounded-2xl border p-5 ${isDue ? "border-amber-400/15 bg-amber-400/5" : "border-emerald-400/15 bg-emerald-400/5"}`}>
        <p className={`mb-2 text-xs uppercase tracking-widest ${isDue ? "text-amber-400/60" : "text-emerald-400/60"}`}>
          Amount Due
        </p>
        <p className={`text-3xl font-bold ${isDue ? "text-amber-400" : "text-emerald-400"}`}>${totalDue.toLocaleString()}</p>
      </div>
    </div>
  );
}
