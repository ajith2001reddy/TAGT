import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import toast from "react-hot-toast";

export default function AdminRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Form states
    const [workflowStatus, setWorkflowStatus] = useState("");
    const [adminNote, setAdminNote] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Archive states
    const [archiveTarget, setArchiveTarget] = useState(null);
    const [finalResolution, setFinalResolution] = useState("");
    const [archiving, setArchiving] = useState(false);

    // Workflow transition rules
    const WORKFLOW_FLOW = {
        "Received": ["In-Progress"],
        "In-Progress": ["On Hold", "Done"],
        "On Hold": ["In-Progress"]
    };

    const WORKFLOW_COLORS = {
        "Received": "bg-yellow-100 text-yellow-800 border-yellow-200",
        "In-Progress": "bg-blue-100 text-blue-800 border-blue-200",
        "On Hold": "bg-orange-100 text-orange-800 border-orange-200",
        "Done": "bg-green-100 text-green-800 border-green-200"
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/requests");
            setRequests(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            toast.error("Failed to load requests");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getAvailableTransitions = (currentStatus) => {
        return WORKFLOW_FLOW[currentStatus] || [];
    };

    const updateWorkflowStatus = async () => {
        if (!selectedRequest) return;

        const currentStatus = selectedRequest.workflowStatus || "Received";
        const availableTransitions = getAvailableTransitions(currentStatus);

        // Validation
        if (!workflowStatus) {
            toast.error("Please select a new status");
            return;
        }

        if (!availableTransitions.includes(workflowStatus)) {
            toast.error(`Invalid transition: Cannot change from ${currentStatus} to ${workflowStatus}`);
            return;
        }

        if (!adminNote.trim()) {
            toast.error("Please add an admin note");
            return;
        }

        setSubmitting(true);
        try {
            await api.put(`/admin/requests/${selectedRequest._id}/workflow-status`, {
                workflowStatus,
                note: adminNote.trim()
            });

            toast.success(`Status updated to ${workflowStatus}`);
            closeWorkflowModal();
            fetchRequests();
        } catch (err) {
            const message = err.response?.data || "Failed to update status";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const archiveRequest = async () => {
        if (!archiveTarget) return;

        if (!finalResolution.trim()) {
            toast.error("Please enter a final resolution");
            return;
        }

        setArchiving(true);
        try {
            await api.post(`/admin/requests/${archiveTarget._id}/archive`, {
                finalResolution: finalResolution.trim()
            });

            toast.success("Request archived successfully");
            closeArchiveModal();
            fetchRequests();
        } catch (err) {
            const message = err.response?.data || "Failed to archive request";
            toast.error(message);
        } finally {
            setArchiving(false);
        }
    };

    const updateLegacyStatus = async (id, status) => {
        try {
            await api.put(`/admin/requests/${id}/status`, { status });
            toast.success("Status updated");
            fetchRequests();
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const openWorkflowModal = (request) => {
        setSelectedRequest(request);
        setWorkflowStatus(""); // Reset to force selection
        setAdminNote("");
    };

    const closeWorkflowModal = () => {
        setSelectedRequest(null);
        setWorkflowStatus("");
        setAdminNote("");
    };

    const openArchiveModal = (request) => {
        setArchiveTarget(request);
        setFinalResolution("");
    };

    const closeArchiveModal = () => {
        setArchiveTarget(null);
        setFinalResolution("");
    };

    const getStatusBadge = (status) => {
        const colorClass = WORKFLOW_COLORS[status] || "bg-gray-100 text-gray-800";
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
                {status}
            </span>
        );
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Maintenance Requests</h1>
                    <p className="text-gray-500 mt-1">Manage and track resident maintenance requests</p>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Message</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Resident</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                            Loading requests...
                                        </td>
                                    </tr>
                                ) : requests.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                            No maintenance requests found
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((req) => {
                                        const displayStatus = req.workflowStatus || "Received";
                                        const isDone = displayStatus === "Done" || req.status === "resolved";

                                        return (
                                            <tr key={req._id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-gray-900 max-w-md truncate">
                                                        {req.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(req.createdAt).toLocaleDateString()}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{req.residentId?.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(displayStatus)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {isDone ? (
                                                        <span className="text-green-600 text-sm font-medium">Completed</span>
                                                    ) : (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => openWorkflowModal(req)}
                                                                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition"
                                                            >
                                                                Update Status
                                                            </button>
                                                            <button
                                                                onClick={() => openArchiveModal(req)}
                                                                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition border"
                                                            >
                                                                Archive
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Professional Workflow Modal */}
            <AnimatePresence>
                {selectedRequest && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                                <h3 className="text-lg font-semibold text-gray-900">Update Request Status</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Current: {getStatusBadge(selectedRequest.workflowStatus || "Received")}
                                </p>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        value={workflowStatus}
                                        onChange={(e) => setWorkflowStatus(e.target.value)}
                                    >
                                        <option value="">Select new status...</option>
                                        {getAvailableTransitions(selectedRequest.workflowStatus || "Received").map((status) => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Available transitions from {selectedRequest.workflowStatus || "Received"}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Admin Note <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                        rows="3"
                                        placeholder="Describe the update or action taken..."
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                                <button
                                    onClick={closeWorkflowModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={updateWorkflowStatus}
                                    disabled={submitting || !workflowStatus}
                                    className={`px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 ${(!workflowStatus || submitting) ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {submitting ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : "Save Changes"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Archive Modal */}
            <AnimatePresence>
                {archiveTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 bg-red-50">
                                <h3 className="text-lg font-semibold text-red-900">Close & Archive Request</h3>
                                <p className="text-sm text-red-600 mt-1">This will permanently move the request to history</p>
                            </div>

                            <div className="p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Final Resolution <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                    rows="4"
                                    placeholder="Describe how this issue was resolved..."
                                    value={finalResolution}
                                    onChange={(e) => setFinalResolution(e.target.value)}
                                />
                            </div>

                            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                                <button
                                    onClick={closeArchiveModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                                    disabled={archiving}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={archiveRequest}
                                    disabled={archiving}
                                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                                >
                                    {archiving ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Archiving...
                                        </>
                                    ) : "Archive Request"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}