import { updateRequestStatus } from "../services/adminService";

export default function RequestTable({ requests, refresh }) {
    return (
        <table className="w-full bg-white rounded shadow">
            <thead>
                <tr>
                    <th>Message</th>
                    <th>Resident</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>

            <tbody>
                {requests.map((r) => (
                    <tr key={r._id}>
                        <td>{r.message}</td>
                        <td>{r.residentId?.email}</td>
                        <td>{r.status}</td>
                        <td>
                            <button onClick={() => updateRequestStatus(r._id, "in-progress")}>
                                In Progress
                            </button>
                            <button onClick={() => updateRequestStatus(r._id, "resolved")}>
                                Resolve
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
