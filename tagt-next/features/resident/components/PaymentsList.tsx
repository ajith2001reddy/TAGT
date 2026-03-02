import type { ResidentPayment } from "@/services/resident.service";

export function PaymentsList({ payments }: { payments: ResidentPayment[] }) {
  if (!payments.length) return <p className="py-6 text-center text-sm text-white/20">No payments yet</p>;

  return (
    <div className="space-y-2">
      {payments.slice(0, 5).map((payment) => (
        <div key={payment._id} className="flex items-center gap-4 border-b border-white/[0.04] py-2.5 last:border-0">
          <div className="flex-1">
            <p className="text-sm text-white/60">{payment.month ?? "Payment"}</p>
            {payment.dueDate ? <p className="text-xs text-white/20">Due {new Date(payment.dueDate).toLocaleDateString()}</p> : null}
          </div>
          <p className="text-sm font-medium text-white/70">${payment.amount.toLocaleString()}</p>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${
              payment.status === "paid" ? "bg-emerald-400/10 text-emerald-400" : "bg-amber-400/10 text-amber-400"
            }`}
          >
            {payment.status}
          </span>
        </div>
      ))}
    </div>
  );
}
