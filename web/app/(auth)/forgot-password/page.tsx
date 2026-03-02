"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleReset(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setSent(true);
        } finally {
            setLoading(false);
        }
    }

    if (sent) {
        return (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
                <div style={{
                    width: "56px", height: "56px", borderRadius: "16px",
                    background: "var(--green-bg)", border: "1px solid rgba(0,230,118,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 20px", fontSize: "26px",
                }}>
                    ✓
                </div>
                <h2 className="display-text" style={{ fontSize: "22px", marginBottom: "10px" }}>Check your inbox</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.7, marginBottom: "28px" }}>
                    We sent a password reset link to <strong style={{ color: "var(--text-primary)" }}>{email}</strong>
                </p>
                <Link href="/login" className="btn-ghost" style={{ display: "inline-flex" }}>
                    ← Back to sign in
                </Link>
            </div>
        );
    }

    return (
        <>
            <div style={{ marginBottom: "32px" }}>
                <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "8px" }}>Reset password</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                    We'll send a reset link to your email
                </p>
            </div>

            <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                    <label className="label-text" style={{ display: "block", marginBottom: "8px" }}>Email Address</label>
                    <input
                        type="email"
                        className="input-field"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    style={{ width: "100%", padding: "14px", marginTop: "4px" }}
                >
                    {loading ? "Sending..." : "Send Reset Link →"}
                </button>
            </form>

            <div style={{ marginTop: "24px", textAlign: "center", fontSize: "14px", color: "var(--text-secondary)" }}>
                <Link href="/login" style={{ color: "var(--accent-primary)", textDecoration: "none" }}>
                    ← Back to sign in
                </Link>
            </div>
        </>
    );
}