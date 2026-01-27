import { useState } from "react";
import api from "../api/axios";

const API = process.env.REACT_APP_API_URL || "https://tagt.onrender.com";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const login = async () => {
        try {
            const res = await api.post(`${API}/api/auth/login`, {
                email,
                password
            });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.role);

            window.location.href =
                res.data.role === "admin" ? "/admin" : "/resident";

        } catch (err) {
            console.error(err.response?.data || err.message);
            alert("Invalid email or password");
        }
    };

    return (
        <div style={{ padding: 40 }}>
            <h2>Login</h2>

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

            <button onClick={login}>Login</button>
        </div>
    );
}
