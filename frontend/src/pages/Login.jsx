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

    // Prevent double submission
    const isSubmitting = useRef(false);

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const login = async () => {
        // Prevent double click
        if (isSubmitting.current || loading) return;

        // Basic validation only (don't block submission for password length)
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

        // If validation errors exist, show toast once and stop
        if (Object.keys(newErrors).length > 0) {
            toast.error("Please fill in all fields correctly");
            return;
        }

        isSubmitting.current = true;
        setLoading(true);

        try {
            console.log("Attempting login with:", email.trim()); // Debug

            const res = await api.post("/auth/login", {
                email: email.trim().toLowerCase(),
                password: password
            });

            console.log("Login response:", res.data); // Debug

            if (!res.data.token) {
                toast.error("Invalid server response");
                return;
            }

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.role);

            toast.success("Login successful!");

            setTimeout(() => {
                window.location.href =
                    res.data.role === "admin" ? "/admin" : "/resident";
            }, 500);
        } catch (err) {
            console.error("Login error:", err.response?.data || err.message);

            const errorMessage = err.response?.data?.message || "Invalid email or password";
            toast.error(errorMessage);

            // Clear password on error
            setPassword("");
            setErrors({});
        } finally {
            setLoading(false);
            setTimeout(() => {
                isSubmitting.current = false;
            }, 500);
        }
    };

    const handleKeyPress = (e) => {
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

                {/* Email Field */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition ${errors.email
                                ? "border-red-500 focus:ring-red-500 bg-red-50"
                                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                        placeholder="admin@example.com"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors({ ...errors, email: "" });
                        }}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                        autoComplete="email"
                        autoFocus
                    />
                    {errors.email && (
                        <p className="text-red-500 text-xs mt-1 font-medium">
                            {errors.email}
                        </p>
                    )}
                </div>

                {/* Password Field */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition ${errors.password
                                ? "border-red-500 focus:ring-red-500 bg-red-50"
                                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors({ ...errors, password: "" });
                        }}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                        autoComplete="current-password"
                    />
                    {errors.password && (
                        <p className="text-red-500 text-xs mt-1 font-medium">
                            {errors.password}
                        </p>
                    )}
                </div>

                <Button
                    onClick={login}
                    className={`w-full py-2.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing in...
                        </span>
                    ) : "Sign In"}
                </Button>

                {/* Debug info - remove in production */}
                <div className="mt-4 text-xs text-gray-400 text-center">
                    API: {process.env.REACT_APP_API_URL || "Using default"}
                </div>
            </Card>
        </motion.div>
    );
}