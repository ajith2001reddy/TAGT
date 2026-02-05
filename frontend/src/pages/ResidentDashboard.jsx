import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout";
import Button from "../components/Button";
import { createRequest, getMyRequests } from "../services/residentService";

export default function ResidentDashboard() {
    const [description, setDescription] = useState("");
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    /* ================= LOAD REQUESTS ================= */
    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await getMyRequests();
            setRequests(data || []);
        } catch {
            toast.error("Failed to load requests");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    /* ================= SUBMIT REQUEST ================= */
    const submitRequest = async () => {
        if (!description.trim()) {
            toast.error("Please describe your issue");
            return;
        }

        try {
            await createRequest({
                title: "Maintenance Issue",
                description: description.trim(),
            });

            toast.success("Your request has been submitted");
            setDescription("");
            loadRequests();
        } catch {
            toast.error("Failed to submit request");
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    /* ================= STATUS HELPERS ================= */
    const isResolved = (r) => r.status === "done";

    const activeRequests = requests.filter((r) => !isResolved(r));
    const resolvedRequests = requests.filter((r) => isResolved(r));

    const StatusBadge = ({ status }) => {
        const base =
            "inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded";

        switch (status) {
            case "pending":
                return (
                    <span className={`${base} bg-yellow-600/20 text-yellow-400`}>
                        Pending
                    </span>
                );
            case "in-progress":
                return (
                    <span className={`${base} bg-blue-600/20 text-blue-400`}>
                        In Progress
                    </span>
                );
            case "on-hold":
                return (
                    <span className={`${base} bg-orange-600/20 text-orange-400`}>
                        On Hold
                    </span>
                );
            case "done":
                return (
                    <span className={`${base} bg-green-600/20 text-green-400`}>
                        Resolved
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <AppLayout>
            <div className="space-y-8">
                {/* HEADER */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">
                        My Maintenance Requests
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Submit new requests and track their progress
                    </p>
                </div>

                {/* CREATE REQUEST */}
                <div className="bg-white/10 border border-white/10 rounded-2xl p-4 sm:p-6">
                    <h2 className="text-lg font-semibold mb-3">
                        Submit a New Request
                    </h2>

                    <textarea
                        className="w-full bg-black/30 text-gray-100 placeholder-gray-400 p-4 border border-white/10 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        rows={4}
                        placeholder="Describe the issue in detail…"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <div className="flex justify-end mt-4">
                        <Button onClick={submitRequest}>Submit Request</Button>
                    </div>
                </div>

                {/* ACTIVE REQUESTS */}
                <div className="bg-white/10 border border-white/10 rounded-2xl p-4 sm:p-6">
                    <h2 className="text-lg font-semibold mb-4">Active Requests</h2>

                    {loading ? (
                        <p className="text-gray-400">Loading requests…</p>
                    ) : activeRequests.length === 0 ? (
                        <p className="text-gray-400">You have no active requests.</p>
                    ) : (
                        <ul className="divide-y divide-white/10">
                            {activeRequests.map((r) => (
                                <li
                                    key={r._id}
                                    className="py-3 flex flex-col sm:flex-row sm:justify-between gap-2"
                                >
                                    <p className="text-gray-200">{r.description}</p>
                                    <StatusBadge status={r.status} />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* RESOLVED REQUESTS */}
                <div className="bg-white/10 border border-white/10 rounded-2xl p-4 sm:p-6">
                    <h2 className="text-lg font-semibold mb-4">Resolved Requests</h2>

                    {resolvedRequests.length === 0 ? (
                        <p className="text-gray-400">No resolved requests yet.</p>
                    ) : (
                        <ul className="divide-y divide-white/10">
                            {resolvedRequests.map((r) => (
                                <li key={r._id} className="py-3 flex justify-between">
                                    <p className="text-gray-200">{r.description}</p>
                                    <StatusBadge status="done" />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
