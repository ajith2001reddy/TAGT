import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import { createRequest, getMyRequests } from "../services/residentService";

/**
 * ResidentDashboard – Phase 4 Polish (Final)
 * - Active vs Resolved separation
 * - Status badges
 * - Admin notes / resolution details (read-only)
 */

export default function ResidentDashboard() {
    const [message, setMessage] = useState("");
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Track which resolved request is expanded
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
            toast.error("Enter request message");
            return;
        }

        try {
            await createRequest(message);
            toast.success("Request sent");
            setMessage("");
            loadRequests();
        } catch {
            toast.error("Failed to send request");
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
        const base = "px-2 py-1 text-xs rounded font-medium";

        if (status === "pending")
            return (
                <span className={`${base} bg-yellow-100 text-yellow-700`}>
                    Pending
                </span>
            );

        if (status === "in-progress")
            return (
                <span className={`${base} bg-blue-100 text-blue-700`}>
                    In Progress
                </span>
            );

        if (status === "resolved")
            return (
                <span className={`${base} bg-green-100 text-green-700`}>
                    Resolved
                </span>
            );

        return null;
    };

    return (
        <DashboardLayout>
            <h2 className="text-2xl font-bold mb-4">
                My Requests
            </h2>

            {/* ================= CREATE REQUEST ================= */}
            <div className="bg-white p-4 rounded shadow mb-6">
                <textarea
                    className="w-full p-3 border rounded mb-3"
                    placeholder="Describe your issue..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />

                <button
                    onClick={submitRequest}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Submit Request
                </button>
            </div>

            {/* ================= ACTIVE REQUESTS ================= */}
            <h3 className="text-lg font-semibold mb-3">
                Active Requests
            </h3>

            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : activeRequests.length === 0 ? (
                <p className="text-gray-500">
                    No active requests.
                </p>
            ) : (
                <ul className="space-y-3 mb-8">
                    {activeRequests.map((r) => (
                        <li
                            key={r._id}
                            className="bg-white p-4 rounded shadow flex justify-between items-start"
                        >
                            <p>{r.message}</p>
                            <StatusBadge status={r.status} />
                        </li>
                    ))}
                </ul>
            )}

            {/* ================= RESOLVED REQUESTS ================= */}
            <h3 className="text-lg font-semibold mb-3">
                Resolved Requests
            </h3>

            {resolvedRequests.length === 0 ? (
                <p className="text-gray-500">
                    No resolved requests yet.
                </p>
            ) : (
                <ul className="space-y-3">
                    {resolvedRequests.map((r) => {
                        const isOpen = expandedId === r._id;
                        const lastNote =
                            r.adminNotes && r.adminNotes.length > 0
                                ? r.adminNotes[r.adminNotes.length - 1]
                                : null;

                        return (
                            <li
                                key={r._id}
                                className="bg-white p-4 rounded shadow"
                            >
                                <div className="flex justify-between items-start">
                                    <p>{r.message}</p>
                                    <StatusBadge status={r.status} />
                                </div>

                                <button
                                    onClick={() =>
                                        setExpandedId(
                                            isOpen ? null : r._id
                                        )
                                    }
                                    className="mt-2 text-sm text-blue-600 hover:underline"
                                >
                                    {isOpen
                                        ? "Hide Details"
                                        : "View Details"}
                                </button>

                                {/* ===== DETAILS ===== */}
                                {isOpen && (
                                    <div className="mt-3 border-t pt-3 text-sm text-gray-700 space-y-2">
                                        {r.workflowStatus && (
                                            <p>
                                                <strong>
                                                    Workflow Status:
                                                </strong>{" "}
                                                {r.workflowStatus}
                                            </p>
                                        )}

                                        {lastNote ? (
                                            <div>
                                                <p className="font-medium">
                                                    Resolution
                                                </p>
                                                <p className="bg-gray-100 p-2 rounded">
                                                    {lastNote.note}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">
                                                No admin notes available.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </DashboardLayout>
    );
}
