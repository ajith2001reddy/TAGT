import { useState } from "react";
import axios from "axios";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const res = await axios.post(
                "http://localhost:5000/api/auth/login",
                { email, password }
            );

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.role);

            if (res.data.residentId) {
                localStorage.setItem("residentId", res.data.residentId);
            }

            if (res.data.role === "admin") {
                window.location.href = "/admin";
            } else {
                window.location.href = "/resident";
            }
        } catch (err) {
            alert("Login failed");
        }
    };

    return (
        <div style={{ padding: 40 }}>
            <h2>TAGT Login</h2>

            <input
                type="email"
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

            <button onClick={handleLogin}>Login</button>
        </div>
    );
}
