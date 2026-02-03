import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "../components/AppLayout";
import Button from "../components/Button";
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
        Received: "bg-yellow-600/20 text-yellow-400 border-yellow-500/30",
        "In-Progress": "bg-blue-600/20 text-blue-400 border-blue-500/30",
        "On Hold": "bg-orange-600/20 text-orange-400 border-orange-500/30",
        Done: "bg-green-600/20 text-green-400 border-green-500/30"
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

    const getStatusBadge = (status = "Received") => (
        <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${WORKFLOW_COLORS[status] ||
                "bg-gray-500/20 text-gray-300 border-gray-500/30"
                }`}
        >
            {status}
        </span>
    );

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

    return (
        <AppLayout>
            <div className="space-y-6">
                <h1 className="text-2xl sm:text-3xl font-bold">
                    Maintenance Requests
                </h1>

                {loading ? (
                    <p className="text-gray-400 text-center">
                        Loading…
                    </p>
                ) : requests.length === 0 ? (
                    <p className="text-gray-400 text-center">
                        No requests found
                    </p>
                ) : (
                    <>
                        {/* ================= MOBILE VIEW ================= */}
                        <div className="space-y-4 sm:hidden">
                            {requests.map((req) => {
                                const status =
                                    req.workflowStatus || "Received";
                                const isDone = status === "Done";

                                return (
                                    <div
                                        key={req._id}
                                        className="bg-white/10 border border-white/10 rounded-xl p-4"
                                    >
                                        <p className="text-gray-200 mb-2">
                                            {req.message}
                                        </p>

                                        <p className="text-sm text-gray-400 mb-2">
                                            {req.residentId?.email}
                                        </p>

                                        <div className="flex justify-between items-center mb-3">
                                            {getStatusBadge(status)}
                                        </div>

                                        {!isDone ? (
                                            <Button
                                                onClick={() =>
                                                    openWorkflowModal(req)
                                                }
                                                className="w-full"
                                            >
                                                Update Status
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() =>
                                                    openArchiveModal(req)
                                                }
                                                className="w-full"
                                            >
                                                Archive
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* ================= DESKTOP TABLE ================= */}
                        <div className="hidden sm:block overflow-x-auto rounded-2xl bg-white/10 border border-white/10">
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
                                    {requests.map((req) => {
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
                                                <td className="px-6 py-4 text-right">
                                                    {!isDone ? (
                                                        <Button
                                                            onClick={() =>
                                                                openWorkflowModal(
                                                                    req
                                                                )
                                                            }
                                                        >
                                                            Update
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            onClick={() =>
                                                                openArchiveModal(
                                                                    req
                                                                )
                                                            }
                                                        >
                                                            Archive
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* ================= MODALS ================= */}
            <AnimatePresence>
                {(selectedRequest || archiveTarget) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white/10 border border-white/10 rounded-2xl p-6 w-full max-w-md"
                        >
                            {selectedRequest && (
                                <>
                                    <h3 className="text-lg font-semibold mb-4">
                                        Update Status
                                    </h3>

                                    <select
                                        className="w-full bg-black/30 border border-white/10 rounded p-2 mb-3"
                                        value={workflowStatus}
                                        onChange={(e) =>
                                            setWorkflowStatus(
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Select status
                                        </option>
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
                                        <Button
                                            onClick={closeWorkflowModal}
                                            className="bg-gray-600"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            disabled={submitting}
                                            onClick={updateWorkflowStatus}
                                        >
                                            {submitting
                                                ? "Saving…"
                                                : "Save"}
                                        </Button>
                                    </div>
                                </>
                            )}

                            {archiveTarget && (
                                <>
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
                                        <Button
                                            onClick={closeArchiveModal}
                                            className="bg-gray-600"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            disabled={archiving}
                                            onClick={archiveRequest}
                                        >
                                            {archiving
                                                ? "Archiving…"
                                                : "Archive"}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AppLayout>
    );
}
