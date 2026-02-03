import { motion } from "framer-motion";
import Button from "./Button";
import { updateRequestStatus } from "../services/adminService";

export default function RequestTable({ requests = [], refresh }) {
    const handleUpdate = async (id, status) => {
        try {
            await updateRequestStatus(id, status);
            refresh?.();
        } catch (err) {
            console.error("UPDATE REQUEST ERROR", err);
        }
    };

    if (!requests.length) {
        return (
            <div className="glass rounded-2xl p-6 text-center text-gray-400">
                No maintenance requests found
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-2xl p-4 sm:p-6 overflow-x-auto"
        >
            <table className="w-full text-sm">
                <thead className="text-gray-400 border-b border-white/10">
                    <tr>
                        <th className="text-left py-2">Message</th>
                        <th className="text-left py-2">Resident</th>
                        <th className="text-center py-2">Status</th>
                        <th className="text-right py-2">Actions</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                    {requests.map((r) => (
                        <tr key={r._id} className="hover:bg-white/5 transition">
                            <td className="py-3 text-gray-200 max-w-[260px] truncate">
                                {r.message}
                            </td>

                            <td className="py-3 text-gray-300">
                                {r.residentId?.email || "—"}
                            </td>

                            <td className="py-3 text-center">
                                <span
                                    className={`px-2 py-1 rounded-lg text-xs font-medium
                                        ${r.status === "resolved"
                                            ? "bg-green-500/20 text-green-400"
                                            : r.status === "in-progress"
                                                ? "bg-yellow-500/20 text-yellow-400"
                                                : "bg-blue-500/20 text-blue-400"
                                        }`}
                                >
                                    {r.status}
                                </span>
                            </td>

                            <td className="py-3 text-right space-x-2">
                                <Button
                                    variant="glass"
                                    className="text-xs"
                                    onClick={() =>
                                        handleUpdate(r._id, "in-progress")
                                    }
                                    disabled={r.status !== "pending"}
                                >
                                    In Progress
                                </Button>

                                <Button
                                    variant="primary"
                                    className="text-xs"
                                    onClick={() =>
                                        handleUpdate(r._id, "resolved")
                                    }
                                    disabled={r.status === "resolved"}
                                >
                                    Resolve
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </motion.div>
    );
}
