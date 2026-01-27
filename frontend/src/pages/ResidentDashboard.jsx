import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import { createRequest, getMyRequests } from "../services/residentService";

export default function ResidentDashboard() {
    const [message, setMessage] = useState("");
    const [requests, setRequests] = useState([]);

    const loadRequests = async () => {
        const data = await getMyRequests();
        setRequests(data);
    };

    const submitRequest = async () => {
        if (!message.trim()) {
            toast.error("Enter request message");
            return;
        }

        await createRequest(message);
        toast.success("Request sent");
        setMessage("");
        loadRequests();
    };

    useEffect(() => {
        loadRequests();
    }, []);

    return (
        <DashboardLayout>
            <h2 className="text-2xl font-bold mb-4">My Requests</h2>

            <textarea
                className="w-full p-3 border rounded mb-3"
                placeholder="Describe your issue..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />

            <button
                onClick={submitRequest}
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >
                Submit Request
            </button>

            <ul className="mt-6 space-y-3">
                {requests.map((r) => (
                    <li key={r._id} className="bg-white p-4 rounded shadow">
                        <p>{r.message}</p>
                        <span className="text-sm text-gray-500">
                            Status: {r.status}
                        </span>
                    </li>
                ))}
            </ul>
        </DashboardLayout>
    );
}
