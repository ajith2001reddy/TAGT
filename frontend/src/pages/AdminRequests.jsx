import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminRequests() {
    const [requests, setRequests] = useState([]);

    const token = localStorage.getItem("token");

    const fetchRequests = async () => {
        const res = await axios.get("/admin/requests", {
            headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(res.data);
    };

    const updateStatus = async (id, status) => {
        await axios.put(
            `/admin/requests/${id}/status`,
            { status },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchRequests();
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    return (
        <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Maintenance Requests</h2>

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
                    {requests.map(req => (
                        <tr key={req._id} className="border-b text-center">
                            <td>{req.message}</td>
                            <td>{req.residentId?.email}</td>
                            <td className="capitalize">{req.status}</td>
                            <td className="space-x-2">
                                {req.status === "pending" && (
                                    <button
                                        className="bg-blue-500 text-white px-3 py-1 rounded"
                                        onClick={() => updateStatus(req._id, "approved")}
                                    >
                                        Approve
                                    </button>
                                )}

                                {req.status === "approved" && (
                                    <button
                                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                                        onClick={() => updateStatus(req._id, "in_progress")}
                                    >
                                        In Progress
                                    </button>
                                )}

                                {req.status !== "resolved" && (
                                    <button
                                        className="bg-green-600 text-white px-3 py-1 rounded"
                                        onClick={() => updateStatus(req._id, "resolved")}
                                    >
                                        Resolve
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
