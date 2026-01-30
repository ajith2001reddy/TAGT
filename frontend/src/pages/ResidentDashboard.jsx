import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import { createRequest, getMyRequests } from "../services/residentService";

/**
 * RESIDENT DASHBOARD (DARK THEME FIXED)
 * - Clear request flow
 * - Readable on dark UI
 * - No logic changes
 */

export default function ResidentDashboard() {
    const [message, setMessage] = useState("");
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    /* ================= LOAD REQUESTS ================= */
    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await getMyRequests();
            setRequests(Array.isArray(data) ? data : []);
        } catch {
            toast.error("Failed to load requests");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    /* ================= SUBMIT REQUEST ================= */
    const submitRequest = async () => {
        if (!message.trim()) {
            toast.error("Please describe your issue");
            return;
        }

        try {
            await createRequest(message.trim());
            toast.success("Your request has been submitted");
            setMessage("");
            loadRequests();
        } catch {
            toast.error("Failed to submit request");
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    /* ================= SPLIT REQUESTS ================= */
    const activeRequests = requests.filter(
        (r) => r.status !== "resolved"
    );

    const resolvedRequests = requests.filter(
        (r) => r.status === "resolved"
    );

    /* ================= STATUS BADGE ================= */
    const StatusBadge = ({ status }) => {
        const base =
            "inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded";

        if (status === "pending")
            return (
                <span className={`${base} bg-yellow-600/20 text-yellow-400`}>
                    Pending
                </span>
            );

        if (status === "in-progress")
            return (
                <span className={`${base} bg-blue-600/20 text-blue-400`}>
                    In Progress
                </span>
            );

        if (status === "resolved")
            return (
                <span className={`${base} bg-green-600/20 text-green-400`}>
                    Resolved
                </span>
            );

        return null;
    };

    return (
        <DashboardLayout>
            <div className="space-y-10">
                {/* HEADER */}
                <div>
                    <h1 className="text-3xl font-bold">
                        My Maintenance Requests
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Submit new requests and track their progress
                    </p>
                </div>

                {/* CREATE REQUEST */}
                <div className="bg-white/10 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-3">
                        Submit a New Request
                    </h2>

                    <textarea
                        className="w-full bg-black/30 text-gray-100 placeholder-gray-400 p-4 border border-white/10 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        rows={4}
                        placeholder="Describe the issue in detail (e.g., water leakage, electrical problem)…"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />

                    <div className="flex justify-end mt-4">
                        <button
                            onClick={submitRequest}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
                        >
                            Submit Request
                        </button>
                    </div>
                </div>

                {/* ACTIVE REQUESTS */}
                <div className="bg-white/10 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        Active Requests
                    </h2>

                    {loading ? (
                        <p className="text-gray-400">
                            Loading requests…
                        </p>
                    ) : activeRequests.length === 0 ? (
                        <p className="text-gray-400">
                            You have no active requests.
                        </p>
                    ) : (
                        <ul className="divide-y divide-white/10">
                            {activeRequests.map((r) => (
                                <li
                                    key={r._id}
                                    className="py-3 flex items-start justify-between"
                                >
                                    <p className="text-gray-200">
                                        {r.message}
                                    </p>
                                    <StatusBadge status={r.status} />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* RESOLVED REQUESTS */}
                <div className="bg-white/10 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        Resolved Requests
                    </h2>

                    {resolvedRequests.length === 0 ? (
                        <p className="text-gray-400">
                            No resolved requests yet.
                        </p>
                    ) : (
                        <ul className="divide-y divide-white/10">
                            {resolvedRequests.map((r) => {
                                const isOpen = expandedId === r._id;
                                const lastNote =
                                    r.adminNotes?.length > 0
                                        ? r.adminNotes[
                                        r.adminNotes.length - 1
                                        ]
                                        : null;

                                return (
                                    <li key={r._id} className="py-4">
                                        <div className="flex justify-between items-start">
                                            <p className="text-gray-200">
                                                {r.message}
                                            </p>
                                            <StatusBadge status="resolved" />
                                        </div>

                                        <button
                                            onClick={() =>
                                                setExpandedId(
                                                    isOpen ? null : r._id
                                                )
                                            }
                                            className="mt-2 text-sm text-blue-400 hover:underline"
                                        >
                                            {isOpen
                                                ? "Hide details"
                                                : "View details"}
                                        </button>

                                        {isOpen && (
                                            <div className="mt-4 bg-black/30 border border-white/10 rounded-lg p-4 text-sm space-y-2">
                                                {r.workflowStatus && (
                                                    <p>
                                                        <strong className="text-gray-300">
                                                            Final Status:
                                                        </strong>{" "}
                                                        {r.workflowStatus}
                                                    </p>
                                                )}

                                                {lastNote ? (
                                                    <>
                                                        <p className="font-medium text-gray-300">
                                                            Admin Resolution
                                                        </p>
                                                        <p className="text-gray-400">
                                                            {lastNote.note}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="text-gray-400">
                                                        No admin notes
                                                        available.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
