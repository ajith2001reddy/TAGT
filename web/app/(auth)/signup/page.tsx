"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import Script from "next/script";

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107" />
            <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00" />
            <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50" />
            <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2" />
        </svg>
    );
}

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await createUserWithEmailAndPassword(auth, email, password);

            // 🔥 Do NOT manually get token
            await api.post("/auth/register", { name, phoneNumber: phone, password });

            router.push("/dashboard");

        } catch (err: unknown) {
            const error = err as { code?: string; message?: string };
            if (error.code === "auth/email-already-in-use") {
                setError("Email is already registered. Please login instead.");
            } else {
                setError(error.message || "Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleSignup() {
        setGoogleLoading(true);
        setError("");
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await api.post("/auth/register", {
                name: result.user.displayName || result.user.email?.split("@")[0] || "User"
            });
            router.push("/dashboard");
        } catch (err: unknown) {
            const error = err as { code?: string };
            if (error.code !== "auth/popup-closed-by-user") {
                setError("Google sign-up failed. Please try again.");
            }
        } finally {
            setGoogleLoading(false);
        }
    }

    return (
        <>
            <Script
                src="https://www.google.com/recaptcha/enterprise.js?render=6LcYdYIsAAAAALs9O0fknr8dlztXd6NDHYiE0mYd"
                strategy="beforeInteractive"
            />
            <div style={{ marginBottom: "28px" }}>
                <Link href="/" style={{ display: "inline-block", marginBottom: "20px" }}>
                    <img src="/logo.png" alt="TAGT Logo" style={{ width: "64px", height: "64px", borderRadius: "14px", border: "1px solid var(--border-subtle)" }} />
                </Link>
                <h1 className="display-text" style={{ fontSize: "26px", marginBottom: "6px" }}>
                    Create your account
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                    Start managing your properties today
                </p>
            </div>

            {/* Google Sign-Up */}
            <button
                onClick={handleGoogleSignup}
                disabled={googleLoading || loading}
                style={{
                    width: "100%",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                    padding: "12px 20px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border-strong)",
                    borderRadius: "10px",
                    color: "var(--text-primary)",
                    fontSize: "14px", fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                    transition: "all 0.2s ease",
                    marginBottom: "20px",
                }}
                onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.2)";
                }}
                onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-strong)";
                }}
            >
                {googleLoading ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                ) : <GoogleIcon />}
                {googleLoading ? "Connecting..." : "Sign up with Google"}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
                <span style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>
                    OR
                </span>
                <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
            </div>

            <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                    <label className="label-text" style={{ display: "block", marginBottom: "7px" }}>Full Name</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Alex Johnson"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="label-text" style={{ display: "block", marginBottom: "7px" }}>Email Address</label>
                    <input
                        type="email"
                        className="input-field"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="label-text" style={{ display: "block", marginBottom: "7px" }}>Phone Number</label>
                    <input
                        className="input-field"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="label-text" style={{ display: "block", marginBottom: "7px" }}>Password</label>
                    <input
                        type="password"
                        className="input-field"
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {error && (
                    <div style={{
                        padding: "11px 14px", borderRadius: "10px",
                        background: "var(--red-bg)", border: "1px solid rgba(255,82,82,0.2)",
                        color: "var(--red)", fontSize: "13px",
                    }}>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading || googleLoading}
                    style={{ width: "100%", padding: "13px", marginTop: "2px", fontSize: "14px" }}
                >
                    {loading ? "Creating Account..." : "Create Account →"}
                </button>
            </form>

            <div style={{
                marginTop: "24px", paddingTop: "20px",
                borderTop: "1px solid var(--border-subtle)",
                textAlign: "center", fontSize: "14px", color: "var(--text-secondary)",
            }}>
                Already have an account?{" "}
                <Link href="/login" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 500 }}>
                    Sign in
                </Link>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
    );
}