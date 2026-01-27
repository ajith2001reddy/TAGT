import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { updateRequestStatus } from "../services/adminService";

export default function RequestTable({ requests, refresh }) {
    const statusColors = {
        pending: "bg-yellow-100 text-yellow-700",
        "in-progress": "bg-blue-100 text-blue-700",
        resolved: "bg-green-100 text-green-700"
    };

    const changeStatus = async (id, status) => {
        try {
            await updateRequestStatus(id, status);
            toast.success("Status updated");
            refresh();
        } catch {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow mt-8 overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-100 text-sm">
                    <tr>
                        <th className="p-4">Message</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {requests.length === 0 && (
                        <tr>
                            <td
                                colSpan="3"
                                className="p-6 text-center text-gray-500"
                            >
                                No requests found.
                            </td>
                        </tr>
                    )}

                    {requests.map((req) => (
                        <motion.tr
                            key={req._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="border-t hover:bg-gray-50 transition"
                        >
                            <td className="p-4">{req.message}</td>

                            <td className="p-4">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[req.status]}`}
                                >
                                    {req.status}
                                </span>
                            </td>

                            <td className="p-4 space-x-3">
                                <button
                                    aria-label="Mark as in progress"
                                    disabled={
                                        req.status === "in-progress" ||
                                        req.status === "resolved"
                                    }
                                    onClick={() =>
                                        changeStatus(req._id, "in-progress")
                                    }
                                    className={`text-sm ${req.status === "in-progress" ||
                                            req.status === "resolved"
                                            ? "text-gray-400 cursor-not-allowed"
                                            : "text-blue-600 hover:underline"
                                        }`}
                                >
                                    In Progress
                                </button>

                                <button
                                    aria-label="Mark as resolved"
                                    disabled={req.status === "resolved"}
                                    onClick={() =>
                                        changeStatus(req._id, "resolved")
                                    }
                                    className={`text-sm ${req.status === "resolved"
                                            ? "text-gray-400 cursor-not-allowed"
                                            : "text-green-600 hover:underline"
                                        }`}
                                >
                                    Resolve
                                </button>
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
