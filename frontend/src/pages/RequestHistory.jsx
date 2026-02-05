import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import api from "../api/axios";
import toast from "react-hot-toast";

/**
 * REQUEST HISTORY (RESIDENT)
 * - Shows all maintenance requests created by the resident
 * - Read-only
 * - Uses real backend data
 */

const STATUS_COLORS = {
    pending: "bg-yellow-600/20 text-yellow-400",
    "in-progress": "bg-blue-600/20 text-blue-400",
    "on-hold": "bg-orange-600/20 text-orange-400",
    done: "bg-green-600/20 text-green-400",
};

export default function RequestHistory() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // ================= FETCH =================
    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await api.get("/resident/requests/my");
            setRequests(Array.isArray(res.data) ? res.data : []);
        } catch {
            toast.error("Failed to load request history");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    return (
        <AppLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">
                        Maintenance History
                    </h1>
                    <p className="text-gray-400">
                        Your submitted maintenance requests
                    </p>
                </div>

                {loading ? (
                    <div className="bg-white/10 border border-white/10 rounded-xl p-6 text-center text-gray-400">
                        Loading requests…
                    </div>
                ) : requests.length === 0 ? (
                    <div className="bg-white/10 border border-white/10 rounded-xl p-6 text-center text-gray-400">
                        You haven’t submitted any requests yet.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((r) => (
                            <div
                                key={r._id}
                                className="bg-white/10 border border-white/10 rounded-xl p-4"
                            >
                                <div className="flex justify-between items-start mb-2 gap-3">
                                    <p className="font-semibold text-gray-100 break-words">
                                        {r.issue}
                                    </p>

                                    <span
                                        className={`px-2 py-1 rounded text-xs font-semibold capitalize ${STATUS_COLORS[r.status]
                                            }`}
                                    >
                                        {r.status}
                                    </span>
                                </div>

                                <p className="text-xs text-gray-400">
                                    Submitted on{" "}
                                    {r.createdAt
                                        ? new Date(r.createdAt).toLocaleDateString()
                                        : "—"}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
