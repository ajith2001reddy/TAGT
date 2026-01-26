import { useEffect, useState } from "react";
import api from "./api";

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
        try {
            const res = await api.get("/api/auth/requests");
            setRequests(res.data);
        } catch (err) {
            alert("Failed to load complaints");
            console.error(err);
        }
    };

    const fetchResidents = async () => {
        try {
            const res = await api.get("/api/resident");
            setResidents(res.data);
        } catch (err) {
            alert("Failed to load residents");
            console.error(err);
        }
    };

    const closeRequest = async (id) => {
        try {
            await api.post(`/api/auth/requests/close/${id}`);
            fetchRequests();
        } catch (err) {
            alert("Failed to close request");
        }
    };

    const addResident = async () => {
        try {
            await api.post("/api/auth/add-resident", {
                name,
                email,
                password,
                roomNumber,
                monthlyRent,
            });

            alert("Resident added successfully");

            setName("");
            setEmail("");
            setPassword("");
            setRoomNumber("");
            setMonthlyRent("");
            setView("residents");
        } catch (err) {
            alert("Failed to add resident");
            console.error(err);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    return (
        <div style={{ padding: 40 }}>
            <h1>TAGT - Admin Dashboard</h1>

            <button onClick={logout}>Logout</button>

            <div style={{ marginTop: 20 }}>
                <button onClick={() => setView("requests")}>Complaints</button>{" "}
                <button onClick={() => setView("residents")}>Residents</button>{" "}
                <button onClick={() => setView("addResident")}>Add Resident</button>
            </div>

            {view === "requests" && (
                <>
                    <h2>Complaints</h2>
                    <ul>
                        {requests.map((r) => (
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
                        {residents.map((r) => (
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
                    <input
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <br />
                    <input
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <br />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <br />
                    <input
                        placeholder="Room Number"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                    />
                    <br />
                    <input
                        placeholder="Monthly Rent"
                        value={monthlyRent}
                        onChange={(e) => setMonthlyRent(e.target.value)}
                    />
                    <br />
                    <button onClick={addResident}>Create</button>
                </>
            )}
        </div>
    );
}
