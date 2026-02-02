import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../api/axios";
import Button from "../components/Button";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const isSubmitting = useRef(false);
    const navigate = useNavigate();
    const { login } = useAuth(); // ✅ IMPORTANT

    const validateEmail = (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const handleLogin = async () => {
        if (loading || isSubmitting.current) return;

        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!validateEmail(email.trim())) {
            newErrors.email = "Invalid email format";
        }

        if (!password) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            toast.error("Please fill in all fields correctly");
            return;
        }

        isSubmitting.current = true;
        setLoading(true);

        try {
            const res = await api.post("/auth/login", {
                email: email.trim().toLowerCase(),
                password
            });

            const { token } = res.data || {};

            if (!token) {
                toast.error("Login failed: no token received");
                return;
            }

            // ✅ Update AuthContext (single source of truth)
            login(token);

            const payload = JSON.parse(atob(token.split(".")[1]));

            toast.success("Login successful");

            // ✅ Correct dashboard redirect
            if (payload.role === "admin") {
                navigate("/admin/dashboard", { replace: true });
            } else {
                navigate("/resident/dashboard", { replace: true });
            }
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                "Invalid email or password"
            );
            setPassword("");
            setErrors({});
        } finally {
            setLoading(false);
            setTimeout(() => {
                isSubmitting.current = false;
            }, 300);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-black to-slate-800">
            <Card>
                <div className="w-[360px]">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold text-blue-400">
                            TAGT
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            Property Management System
                        </p>
                    </div>

                    {/* Email */}
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-400 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            disabled={loading}
                            autoFocus
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-3 py-2 rounded-lg bg-black/40 text-white placeholder-gray-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-6">
                        <label className="block text-xs font-semibold text-gray-400 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            disabled={loading}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3 py-2 rounded-lg bg-black/40 text-white placeholder-gray-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Button */}
                    <Button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full py-3 text-sm font-semibold tracking-wide"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </Button>

                    {/* Footer */}
                    <p className="mt-6 text-center text-xs text-gray-500">
                        Secure access for residents & administrators
                    </p>
                </div>
            </Card>
        </div>
    );
}
