import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import api from "../api/axios";
import Button from "../components/Button";
import Card from "../components/Card";
import { pageVariants } from "../animations/pageTransition";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const login = async () => {
        try {
            const res = await api.post("/auth/login", {
                email,
                password
            });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.role);

            toast.success("Login successful");

            setTimeout(() => {
                window.location.href =
                    res.data.role === "admin" ? "/admin" : "/resident";
            }, 500);
        } catch {
            toast.error("Invalid email or password");
        }
    };

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen flex items-center justify-center"
        >
            <Card>
                <h2 className="text-xl font-bold mb-4 text-center">
                    TAGT Login
                </h2>

                <input
                    className="w-full mb-3 px-3 py-2 border rounded"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    className="w-full mb-4 px-3 py-2 border rounded"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Button onClick={login} className="w-full">
                    Login
                </Button>
            </Card>
        </motion.div>
    );
}
