import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Button from "../components/Button";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";
import { login as loginService } from "../services/authService";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const isSubmitting = useRef(false);
    const navigate = useNavigate();
    const { login, user } = useAuth();

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
            const data = await loginService({
                email: email.trim().toLowerCase(),
                password,
            });

            const token = data?.token;

            if (!token) {
                toast.error("Invalid login response");
                return;
            }

            // ✅ Single source of truth
            login(token);

            toast.success("Login successful");

            // ⏳ Allow AuthContext to update, then redirect
            setTimeout(() => {
                navigate(
                    user?.role === "admin"
                        ? "/admin/dashboard"
                        : "/resident/dashboard",
                    { replace: true }
                );
            }, 0);
        } catch (err) {
            toast.error(err?.message || "Invalid email or password");
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
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold text-blue-400">
                            TAGT
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            Property Management System
                        </p>
                    </div>

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
                            className="w-full px-3 py-2 rounded-lg bg-black/40 text-white border border-white/10"
                        />
                        {errors.email && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs font-semibold text-gray-400 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            disabled={loading}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-black/40 text-white border border-white/10"
                        />
                        {errors.password && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <Button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full py-3 text-sm font-semibold"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
