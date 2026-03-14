"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ResetPasswordPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate reset email
        setSent(true);
    };

    return (
        <div style={{
            minHeight: "100vh", background: "#04070c", color: "#f0f4f8",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }}>
            <div style={{
                width: "100%", maxWidth: "400px", padding: "40px", borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)",
                backdropFilter: "blur(20px)", textAlign: "center"
            }}>
                <Image src="/logo.png" alt="Logo" width={40} height={40} style={{ marginBottom: "24px" }} />

                {!sent ? (
                    <>
                        <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "12px" }}>Reset Password</h1>
                        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", marginBottom: "32px" }}>
                            Enter your email and we'll send you a link to reset your password.
                        </p>
                        <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "8px" }}>Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    style={{
                                        width: "100%", padding: "14px", borderRadius: "10px",
                                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff"
                                    }}
                                />
                            </div>
                            <button type="submit" style={{
                                width: "100%", padding: "16px", borderRadius: "12px", background: "linear-gradient(135deg, #00d4ff, #0066cc)",
                                color: "#000", fontWeight: 700, border: "none", cursor: "pointer"
                            }}>Send Reset Link</button>
                        </form>
                    </>
                ) : (
                    <>
                        <div style={{
                            width: "56px", height: "56px", borderRadius: "50%", background: "rgba(0,212,255,0.1)",
                            display: "flex", alignItems: "center", justifyContent: "center", color: "#00d4ff", fontSize: "24px", margin: "0 auto 24px"
                        }}>✓</div>
                        <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "12px" }}>Check your email</h1>
                        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", marginBottom: "32px" }}>
                            We've sent a password reset link to <strong>{email}</strong> if it exists in our system.
                        </p>
                    </>
                )}

                <div style={{ marginTop: "32px", fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
                    Back to <Link href="/login" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 600 }}>Login</Link>
                </div>
            </div>
        </div>
    );
}
