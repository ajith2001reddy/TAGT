"use client";

import { useState, useEffect } from "react";
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    ConfirmationResult
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

declare global {
    interface Window {
        recaptchaVerifier: any;
    }
}

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

export default function LoginPage() {
    const router = useRouter();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState("");

    // Phone Auth states
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [otp, setOtp] = useState("");
    const [showOtp, setShowOtp] = useState(false);

    const isEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    const isPhone = (val: string) => /^\+?[1-9]\d{9,14}$/.test(val.replace(/[\s\-\(\)]/g, ''));

    // Initialize reCAPTCHA once and keep it stable
    useEffect(() => {
        if (typeof window !== "undefined" && !window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
                    size: "invisible",
                    callback: () => {
                        console.log("reCAPTCHA verified successfully");
                    }
                });
            } catch (err) {
                console.error("reCAPTCHA initialization failed:", err);
            }
        }

        return () => {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        };
    }, []);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (showOtp) return handleVerifyOtp();

        setLoading(true);
        try {
            if (isEmail(identifier)) {
                await signInWithEmailAndPassword(auth, identifier, password);
                router.push("/dashboard");
            } else if (isPhone(identifier)) {
                if (!window.recaptchaVerifier) {
                    setError("Security check (reCAPTCHA) failed to load. Please refresh.");
                    setLoading(false);
                    return;
                }

                const cleanPhone = identifier.replace(/[\s\-\(\)]/g, '');
                const formattedPhone = cleanPhone.startsWith("+") ? cleanPhone : `+91${cleanPhone}`;

                const result = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
                setConfirmationResult(result);
                setShowOtp(true);
            } else {
                setError("Please enter a valid email or phone number.");
            }
        } catch (err: any) {
            console.error("Login Error:", err);
            if (err.message?.includes("reCAPTCHA") || err.code?.includes("captcha")) {
                setError("Blocked by security check. Please ensure 'localhost' is whitelisted in Firebase and reCAPTCHA Enterprise is enabled in Cloud Console.");
            } else if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found") {
                setError("Invalid login details.");
            } else {
                setError(err.message || "Authentication failed. Try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyOtp() {
        if (!confirmationResult) return;
        setLoading(true);
        try {
            await confirmationResult.confirm(otp);
            router.push("/dashboard");
        } catch (err) {
            setError("Invalid OTP code. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleLogin() {
        setGoogleLoading(true);
        setError("");
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const token = await result.user.getIdToken();
            await api.post(
                "/auth/register",
                { name: result.user.displayName || result.user.email?.split("@")[0] || "User" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            router.push("/dashboard");
        } catch (err: any) {
            if (err.code !== "auth/popup-closed-by-user") {
                setError("Google sign-in failed.");
            }
        } finally {
            setGoogleLoading(false);
        }
    }

    return (
        <div className="animate-fade-in">
            <div id="recaptcha-container"></div>

            <div style={{ marginBottom: "28px" }}>
                <h1 className="display-text" style={{ fontSize: "26px", marginBottom: "6px" }}>
                    {showOtp ? "Verify Phone" : "Welcome back"}
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                    {showOtp ? `Enter the code sent to ${identifier}` : "Sign in with Email or Phone"}
                </p>
            </div>

            {!showOtp && (
                <>
                    <button
                        onClick={handleGoogleLogin}
                        disabled={googleLoading || loading}
                        className="glass-card"
                        style={{
                            width: "100%",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                            padding: "12px 20px",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid var(--border-strong)",
                            borderRadius: "12px",
                            color: "var(--text-primary)",
                            fontSize: "14px", fontWeight: 500,
                            cursor: "pointer",
                            marginBottom: "20px",
                        }}
                    >
                        {googleLoading ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}>
                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                        ) : <GoogleIcon />}
                        {googleLoading ? "Connecting..." : "Continue with Google"}
                    </button>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                        <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
                        <span style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>OR</span>
                        <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
                    </div>
                </>
            )}

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {!showOtp ? (
                    <>
                        <div>
                            <label className="label-text" style={{ display: "block", marginBottom: "8px" }}>Email or Phone Number</label>
                            <input
                                className="input-field"
                                placeholder="you@email.com or 9876543210"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                            />
                        </div>

                        {(isEmail(identifier) || (!isPhone(identifier) && identifier.length > 3)) && (
                            <div className="animate-fade-down">
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                    <label className="label-text">Password</label>
                                    <Link href="/forgot-password" style={{ fontSize: "12px", color: "var(--accent-primary)", textDecoration: "none" }}>Forgot?</Link>
                                </div>
                                <input
                                    type="password"
                                    className="input-field"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required={isEmail(identifier)}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div>
                        <label className="label-text" style={{ display: "block", marginBottom: "8px" }}>6-Digit OTP Code</label>
                        <input
                            className="input-field"
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowOtp(false)}
                            style={{ background: "none", border: "none", color: "var(--accent-primary)", fontSize: "12px", marginTop: "8px", cursor: "pointer" }}
                        >
                            Change Email/Phone
                        </button>
                    </div>
                )}

                {error && (
                    <div className="animate-fade-in" style={{ padding: "12px", borderRadius: "10px", background: "var(--red-bg)", border: "1px solid rgba(255,82,82,0.2)", color: "var(--red)", fontSize: "13px" }}>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading || googleLoading}
                    style={{ width: "100%", padding: "14px", fontSize: "14px", marginTop: "4px" }}
                >
                    {loading ? (
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}>
                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                            {showOtp ? "Verifying..." : "Processing..."}
                        </span>
                    ) : showOtp ? "Verify OTP" : isPhone(identifier) ? "Send OTP Code" : "Sign In →"}
                </button>
            </form>

            <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-subtle)", textAlign: "center", fontSize: "14px", color: "var(--text-secondary)" }}>
                Don't have an account? <Link href="/signup" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>Create one</Link>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}