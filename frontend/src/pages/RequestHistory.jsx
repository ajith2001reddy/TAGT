import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/axios";

/**
 * REQUEST HISTORY (DARK THEME FIXED)
 * - Read-only audit view
 * - Searchable
 * - Fully visible on dark UI
 */

export default function RequestHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    /* ================= FETCH HISTORY ================= */
    const fetchHistory = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/requests/history");
            setHistory(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to load request history", err);
            setHistory([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    /* ================= FILTER ================= */
    const filteredHistory = history.filter((item) =>
        item.originalMessage
            ?.toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* HEADER */}
                <div>
                    <h1 className="text-3xl font-bold">
                        Request History
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Archived maintenance requests (read-only)
                    </p>
                </div>

                {/* SEARCH */}
                <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                    <input
                        type="text"
                        placeholder="Search by request message…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-black/30 text-gray-100 placeholder-gray-400 px-4 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>

                {/* CONTENT */}
                {loading ? (
                    <div className="bg-white/10 border border-white/10 rounded-2xl p-8 text-center text-gray-400">
                        Loading request history…
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <div className="bg-white/10 border border-white/10 rounded-2xl p-8 text-center text-gray-400">
                        No archived requests found.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredHistory.map((item) => (
                            <div
                                key={item._id}
                                className="bg-white/10 border border-white/10 rounded-2xl p-6"
                            >
                                {/* HEADER */}
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-semibold text-gray-100">
                                            {item.originalMessage}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Resolved on{" "}
                                            {new Date(
                                                item.resolvedAt
                                            ).toLocaleString()}
                                        </p>
                                    </div>

                                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-green-600/20 text-green-400">
                                        Closed
                                    </span>
                                </div>

                                {/* FINAL RESOLUTION */}
                                <div className="bg-black/30 border border-white/10 rounded-lg p-4 text-sm text-gray-300 mb-3">
                                    <strong className="text-gray-200">
                                        Final Resolution
                                    </strong>
                                    <p className="mt-1">
                                        {item.finalResolution}
                                    </p>
                                </div>

                                {/* ADMIN TIMELINE */}
                                {item.timeline?.length > 0 && (
                                    <div>
                                        <p className="text-sm font-semibold text-gray-200 mb-2">
                                            Admin Notes Timeline
                                        </p>

                                        <ul className="space-y-2 text-sm text-gray-400">
                                            {item.timeline.map(
                                                (t, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex gap-2"
                                                    >
                                                        <span className="text-blue-400 font-semibold">
                                                            [{t.status}]
                                                        </span>
                                                        <span>
                                                            {t.note}
                                                        </span>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
