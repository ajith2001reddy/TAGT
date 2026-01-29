import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import toast from "react-hot-toast";

export default function AdminRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [workflowStatus, setWorkflowStatus] = useState("");
    const [adminNote, setAdminNote] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [archiveTarget, setArchiveTarget] = useState(null);
    const [finalResolution, setFinalResolution] = useState("");
    const [archiving, setArchiving] = useState(false);

    const [deletingId, setDeletingId] = useState(null);

    const WORKFLOW_FLOW = {
        Received: ["In-Progress"],
        "In-Progress": ["On Hold", "Done"],
        "On Hold": ["In-Progress"]
    };

    const WORKFLOW_COLORS = {
        Received: "bg-yellow-100 text-yellow-800 border-yellow-200",
        "In-Progress": "bg-blue-100 text-blue-800 border-blue-200",
        "On Hold": "bg-orange-100 text-orange-800 border-orange-200",
        Done: "bg-green-100 text-green-800 border-green-200"
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/requests");
            setRequests(Array.isArray(res.data) ? res.data : []);
        } catch {
            toast.error("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    /* ================= DELETE REQUEST ================= */
    const deleteRequest = async (id) => {
        if (!window.confirm("Delete this request permanently?")) return;

        setDeletingId(id);
        try {
            await api.delete(`/admin/requests/${id}`);
            toast.success("Request deleted");
            fetchRequests();
        } catch {
            toast.error("Failed to delete request");
        } finally {
            setDeletingId(null);
        }
    };

    /* ================= WORKFLOW ================= */
    const openWorkflowModal = (req) => {
        setSelectedRequest(req);
        setWorkflowStatus("");
        setAdminNote("");
    };

    const closeWorkflowModal = () => {
        setSelectedRequest(null);
        setWorkflowStatus("");
        setAdminNote("");
    };

    const updateWorkflowStatus = async () => {
        if (!workflowStatus || !adminNote.trim()) {
            toast.error("Status and admin note are required");
            return;
        }

        setSubmitting(true);
        try {
            await api.put(`/admin/requests/${selectedRequest._id}/workflow-status`, {
                workflowStatus,
                note: adminNote.trim()
            });

            toast.success("Status updated");
            closeWorkflowModal();
            fetchRequests();
        } catch {
            toast.error("Failed to update status");
        } finally {
            setSubmitting(false);
        }
    };

    /* ================= ARCHIVE ================= */
    const openArchiveModal = (req) => {
        setArchiveTarget(req);
        setFinalResolution("");
    };

    const closeArchiveModal = () => {
        setArchiveTarget(null);
        setFinalResolution("");
    };

    const archiveRequest = async () => {
        if (!finalResolution.trim()) {
            toast.error("Final resolution is required");
            return;
        }

        setArchiving(true);
        try {
            await api.post(`/admin/requests/${archiveTarget._id}/archive`, {
                finalResolution: finalResolution.trim()
            });

            toast.success("Request archived");
            closeArchiveModal();
            fetchRequests();
        } catch {
            toast.error("Failed to archive request");
        } finally {
            setArchiving(false);
        }
    };

    const getStatusBadge = (status) => (
        <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${WORKFLOW_COLORS[status] || "bg-gray-100 text-gray-800"
                }`}
        >
            {status}
        </span>
    );

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">
                    Maintenance Requests
                </h1>

                <div className="bg-white rounded-xl shadow border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">
                                    Message
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">
                                    Resident
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-6 text-center">
                                        Loading…
                                    </td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-6 text-center text-gray-400">
                                        No requests found
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req) => {
                                    const status = req.workflowStatus || "Received";
                                    const isDone = status === "Done";

                                    return (
                                        <tr
                                            key={req._id}
                                            className="border-t hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                {req.message}
                                            </td>
                                            <td className="px-6 py-4">
                                                {req.residentId?.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(status)}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                {!isDone && (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                openWorkflowModal(req)
                                                            }
                                                            className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                                                        >
                                                            Update
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                openArchiveModal(req)
                                                            }
                                                            className="px-3 py-1 bg-gray-200 text-xs rounded hover:bg-gray-300"
                                                        >
                                                            Archive
                                                        </button>
                                                    </>
                                                )}

                                                {/* DELETE ALWAYS VISIBLE */}
                                                <button
                                                    onClick={() =>
                                                        deleteRequest(req._id)
                                                    }
                                                    disabled={deletingId === req._id}
                                                    className={`px-3 py-1 text-xs rounded text-white ${deletingId === req._id
                                                            ? "bg-red-300 cursor-not-allowed"
                                                            : "bg-red-600 hover:bg-red-700"
                                                        }`}
                                                >
                                                    {deletingId === req._id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* WORKFLOW MODAL */}
            <AnimatePresence>
                {selectedRequest && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl p-6 w-96"
                        >
                            <h3 className="text-lg font-semibold mb-4">
                                Update Status
                            </h3>

                            <select
                                className="w-full border rounded p-2 mb-3"
                                value={workflowStatus}
                                onChange={(e) =>
                                    setWorkflowStatus(e.target.value)
                                }
                            >
                                <option value="">Select status</option>
                                {WORKFLOW_FLOW[
                                    selectedRequest.workflowStatus ||
                                    "Received"
                                ]?.map((s) => (
                                    <option key={s}>{s}</option>
                                ))}
                            </select>

                            <textarea
                                className="w-full border rounded p-2 mb-4"
                                placeholder="Admin note"
                                value={adminNote}
                                onChange={(e) =>
                                    setAdminNote(e.target.value)
                                }
                            />

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={closeWorkflowModal}
                                    className="px-3 py-1 border rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={updateWorkflowStatus}
                                    className="px-3 py-1 bg-indigo-600 text-white rounded"
                                >
                                    Save
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ARCHIVE MODAL */}
            <AnimatePresence>
                {archiveTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl p-6 w-96"
                        >
                            <h3 className="text-lg font-semibold mb-4">
                                Archive Request
                            </h3>

                            <textarea
                                className="w-full border rounded p-2 mb-4"
                                placeholder="Final resolution"
                                value={finalResolution}
                                onChange={(e) =>
                                    setFinalResolution(e.target.value)
                                }
                            />

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={closeArchiveModal}
                                    className="px-3 py-1 border rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={archiveRequest}
                                    className="px-3 py-1 bg-red-600 text-white rounded"
                                >
                                    Archive
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
