"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    async function handleReset(e: React.FormEvent) {
        e.preventDefault();
        await sendPasswordResetEmail(auth, email);
        setMessage("Password reset email sent.");
    }

    return (
        <>
            <form onSubmit={handleReset} className="space-y-4">
                <h1 className="text-2xl font-bold text-center">Reset Password</h1>

                <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full p-3 bg-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <button className="bg-violet-600 hover:bg-violet-700 transition w-full py-3 rounded-lg font-semibold">
                    Send Reset Link
                </button>

                {message && (
                    <p className="text-green-400 text-sm text-center">{message}</p>
                )}
            </form>

            <div className="mt-6 text-sm text-neutral-400 text-center">
                Remember your password?{" "}
                <Link href="/login" className="text-violet-500 hover:text-violet-400">
                    Login
                </Link>
            </div>
        </>
    );
}