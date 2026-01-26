import { useEffect, useState } from "react";
import axios from "axios";
const api = axios.create({
    baseURL: API,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
export default function ResidentDashboard() {
    const [payments, setPayments] = useState([]);
    const [message, setMessage] = useState("");
    const residentId = localStorage.getItem("residentId");

    useEffect(() => {
        if (residentId) {
            api
                .get(`${API}/api/resident/payments/${residentId}`)
                .then((res) => setPayments(res.data))
                .catch((err) => console.error(err));
        }
    }, [residentId]);

    const raiseRequest = async () => {
        try {
            await api.post(`${API}/api/resident/request`, {
                residentId,
                message
            });

            alert("Request submitted");
            setMessage("");
        } catch (err) {
            console.error(err);
            alert("Failed to submit request");
        }
    };

    return (
        <div style={{ padding: 40 }}>
            <h1>TAGT - Resident Dashboard</h1>

            <button
                onClick={() => {
                    localStorage.clear();
                    window.location.href = "/";
                }}
            >
                Logout
            </button>

            <h2>My Payments</h2>
            <ul>
                {payments.map((p) => (
                    <li key={p._id}>
                        {p.month} — {p.status}
                    </li>
                ))}
            </ul>

            <h2>Raise Complaint / Request</h2>
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <br /><br />
            <button onClick={raiseRequest}>Submit</button>
        </div>
    );
}
