import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import axios from "axios";

/**
 * RequestHistory
 * Phase 2 Feature
 * - Displays archived (closed) maintenance requests
 * - Read-only (audit purpose)
 * - Safe: does not affect active requests
 */

export default function RequestHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const token = localStorage.getItem("token");

    /* ================= FETCH HISTORY ================= */
    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/admin/requests/history", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setHistory(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to load request history");
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    /* ================= FILTER ================= */
    const filteredHistory = history.filter((h) =>
        h.originalMessage
            ?.toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <DashboardLayout>
            <h2 className="text-2xl font-bold mb-6">
                Request History
            </h2>

            {/* ================= SEARCH ================= */}
            <div className="bg-white p-4 rounded shadow mb-6">
                <input
                    type="text"
                    placeholder="Search by request message..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                />
            </div>

            {/* ================= CONTENT ================= */}
            {loading ? (
                <div className="text-center py-10 text-gray-500">
                    Loading history...
                </div>
            ) : filteredHistory.length === 0 ? (
                <div className="bg-white p-6 rounded shadow text-center text-gray-500">
                    No archived requests found.
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredHistory.map((item) => (
                        <div
                            key={item._id}
                            className="bg-white p-5 rounded-xl shadow"
                        >
                            <div className="flex justify-between mb-2">
                                <p className="font-semibold">
                                    {item.originalMessage}
                                </p>
                                <span className="text-sm text-gray-500">
                                    {new Date(
                                        item.resolvedAt
                                    ).toLocaleString()}
                                </span>
                            </div>

                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Final Resolution:</strong>{" "}
                                {item.finalResolution}
                            </p>

                            {item.timeline && item.timeline.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-sm font-semibold mb-1">
                                        Admin Notes Timeline
                                    </p>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        {item.timeline.map(
                                            (t, index) => (
                                                <li key={index}>
                                                    • [{t.status}]{" "}
                                                    {t.note}
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
        </DashboardLayout>
    );
}
