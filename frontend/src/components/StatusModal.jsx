import { useState } from "react";

const FLOW = {
    Received: ["In-Progress"],
    "In-Progress": ["On Hold", "Done"],
    "On Hold": ["In-Progress"]
};

export default function StatusModal({ request, onClose, onSave }) {
    const [status, setStatus] = useState("");
    const [note, setNote] = useState("");

    const allowed = FLOW[request.status] || [];

    const submit = () => {
        if (!status || !note.trim()) {
            alert("Status and Admin Note are required");
            return;
        }
        onSave(status, note);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white p-6 rounded w-96">
                <h3 className="font-bold mb-4">Update Request Status</h3>

                <select
                    className="w-full border p-2 mb-3"
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="">Select status</option>
                    {allowed.map((s) => (
                        <option key={s}>{s}</option>
                    ))}
                </select>

                <textarea
                    className="w-full border p-2 mb-4"
                    placeholder="Admin note (required)"
                    onChange={(e) => setNote(e.target.value)}
                />

                <div className="flex justify-end gap-2">
                    <button onClick={onClose}>Cancel</button>
                    <button
                        onClick={submit}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
