import { useEffect, useState } from "react";
import axios from "axios";

/**
 * PHASE 2 UPGRADE NOTES
 * - Legacy status update STILL WORKS
 * - Phase 1 workflow update STILL WORKS (admin note)
 * - NEW: Close & Archive with Final Resolution (required)
 */

export default function AdminRequests() {
    const [requests, setRequests] = useState([]);

    // Phase 1 (workflow)
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [workflowStatus, setWorkflowStatus] = useState("");
    const [adminNote, setAdminNote] = useState("");

    // Phase 2 (archive)
    const [archiveTarget, setArchiveTarget] = useState(null);
    const [finalResolution, setFinalResolution] = useState("");

    const token = localStorage.getItem("token");

    /* ================= FETCH REQUESTS ================= */
    const fetchRequests = async () => {
        const res = await axios.get("/admin/requests", {
            headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(res.data);
    };

    /* ================= LEGACY STATUS UPDATE ================= */
    const updateStatus = async (id, status) => {
        await axios.put(
            `/admin/requests/${id}/status`,
            { status },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchRequests();
    };

    /* ================= PHASE 1 WORKFLOW UPDATE ================= */
    const updateWorkflowStatus = async () => {
        if (!workflowStatus || !adminNote.trim()) {
            alert("Workflow status and admin note are required");
            return;
        }

        await axios.put(
            `/admin/requests/${selectedRequest._id}/workflow-status`,
            {
                workflowStatus,
                note: adminNote
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        setSelectedRequest(null);
        setWorkflowStatus("");
        setAdminNote("");
        fetchRequests();
    };

    /* ================= PHASE 2 CLOSE & ARCHIVE ================= */
    const archiveRequest = async () => {
        if (!finalResolution.trim()) {
            alert("Final resolution is required");
            return;
        }

        await axios.post(
            `/admin/requests/${archiveTarget._id}/archive`,
            { finalResolution },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        setArchiveTarget(null);
        setFinalResolution("");
        fetchRequests();
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    return (
        <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">
                Maintenance Requests
            </h2>

            <table className="w-full border">
                <thead>
                    <tr className="border-b">
                        <th>Message</th>
                        <th>Resident</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {requests.map((req) => (
                        <tr
                            key={req._id}
                            className="border-b text-center"
                        >
                            <td>{req.message}</td>
                            <td>{req.residentId?.email}</td>

                            {/* Prefer workflowStatus if present */}
                            <td className="capitalize">
                                {req.workflowStatus || req.status}
                            </td>

                            <td className="space-x-2">
                                {/* ===== LEGACY BUTTONS ===== */}
                                {req.status === "pending" && (
                                    <button
                                        className="bg-blue-500 text-white px-3 py-1 rounded"
                                        onClick={() =>
                                            updateStatus(req._id, "approved")
                                        }
                                    >
                                        Approve
                                    </button>
                                )}

                                {req.status === "approved" && (
                                    <button
                                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                                        onClick={() =>
                                            updateStatus(
                                                req._id,
                                                "in_progress"
                                            )
                                        }
                                    >
                                        In Progress
                                    </button>
                                )}

                                {req.status !== "resolved" && (
                                    <button
                                        className="bg-green-600 text-white px-3 py-1 rounded"
                                        onClick={() =>
                                            updateStatus(
                                                req._id,
                                                "resolved"
                                            )
                                        }
                                    >
                                        Resolve
                                    </button>
                                )}

                                {/* ===== PHASE 1: WORKFLOW ===== */}
                                <button
                                    className="bg-gray-800 text-white px-3 py-1 rounded"
                                    onClick={() => setSelectedRequest(req)}
                                >
                                    Update (Pro)
                                </button>

                                {/* ===== PHASE 2: CLOSE & ARCHIVE ===== */}
                                <button
                                    className="bg-red-600 text-white px-3 py-1 rounded"
                                    onClick={() => setArchiveTarget(req)}
                                >
                                    Close & Archive
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ================= WORKFLOW MODAL (PHASE 1) ================= */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="bg-white p-6 rounded w-96">
                        <h3 className="font-bold mb-3">
                            Update Request Workflow
                        </h3>

                        <select
                            className="w-full border p-2 mb-3"
                            onChange={(e) =>
                                setWorkflowStatus(e.target.value)
                            }
                        >
                            <option value="">Select status</option>
                            <option value="Received">Received</option>
                            <option value="In-Progress">In-Progress</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Done">Done</option>
                        </select>

                        <textarea
                            className="w-full border p-2 mb-4"
                            placeholder="Admin note (required)"
                            value={adminNote}
                            onChange={(e) =>
                                setAdminNote(e.target.value)
                            }
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setSelectedRequest(null)}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={updateWorkflowStatus}
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= ARCHIVE MODAL (PHASE 2) ================= */}
            {archiveTarget && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="bg-white p-6 rounded w-96">
                        <h3 className="font-bold mb-3">
                            Close & Archive Request
                        </h3>

                        <p className="text-sm text-gray-600 mb-2">
                            <strong>Request:</strong>{" "}
                            {archiveTarget.message}
                        </p>

                        <textarea
                            className="w-full border p-2 mb-4"
                            placeholder="Final resolution (required)"
                            value={finalResolution}
                            onChange={(e) =>
                                setFinalResolution(e.target.value)
                            }
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setArchiveTarget(null)}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={archiveRequest}
                                className="bg-red-600 text-white px-4 py-2 rounded"
                            >
                                Archive
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
