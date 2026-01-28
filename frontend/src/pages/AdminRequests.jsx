import { useEffect, useState } from "react";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";

/**
 * AdminRequests – FINAL FIX
 * - Wrapped in DashboardLayout (SPA-safe)
 * - Buttons explicitly non-submit
 * - No browser navigation side effects
 */

export default function AdminRequests() {
    const [requests, setRequests] = useState([]);

    // Phase 1
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [workflowStatus, setWorkflowStatus] = useState("");
    const [adminNote, setAdminNote] = useState("");

    // Phase 2
    const [archiveTarget, setArchiveTarget] = useState(null);
    const [finalResolution, setFinalResolution] = useState("");

    /* ================= FETCH REQUESTS ================= */
    const fetchRequests = async () => {
        const res = await api.get("/admin/requests");
        setRequests(Array.isArray(res.data) ? res.data : []);
    };

    /* ================= LEGACY STATUS UPDATE ================= */
    const updateStatus = async (id, status) => {
        await api.put(`/admin/requests/${id}/status`, { status });
        fetchRequests();
    };

    /* ================= PHASE 1 WORKFLOW UPDATE ================= */
    const updateWorkflowStatus = async () => {
        if (!workflowStatus || !adminNote.trim()) {
            alert("Workflow status and admin note are required");
            return;
        }

        await api.put(
            `/admin/requests/${selectedRequest._id}/workflow-status`,
            { workflowStatus, note: adminNote }
        );

        setSelectedRequest(null);
        setWorkflowStatus("");
        setAdminNote("");
        fetchRequests();
    };

    /* ================= PHASE 2 ARCHIVE ================= */
    const archiveRequest = async () => {
        if (!finalResolution.trim()) {
            alert("Final resolution is required");
            return;
        }

        await api.post(
            `/admin/requests/${archiveTarget._id}/archive`,
            { finalResolution }
        );

        setArchiveTarget(null);
        setFinalResolution("");
        fetchRequests();
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    return (
        <DashboardLayout>
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
                        {requests.map((req) => {
                            const displayStatus =
                                req.workflowStatus || req.status;

                            const isResolved =
                                displayStatus === "resolved" ||
                                displayStatus === "Done";

                            return (
                                <tr
                                    key={req._id}
                                    className="border-b text-center"
                                >
                                    <td>{req.message}</td>
                                    <td>{req.residentId?.email}</td>

                                    <td className="capitalize font-medium">
                                        {displayStatus}
                                    </td>

                                    <td>
                                        {isResolved ? (
                                            <span className="text-green-600 font-semibold">
                                                Closed
                                            </span>
                                        ) : (
                                            <div className="flex gap-2 justify-center">
                                                {req.status === "pending" && (
                                                    <button
                                                        type="button"
                                                        className="bg-blue-500 text-white px-3 py-1 rounded"
                                                        onClick={() =>
                                                            updateStatus(
                                                                req._id,
                                                                "in-progress"
                                                            )
                                                        }
                                                    >
                                                        In Progress
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
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

                                                <button
                                                    type="button"
                                                    className="bg-gray-800 text-white px-3 py-1 rounded"
                                                    onClick={() =>
                                                        setSelectedRequest(req)
                                                    }
                                                >
                                                    Update (Pro)
                                                </button>

                                                <button
                                                    type="button"
                                                    className="bg-red-600 text-white px-3 py-1 rounded"
                                                    onClick={() =>
                                                        setArchiveTarget(req)
                                                    }
                                                >
                                                    Close & Archive
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* ================= WORKFLOW MODAL ================= */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="bg-white p-6 rounded w-96">
                        <h3 className="font-bold mb-3">
                            Update Request Workflow
                        </h3>

                        <select
                            className="w-full border p-2 mb-3"
                            value={workflowStatus}
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
                                type="button"
                                onClick={() =>
                                    setSelectedRequest(null)
                                }
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={updateWorkflowStatus}
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= ARCHIVE MODAL ================= */}
            {archiveTarget && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="bg-white p-6 rounded w-96">
                        <h3 className="font-bold mb-3">
                            Close & Archive Request
                        </h3>

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
                                type="button"
                                onClick={() =>
                                    setArchiveTarget(null)
                                }
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={archiveRequest}
                                className="bg-red-600 text-white px-4 py-2 rounded"
                            >
                                Archive
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
