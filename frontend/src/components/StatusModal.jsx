import { useState } from "react";
import { motion } from "framer-motion";
import Button from "./Button";

const FLOW = {
    Received: ["In-Progress"],
    "In-Progress": ["On Hold", "Done"],
    "On Hold": ["In-Progress"]
};

export default function StatusModal({ request, onClose, onSave }) {
    const [status, setStatus] = useState("");
    const [note, setNote] = useState("");

    const allowed = FLOW[request.workflowStatus || request.status] || [];

    const submit = () => {
        if (!status || !note.trim()) return;
        onSave(status, note.trim());
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="
                    glass
                    w-full max-w-md
                    rounded-2xl
                    p-6
                    border border-white/10
                "
            >
                <h3 className="text-lg font-semibold text-white mb-4">
                    Update Request Status
                </h3>

                {/* STATUS */}
                <label className="block text-xs text-gray-400 mb-1">
                    New Status
                </label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="
                        w-full mb-4 px-3 py-2 rounded-xl
                        bg-black/40 text-white
                        border border-white/10
                        focus:outline-none focus:ring-2 focus:ring-blue-400/60
                    "
                >
                    <option value="">Select status</option>
                    {allowed.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>

                {/* NOTE */}
                <label className="block text-xs text-gray-400 mb-1">
                    Admin Note
                </label>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Required explanation or resolution"
                    className="
                        w-full h-28 mb-6 px-3 py-2 rounded-xl resize-none
                        bg-black/40 text-white
                        border border-white/10
                        focus:outline-none focus:ring-2 focus:ring-blue-400/60
                    "
                />

                {/* ACTIONS */}
                <div className="flex justify-end gap-2">
                    <Button
                        variant="glass"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="primary"
                        onClick={submit}
                        disabled={!status || !note.trim()}
                    >
                        Save
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
