import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import DashboardLayout from "../layouts/DashboardLayout";
import Loader from "../components/Loader";
import { createRequest, getMyRequests } from "../services/residentService";

export default function ResidentDashboard() {
    const [message, setMessage] = useState("");
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        setLoading(true);
        const data = await getMyRequests();
        setRequests(data);
        setLoading(false);
    };

    const submitRequest = async () => {
        if (!message.trim()) {
            toast.error("Please enter a request message");
            return;
        }

        try {
            await createRequest(message);
            toast.success("Request submitted");
            setMessage("");
            fetchRequests();
        } catch {
            toast.error("Failed to submit request");
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    Resident Dashboard
                </h2>

                {/* Create Request */}
                <div className="bg-white rounded-xl shadow p-6 mb-8">
                    <h3 className="text-lg font-semibold mb-3">
                        New Maintenance Request
                    </h3>

                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full border rounded p-3 mb-4"
                        rows={3}
                        placeholder="Describe your issue..."
                    />

                    <button
                        onClick={submitRequest}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Submit Request
                    </button>
                </div>

                {/* My Requests */}
                <h3 className="text-lg font-semibold mb-3">
                    My Requests
                </h3>

                {loading ? (
                    <Loader />
                ) : (
                    <div className="space-y-4">
                        {requests.map((req) => (
                            <div
                                key={req._id}
                                className="bg-white rounded-xl shadow p-4"
                            >
                                <p className="text-gray-800 mb-2">
                                    {req.message}
                                </p>

                                <span
                                    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${req.status === "pending"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : req.status === "in-progress"
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-green-100 text-green-700"
                                        }`}
                                >
                                    {req.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </DashboardLayout>
    );
}
