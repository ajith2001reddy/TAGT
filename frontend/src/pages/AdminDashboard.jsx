import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
    // navigation
    const [view, setView] = useState("requests");

    // data
    const [requests, setRequests] = useState([]);
    const [residents, setResidents] = useState([]);

    // add resident form
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [roomNumber, setRoomNumber] = useState("");
    const [monthlyRent, setMonthlyRent] = useState("");

    useEffect(() => {
        if (view === "requests") fetchRequests();
        if (view === "residents") fetchResidents();
    }, [view]);

    // -------- API CALLS --------

    const fetchRequests = async () => {
        const res = await axios.get("http://localhost:5000/api/admin/requests");
        setRequests(res.data);
    };

    const fetchResidents = async () => {
        const res = await axios.get("http://localhost:5000/api/resident");
        setResidents(res.data);
    };

    const closeRequest = async (id) => {
        await axios.post(
            `http://localhost:5000/api/admin/requests/close/${id}`
        );
        fetchRequests();
    };

    const addResident = async () => {
        await axios.post("http://localhost:5000/api/admin/add-resident", {
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

            {/* LOGOUT */}
            <button
                onClick={() => {
                    localStorage.clear();
                    window.location.href = "/";
                }}
                style={{ marginBottom: 20 }}
            >
                Logout
            </button>

            {/* NAVIGATION */}
            <div style={{ marginBottom: 20 }}>
                <button onClick={() => setView("requests")}>Complaints</button>{" "}
                <button onClick={() => setView("residents")}>Residents</button>{" "}
                <button onClick={() => setView("addResident")}>Add Resident</button>
            </div>

            {/* REQUESTS */}
            {view === "requests" && (
                <>
                    <h2>Complaints / Requests</h2>
                    {requests.length === 0 && <p>No complaints</p>}
                    <ul>
                        {requests.map((r) => (
                            <li key={r._id}>
                                <strong>Status:</strong> {r.status}<br />
                                <strong>Message:</strong> {r.message}<br />
                                {r.status === "OPEN" && (
                                    <button onClick={() => closeRequest(r._id)}>
                                        Close Request
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {/* RESIDENTS */}
            {view === "residents" && (
                <>
                    <h2>Residents</h2>
                    {residents.length === 0 && <p>No residents</p>}
                    <ul>
                        {residents.map((r) => (
                            <li key={r._id}>
                                {r.name} — Room {r.roomNumber} — ₹{r.monthlyRent}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {/* ADD RESIDENT */}
            {view === "addResident" && (
                <>
                    <h2>Add Resident</h2>

                    <input
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    /><br /><br />

                    <input
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    /><br /><br />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    /><br /><br />

                    <input
                        placeholder="Room Number"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                    /><br /><br />

                    <input
                        placeholder="Monthly Rent"
                        value={monthlyRent}
                        onChange={(e) => setMonthlyRent(e.target.value)}
                    /><br /><br />

                    <button onClick={addResident}>Create Resident</button>
                </>
            )}
        </div>
    );
}
