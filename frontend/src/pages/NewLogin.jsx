import { useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;

export default function NewLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        try {
            const res = await axios.post(`${API}/api/auth/login`, {
                email,
                password
            });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.role);
            localStorage.setItem("residentId", res.data.residentId || "");

            if (res.data.role === "admin") {
                window.location.href = "/admin";
            } else {
                window.location.href = "/resident";
            }
        } catch (err) {
            setError("Invalid email or password");
        }
    };

    return (
        <div style={{ padding: 40 }}>
            <h2>TAGT – Login</h2>

            <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <br /><br />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <br /><br />

            {error && <p style={{ color: "red" }}>{error}</p>}

            <button onClick={handleLogin}>Login</button>
        </div>
    );
}