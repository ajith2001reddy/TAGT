"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import Script from "next/script";
import { motion } from "framer-motion";
import { User, Mail, Lock, Chrome, Eye, EyeOff } from "lucide-react";

import { useAuthContext } from "../layout";

export default function SignupClient() {
    const router = useRouter();
    const { activeRole: role, setActiveRole: setRole } = useAuthContext();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const fullName = `${firstName} ${lastName}`.trim();
            await createUserWithEmailAndPassword(auth, email, password);
            await api.post("/v2/auth/register", { 
                name: fullName, 
                username, 
                email, 
                password, 
                role 
            });
            router.push("/dashboard");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Something went wrong.";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleSignup() {
        setGoogleLoading(true);
        setError("");
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await api.post("/v2/auth/register", {
                name: result.user.displayName || result.user.email?.split("@")[0] || "User",
                email: result.user.email,
                role
            });
            router.push("/dashboard");
        } catch (err: unknown) {
            const errorObj = err as { code?: string };
            if (errorObj.code !== "auth/popup-closed-by-user") {
                setError("Google sign-up failed.");
            }
        } finally {
            setGoogleLoading(false);
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.2 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } } as const
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ position: "relative" }}>
            <Script src="https://www.google.com/recaptcha/enterprise.js?render=6LcYdYIsAAAAALs9O0fknr8dlztXd6NDHYiE0mYd" strategy="beforeInteractive" />
            
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "16px", fontWeight: 600 }}>Register with:</p>
                <motion.button
                    whileHover={{ scale: 1.02, background: "rgba(255,255,255,0.08)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoogleSignup}
                    disabled={loading || googleLoading}
                    style={{
                        width: "100%",
                        height: "48px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
                        color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500,
                        cursor: "pointer", transition: "all 0.2s ease"
                    }}
                >
                    {googleLoading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                            <Chrome size={16} />
                        </motion.div>
                    ) : <Chrome size={16} />}
                    {googleLoading ? "Connecting..." : "Continue with Google"}
                </motion.button>
            </div>

            <motion.div variants={itemVariants} style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px" }}>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.05)" }} />
                <span style={{ fontSize: "11px", color: "var(--text-tertiary)", fontWeight: 600 }}>Or</span>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.05)" }} />
            </motion.div>

            <form onSubmit={handleSignup}>
                <motion.div variants={containerVariants} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Role Switcher - Subtle */}
            <motion.div variants={itemVariants} style={{ display: "flex", background: "rgba(255,255,255,0.03)", padding: "4px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "32px" }}>
                {["resident", "owner"].map((r) => (
                    <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r as "resident" | "owner")}
                        style={{
                            flex: 1, padding: "10px", borderRadius: "10px", border: "none",
                            background: role === r ? "rgba(255,255,255,0.07)" : "transparent",
                            color: role === r ? "#fff" : "var(--text-tertiary)",
                            fontSize: "12px", fontWeight: 700, cursor: "pointer",
                            textTransform: "uppercase", letterSpacing: "0.05em", transition: "all 0.2s ease"
                        }}
                    >
                        {r}
                    </button>
                ))}
            </motion.div>

            <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "16px", fontWeight: 600 }}>
                    {role === "owner" ? "Owners must register with Google for identity verification:" : "Register with:"}
                </p>
                <motion.button
                    whileHover={{ scale: 1.02, background: role === "owner" ? "var(--accent-primary)" : "rgba(255,255,255,0.08)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoogleSignup}
                    disabled={loading || googleLoading}
                    style={{
                        width: "100%",
                        height: "54px",
                        background: role === "owner" ? "var(--accent-primary)" : "rgba(255,255,255,0.04)",
                        border: role === "owner" ? "none" : "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "14px",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
                        color: role === "owner" ? "#000" : "var(--text-secondary)", 
                        fontSize: "15px", fontWeight: 700,
                        cursor: "pointer", transition: "all 0.2s ease",
                        boxShadow: role === "owner" ? "0 0 20px var(--accent-glow)" : "none"
                    }}
                >
                    {googleLoading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                            <Chrome size={20} />
                        </motion.div>
                    ) : <Chrome size={20} />}
                    {googleLoading ? "Connecting..." : "Continue with Google"}
                </motion.button>
            </div>

            {role === "resident" && (
                <>
                    <motion.div variants={itemVariants} style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px" }}>
                        <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.05)" }} />
                        <span style={{ fontSize: "11px", color: "var(--text-tertiary)", fontWeight: 600 }}>OR</span>
                        <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.05)" }} />
                    </motion.div>

                    <form onSubmit={handleSignup}>
                        <motion.div variants={containerVariants} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            {/* Split Row for First/Last Name */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <motion.div variants={itemVariants}>
                                    <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: 500 }}>First Name</label>
                                    <div style={{ position: "relative" }}>
                                        <User size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="John"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                            style={{ paddingLeft: "42px", height: "48px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                                        />
                                    </div>
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: 500 }}>Last Name</label>
                                    <div style={{ position: "relative" }}>
                                        <User size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="Doe"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            required
                                            style={{ paddingLeft: "42px", height: "48px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                                        />
                                    </div>
                                </motion.div>
                            </div>

                            <motion.div variants={itemVariants}>
                                <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: 500 }}>Email</label>
                                <div style={{ position: "relative" }}>
                                    <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                                    <input
                                        type="email"
                                        className="input-field"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        style={{ paddingLeft: "42px", height: "48px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: 500 }}>Password</label>
                                <div style={{ position: "relative" }}>
                                    <Lock size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="input-field"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        style={{ paddingLeft: "42px", paddingRight: "42px", height: "48px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer" }}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </motion.div>

                            {error && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: "#ff5252", fontSize: "13px", textAlign: "center" }}>
                                    {error}
                                </motion.div>
                            )}

                            <motion.button
                                variants={itemVariants}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="submit"
                                disabled={loading || googleLoading}
                                style={{
                                    width: "100%", height: "54px", background: "var(--accent-primary)", borderRadius: "14px",
                                    border: "none", color: "#000", fontSize: "16px", fontWeight: 700,
                                    cursor: "pointer", transition: "all 0.2s ease"
                                }}
                            >
                                {loading ? "Creating Account..." : "Sign Up →"}
                            </motion.button>
                        </motion.div>
                    </form>
                </>
            )}

            {role === "owner" && (
                <motion.div variants={itemVariants} style={{ marginTop: "20px", padding: "20px", borderRadius: "16px", background: "rgba(0,212,255,0.03)", border: "1px solid rgba(0,212,255,0.1)" }}>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, textAlign: "center" }}>
                        To maintain high trust and verified property lists, all new owners must authenticate with a verified Google Workspace or Gmail account.
                    </p>
                </motion.div>
            )}

                    <motion.p variants={itemVariants} style={{ fontSize: "12px", color: "var(--text-tertiary)", textAlign: "center", lineHeight: 1.6 }}>
                        By creating an account, you agree to the <Link href="/terms" style={{ color: "#fff", textDecoration: "underline" }}>Terms of Service</Link>. We&apos;ll occasionally send you account-related emails.
                    </motion.p>
                </motion.div>
            </form>

            <motion.div variants={itemVariants} style={{
                marginTop: "32px", textAlign: "center", fontSize: "14px", color: "var(--text-secondary)"
            }}>
                Already have an account? <Link href="/login" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 700 }}>Login</Link>
            </motion.div>
        </motion.div>
    );
}
