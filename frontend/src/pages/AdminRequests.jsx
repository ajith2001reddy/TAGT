import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/axios";

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

    const WORKFLOW_FLOW = {
        Received: ["In-Progress"],
        "In-Progress": ["On Hold", "Done"],
        "On Hold": ["In-Progress"]
    };

    const WORKFLOW_COLORS = {
        Received: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
        "In-Progress": "bg-blue-500/20 text-blue-300 border-blue-500/30",
        "On Hold": "bg-orange-500/20 text-orange-300 border-orange-500/30",
        Done: "bg-green-500/20 text-green-300 border-green-500/30"
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
            await api.put(
                `/admin/requests/${selectedRequest._id}/workflow-status`,
                {
                    workflowStatus,
                    note: adminNote.trim()
                }
            );

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
        if (req.workflowStatus !== "Done") {
            toast.error("Only completed requests can be archived");
            return;
        }
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
            await api.post(
                `/admin/requests/${archiveTarget._id}/archive`,
                {
                    finalResolution: finalResolution.trim()
                }
            );

            toast.success("Request archived");
            closeArchiveModal();
            fetchRequests();
        } catch {
            toast.error("Failed to archive request");
        } finally {
            setArchiving(false);
        }
    };

    const getStatusBadge = (status = "Received") => (
        <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${WORKFLOW_COLORS[status] ||
                "bg-gray-500/20 text-gray-300 border-gray-500/30"
                }`}
        >
            {status}
        </span>
    );

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto text-gray-100">
                <h1 className="text-3xl font-bold mb-6">
                    Maintenance Requests
                </h1>

                <div className="rounded-2xl bg-white/10 border border-white/10 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-400 border-b border-white/10">
                                <th className="px-6 py-4 text-left">
                                    Message
                                </th>
                                <th className="px-6 py-4 text-left">
                                    Resident
                                </th>
                                <th className="px-6 py-4 text-left">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-6 py-8 text-center text-gray-400"
                                    >
                                        Loading…
                                    </td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-6 py-8 text-center text-gray-400"
                                    >
                                        No requests found
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req) => {
                                    const status =
                                        req.workflowStatus || "Received";
                                    const isDone = status === "Done";

                                    return (
                                        <tr
                                            key={req._id}
                                            className="border-t border-white/5 hover:bg-white/5"
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
                                                    <button
                                                        onClick={() =>
                                                            openWorkflowModal(
                                                                req
                                                            )
                                                        }
                                                        className="px-3 py-1 bg-indigo-600 text-xs rounded text-white"
                                                    >
                                                        Update
                                                    </button>
                                                )}

                                                {isDone && (
                                                    <button
                                                        onClick={() =>
                                                            openArchiveModal(
                                                                req
                                                            )
                                                        }
                                                        className="px-3 py-1 bg-gray-500/20 text-xs rounded"
                                                    >
                                                        Archive
                                                    </button>
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

            {/* WORKFLOW MODAL */}
            <AnimatePresence>
                {selectedRequest && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white/10 border border-white/10 rounded-2xl p-6 w-96"
                        >
                            <h3 className="text-lg font-semibold mb-4">
                                Update Status
                            </h3>

                            <select
                                className="w-full bg-black/30 border border-white/10 rounded p-2 mb-3"
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
                                className="w-full bg-black/30 border border-white/10 rounded p-2 mb-4"
                                placeholder="Admin note"
                                value={adminNote}
                                onChange={(e) =>
                                    setAdminNote(e.target.value)
                                }
                            />

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={closeWorkflowModal}
                                    className="px-3 py-1 border border-white/10 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={submitting}
                                    onClick={updateWorkflowStatus}
                                    className="px-3 py-1 bg-indigo-600 text-white rounded"
                                >
                                    {submitting ? "Saving…" : "Save"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ARCHIVE MODAL */}
            <AnimatePresence>
                {archiveTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white/10 border border-white/10 rounded-2xl p-6 w-96"
                        >
                            <h3 className="text-lg font-semibold mb-4">
                                Archive Request
                            </h3>

                            <textarea
                                className="w-full bg-black/30 border border-white/10 rounded p-2 mb-4"
                                placeholder="Final resolution"
                                value={finalResolution}
                                onChange={(e) =>
                                    setFinalResolution(e.target.value)
                                }
                            />

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={closeArchiveModal}
                                    className="px-3 py-1 border border-white/10 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={archiving}
                                    onClick={archiveRequest}
                                    className="px-3 py-1 bg-red-600 text-white rounded"
                                >
                                    {archiving ? "Archiving…" : "Archive"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
