import { useEffect, useState } from "react";
import api from "../api/axios";


export default function ResidentDashboard() {
    const [payments, setPayments] = useState([]);
    const [message, setMessage] = useState("");

    const residentId = localStorage.getItem("residentId");

    useEffect(() => {
        if (!residentId) return;

        const fetchPayments = async () => {
            try {
                const res = await api.get(`/api/resident/payments/${residentId}`);
                setPayments(res.data);
            } catch (err) {
                console.error(err);
                alert("Failed to load payments");
            }
        };

        fetchPayments();
    }, [residentId]);

    const raiseRequest = async () => {
        try {
            await api.post("/api/resident/request", {
                residentId,
                message,
            });

            alert("Request submitted");
            setMessage("");
        } catch (err) {
            console.error(err);
            alert("Failed to submit request");
        }
    };

    const logout = () => {
        localStorage.clear();
        window.location.href = "/";
    };

    return (
        <div style={{ padding: 40 }}>
            <h1>TAGT - Resident Dashboard</h1>

            <button onClick={logout}>Logout</button>

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
