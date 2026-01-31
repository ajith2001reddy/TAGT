import { useState, useRef } from "react";
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
    const [errors, setErrors] = useState({});

    const isSubmitting = useRef(false);

    const validateEmail = (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const login = async () => {
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
            const response = await api.post("/auth/login", {
                email: email.trim().toLowerCase(),
                password
            });

            const { token, role } = response.data || {};

            if (!token) {
                toast.error("Login failed: no token received");
                return;
            }

            localStorage.setItem("token", token);
            if (role) localStorage.setItem("role", role);

            toast.success("Login successful");

            setTimeout(() => {
                if (role === "admin") {
                    window.location.assign("/admin");
                } else {
                    window.location.assign("/resident");
                }
            }, 300);
        } catch (err) {
            if (!err.response) {
                toast.error("Network error. Please try again.");
            } else {
                toast.error(
                    err.response?.data?.message || "Invalid email or password"
                );
            }

            setPassword("");
            setErrors({});
        } finally {
            setLoading(false);
            setTimeout(() => {
                isSubmitting.current = false;
            }, 300);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !loading) {
            login();
        }
    };

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen flex items-center justify-center bg-gray-100"
        >
            <Card>
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-800">
                        TAGT Login
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Property Management System
                    </p>
                </div>

                {/* Email */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        disabled={loading}
                        autoFocus
                        autoComplete="email"
                        onKeyDown={handleKeyDown}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) {
                                setErrors({ ...errors, email: "" });
                            }
                        }}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${errors.email
                                ? "border-red-500 focus:ring-red-500 bg-red-50"
                                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                        placeholder="admin@example.com"
                    />
                    {errors.email && (
                        <p className="text-red-500 text-xs mt-1 font-medium">
                            {errors.email}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        disabled={loading}
                        autoComplete="current-password"
                        onKeyDown={handleKeyDown}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) {
                                setErrors({ ...errors, password: "" });
                            }
                        }}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${errors.password
                                ? "border-red-500 focus:ring-red-500 bg-red-50"
                                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                        placeholder="Enter your password"
                    />
                    {errors.password && (
                        <p className="text-red-500 text-xs mt-1 font-medium">
                            {errors.password}
                        </p>
                    )}
                </div>

                <Button
                    onClick={login}
                    disabled={loading}
                    className={`w-full py-2.5 ${loading ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                >
                    {loading ? "Signing in..." : "Sign In"}
                </Button>
            </Card>
        </motion.div>
    );
}
