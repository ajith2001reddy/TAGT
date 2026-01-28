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
    const [loading, setLoading] = useState(false);

    // Email validation regex
    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateForm = () => {
        // Check empty fields
        if (!email.trim() || !password.trim()) {
            toast.error("Please enter both email and password");
            return false;
        }

        // Check email format
        if (!validateEmail(email.trim())) {
            toast.error("Please enter a valid email address");
            return false;
        }

        // Check password length (backend requires at least 6)
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return false;
        }

        return true;
    };

    const login = async () => {
        // Prevent double submission
        if (loading) return;

        // Validate before API call
        if (!validateForm()) return;

        setLoading(true);

        try {
            const res = await api.post("/auth/login", {
                email: email.trim().toLowerCase(),
                password: password
            });

            // Validate response has required data
            if (!res.data.token || !res.data.role) {
                toast.error("Invalid server response");
                return;
            }

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.role);

            toast.success(res.data.message || "Login successful");

            setTimeout(() => {
                window.location.href =
                    res.data.role === "admin" ? "/admin" : "/resident";
            }, 500);
        } catch (err) {
            // Handle specific error messages from backend
            const errorMessage = err.response?.data?.message
                || "Invalid email or password";
            toast.error(errorMessage);

            // Clear password field on error (security best practice)
            setPassword("");
        } finally {
            setLoading(false);
        }
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            login();
        }
    };

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen flex items-center justify-center bg-gray-50"
        >
            <Card>
                <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
                    TAGT Login
                </h2>

                <input
                    type="email"
                    className="w-full mb-3 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    autoComplete="email"
                    autoFocus
                />

                <input
                    type="password"
                    className="w-full mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    autoComplete="current-password"
                />

                <Button
                    onClick={login}
                    className={`w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading}
                >
                    {loading ? "Signing in..." : "Login"}
                </Button>

                <p className="text-xs text-gray-500 mt-4 text-center">
                    Property Management System v1.0
                </p>
            </Card>
        </motion.div>
    );
}