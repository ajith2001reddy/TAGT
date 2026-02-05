import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import AppLayout from "../components/AppLayout";
import Button from "../components/Button";
import api from "../api/axios";

const STATUS_FLOW = {
    pending: ["in-progress"],
    "in-progress": ["on-hold", "done"],
    "on-hold": ["in-progress"],
};

const STATUS_COLORS = {
    pending: "bg-yellow-600/20 text-yellow-400 border-yellow-500/30",
    "in-progress": "bg-blue-600/20 text-blue-400 border-blue-500/30",
    "on-hold": "bg-orange-600/20 text-orange-400 border-orange-500/30",
    done: "bg-green-600/20 text-green-400 border-green-500/30",
};

export default function AdminRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [status, setStatus] = useState("");
    const [saving, setSaving] = useState(false);

    // ================= FETCH =================
    const fetchRequests = async () => {
        try {
            setLoading(true);

            // ✅ Correct endpoint
            const res = await api.get("/requests");

            setRequests(res.data?.requests || []);
        } catch {
            toast.error("Failed to load maintenance requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // ================= UPDATE =================
    const updateStatus = async () => {
        if (!status) {
            toast.error("Select a status");
            return;
        }

        setSaving(true);
        try {
            // ✅ Correct endpoint
            await api.put(`/requests/${selected._id}/status`, { status });

            toast.success("Status updated");

            setSelected(null);
            setStatus("");
            fetchRequests();
        } catch {
            toast.error("Failed to update status");
        } finally {
            setSaving(false);
        }
    };

    const badge = (s) => (
        <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[s]}`}
        >
            {s}
        </span>
    );

    return (
        <AppLayout>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Maintenance Requests</h1>

                {loading ? (
                    <p className="text-gray-400 text-center">Loading…</p>
                ) : requests.length === 0 ? (
                    <p className="text-gray-400 text-center">No requests found</p>
                ) : (
                    <div className="overflow-x-auto rounded-xl bg-white/10 border border-white/10">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-gray-400 border-b border-white/10">
                                    <th className="px-4 py-3 text-left">Title</th>
                                    <th className="px-4 py-3 text-left">Resident</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((r) => (
                                    <tr key={r._id} className="border-t border-white/5">
                                        {/* ✅ Correct fields */}
                                        <td className="px-4 py-3">{r.title}</td>
                                        <td className="px-4 py-3">{r.resident?.email}</td>
                                        <td className="px-4 py-3">{badge(r.status)}</td>
                                        <td className="px-4 py-3 text-right">
                                            {r.status !== "done" && (
                                                <Button onClick={() => setSelected(r)}>Update</Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* STATUS MODAL */}
            <AnimatePresence>
                {selected && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white/10 border border-white/10 rounded-xl p-6 w-full max-w-md"
                        >
                            <h3 className="text-lg font-semibold mb-4">
                                Update Request Status
                            </h3>

                            <select
                                className="w-full mb-4 bg-black/30 border border-white/10 rounded p-2"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="">Select status</option>
                                {STATUS_FLOW[selected.status]?.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>

                            <div className="flex justify-end gap-2">
                                <Button
                                    className="bg-gray-600"
                                    onClick={() => setSelected(null)}
                                >
                                    Cancel
                                </Button>
                                <Button disabled={saving} onClick={updateStatus}>
                                    {saving ? "Saving…" : "Save"}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AppLayout>
    );
}
