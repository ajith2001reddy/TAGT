import { Loading } from "@/components/shared/Loading";
import type { ResidentRequest } from "@/services/resident.service";

const STATUS_STYLE: Record<string, string> = {
  pending: "text-amber-400 bg-amber-400/10",
  "in-progress": "text-blue-400 bg-blue-400/10",
  resolved: "text-emerald-400 bg-emerald-400/10",
};

export function RequestList({ loading, requests }: { loading: boolean; requests: ResidentRequest[] }) {
  if (loading) return <Loading label="Loading requests..." />;
  if (!requests.length) return <p className="py-6 text-center text-sm text-white/20">No requests yet</p>;

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <div key={request._id} className="flex items-start gap-3 border-b border-white/[0.04] py-3 last:border-0">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white/70">{request.title}</p>
            <p className="mt-0.5 line-clamp-1 text-xs text-white/30">{request.description}</p>
            <p className="mt-1 text-xs text-white/20">{new Date(request.createdAt).toLocaleDateString()}</p>
          </div>
          <span
            className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${STATUS_STYLE[request.status] ?? "bg-white/5 text-white/30"}`}
          >
            {request.status}
          </span>
        </div>
      ))}
    </div>
  );
}
