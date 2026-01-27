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
                    {requests.map((req) => (
                        <motion.tr
                            key={req._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="border-t"
                        >
                            <td className="p-4">{req.message}</td>

                            <td className="p-4">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[req.status]}`}
                                >
                                    {req.status}
                                </span>
                            </td>

                            <td className="p-4 space-x-2">
                                {req.status !== "resolved" && (
                                    <>
                                        <button
                                            onClick={() =>
                                                changeStatus(
                                                    req._id,
                                                    "in-progress"
                                                )
                                            }
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            In Progress
                                        </button>

                                        <button
                                            onClick={() =>
                                                changeStatus(
                                                    req._id,
                                                    "resolved"
                                                )
                                            }
                                            className="text-sm text-green-600 hover:underline"
                                        >
                                            Resolve
                                        </button>
                                    </>
                                )}
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
