import { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;

export default function AdminDashboard() {
    const [view, setView] = useState("requests");
    const [requests, setRequests] = useState([]);
    const [residents, setResidents] = useState([]);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [roomNumber, setRoomNumber] = useState("");
    const [monthlyRent, setMonthlyRent] = useState("");

    useEffect(() => {
        if (view === "requests") fetchRequests();
        if (view === "residents") fetchResidents();
    }, [view]);

    const fetchRequests = async () => {
        const res = await axios.get(`${API}/api/admin/requests`);
        setRequests(res.data);
    };

    const fetchResidents = async () => {
        const res = await axios.get(`${API}/api/resident`);
        setResidents(res.data);
    };

    const closeRequest = async (id) => {
        await api.post(`${API}/api/admin/requests/close/${id}`);
        fetchRequests();
    };

    const addResident = async () => {
        await api.post(`${API}/api/admin/add-resident`, {
            name,
            email,
            password,
            roomNumber,
            monthlyRent
        });

        alert("Resident added successfully");

        setName("");
        setEmail("");
        setPassword("");
        setRoomNumber("");
        setMonthlyRent("");
        setView("residents");
    };

    return (
        <div style={{ padding: 40 }}>
            <h1>TAGT - Admin Dashboard</h1>

            <button onClick={() => {
                localStorage.clear();
                window.location.href = "/";
            }}>
                Logout
            </button>

            <div style={{ marginTop: 20 }}>
                <button onClick={() => setView("requests")}>Complaints</button>{" "}
                <button onClick={() => setView("residents")}>Residents</button>{" "}
                <button onClick={() => setView("addResident")}>Add Resident</button>
            </div>

            {view === "requests" && (
                <>
                    <h2>Complaints</h2>
                    <ul>
                        {requests.map(r => (
                            <li key={r._id}>
                                {r.message} — {r.status}
                                {r.status === "OPEN" && (
                                    <button onClick={() => closeRequest(r._id)}>
                                        Close
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {view === "residents" && (
                <>
                    <h2>Residents</h2>
                    <ul>
                        {residents.map(r => (
                            <li key={r._id}>
                                {r.name} — Room {r.roomNumber}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {view === "addResident" && (
                <>
                    <h2>Add Resident</h2>
                    <input placeholder="Name" onChange={e => setName(e.target.value)} /><br />
                    <input placeholder="Email" onChange={e => setEmail(e.target.value)} /><br />
                    <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} /><br />
                    <input placeholder="Room Number" onChange={e => setRoomNumber(e.target.value)} /><br />
                    <input placeholder="Monthly Rent" onChange={e => setMonthlyRent(e.target.value)} /><br />
                    <button onClick={addResident}>Create</button>
                </>
            )}
        </div>
    );
}
