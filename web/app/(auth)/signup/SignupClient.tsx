"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, Lock, ArrowRight, Building2, UserCircle, Chrome } from "lucide-react";

export default function SignupClient() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState("");
    const [role, setRole] = useState<"owner" | "resident">("resident");

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            await api.post("/v2/auth/register", { name, email, phoneNumber: phone, password, role });
            router.push("/dashboard");
        } catch (err: any) {
            if (err.code === "auth/email-already-in-use") {
                setError("Email is already registered. Please login instead.");
            } else {
                setError(err.message || "Something went wrong.");
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
            await api.post("/v2/auth/register", {
                name: result.user.displayName || result.user.email?.split("@")[0] || "User",
                email: result.user.email,
                role
            });
            router.push("/dashboard");
        } catch (err: any) {
            if (err.code !== "auth/popup-closed-by-user") {
                setError("Google sign-up failed. Please try again.");
            }
        } finally {
            setGoogleLoading(false);
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } as const }
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Script src="https://www.google.com/recaptcha/enterprise.js?render=6LcYdYIsAAAAALs9O0fknr8dlztXd6NDHYiE0mYd" strategy="beforeInteractive" />
            
            <motion.div variants={itemVariants} style={{ marginBottom: "32px" }}>
                <h1 className="display-text" style={{ 
                    fontSize: "32px", 
                    marginBottom: "8px",
                    background: "linear-gradient(to right, #fff, rgba(255,255,255,0.7))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>
                    Create Account
                </h1>
                <p style={{ color: "var(--text-tertiary)", fontSize: "14px", lineHeight: 1.5 }}>
                    Join TAGT today. Select your account type to continue.
                </p>
            </motion.div>

            {/* Premium Role Selection */}
            <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
                {[
                    { id: "resident", label: "Resident", icon: UserCircle, desc: "Living in PG" },
                    { id: "owner", label: "Owner", icon: Building2, desc: "Property Manager" }
                ].map((r) => {
                    const active = role === r.id;
                    const Icon = r.icon;
                    return (
                        <motion.div
                            key={r.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setRole(r.id as any)}
                            style={{
                                padding: "20px",
                                borderRadius: "24px",
                                border: `1px solid ${active ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                                background: active ? "rgba(0, 212, 255, 0.05)" : "var(--bg-glass)",
                                cursor: "pointer",
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                position: "relative",
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                textAlign: "center",
                                gap: "8px"
                            }}
                        >
                            {active && (
                                <motion.div 
                                    layoutId="role-glow"
                                    style={{ 
                                        position: "absolute", inset: 0, 
                                        background: "radial-gradient(40px circle at 50% 50%, rgba(0,212,255,0.15), transparent)",
                                        pointerEvents: "none" 
                                    }} 
                                />
                            )}
                            <div style={{ 
                                width: "48px", height: "48px", borderRadius: "14px",
                                background: active ? "var(--accent-primary)" : "rgba(255,255,255,0.03)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: active ? "#000" : "var(--text-tertiary)",
                                transition: "all 0.3s ease",
                                marginBottom: "4px"
                            }}>
                                <Icon size={24} />
                            </div>
                            <div style={{ fontSize: "14px", fontWeight: 700, color: active ? "#fff" : "var(--text-secondary)" }}>{r.label}</div>
                            <div style={{ fontSize: "10px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{r.desc}</div>
                        </motion.div>
                    );
                })}
            </motion.div>

            <motion.div variants={itemVariants}>
                <button
                    onClick={handleGoogleSignup}
                    disabled={googleLoading || loading}
                    className="btn-google"
                    style={{
                        width: "100%", height: "48px", borderRadius: "14px",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border-subtle)",
                        color: "#fff", fontSize: "14px", fontWeight: 600,
                        cursor: "pointer", transition: "all 0.2s ease",
                        marginBottom: "24px"
                    }}
                >
                    {googleLoading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                            <Chrome size={18} />
                        </motion.div>
                    ) : <Chrome size={18} />}
                    Continue with Google
                </button>
            </motion.div>

            <motion.div variants={itemVariants} style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
                <span style={{ fontSize: "10px", color: "var(--text-tertiary)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Or register manually</span>
                <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
            </motion.div>

            <form onSubmit={handleSignup}>
                <motion.div variants={containerVariants} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {[
                        { label: "Full Name", icon: User, type: "text", value: name, setter: setName, placeholder: "Alex Johnson" },
                        { label: "Email Address", icon: Mail, type: "email", value: email, setter: setEmail, placeholder: "you@example.com" },
                        { label: "Phone Number", icon: Phone, type: "tel", value: phone, setter: setPhone, placeholder: "+91 XXXXX XXXXX" },
                        { label: "Password", icon: Lock, type: "password", value: password, setter: setPassword, placeholder: "••••••••" },
                    ].map((field, i) => (
                        <motion.div variants={itemVariants} key={i}>
                            <label style={{ display: "block", fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "8px", fontWeight: 600 }}>{field.label}</label>
                            <div style={{ position: "relative" }}>
                                <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", pointerEvents: "none" }}>
                                    <field.icon size={16} />
                                </div>
                                <input
                                    type={field.type}
                                    className="input-field"
                                    placeholder={field.placeholder}
                                    value={field.value}
                                    onChange={(e) => field.setter(e.target.value)}
                                    required={field.label !== "Phone Number"}
                                    style={{ paddingLeft: "48px", borderRadius: "14px", height: "48px" }}
                                />
                            </div>
                        </motion.div>
                    ))}

                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{
                            padding: "12px 16px", borderRadius: "12px",
                            background: "rgba(255, 82, 82, 0.1)", border: "1px solid rgba(255, 82, 82, 0.2)",
                            color: "var(--red)", fontSize: "13px", display: "flex", alignItems: "center", gap: "10px"
                        }}>
                            <span>⚠️</span> {error}
                        </motion.div>
                    )}

                    <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.01, boxShadow: "0 10px 30px rgba(0, 212, 255, 0.25)" }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={loading || googleLoading}
                        className="btn-primary"
                        style={{ width: "100%", height: "52px", borderRadius: "16px", marginTop: "8px", fontSize: "15px", gap: "12px" }}
                    >
                        {loading ? "Initializing..." : <>Create Account <ArrowRight size={18} /></>}
                    </motion.button>

                    <motion.p variants={itemVariants} style={{ fontSize: "12px", color: "var(--text-tertiary)", textAlign: "center", marginTop: "8px", lineHeight: "1.6" }}>
                        By joining, you agree to our <Link href="/terms" style={{ color: "var(--accent-primary)", textDecoration: "none" }}>Terms</Link> and <Link href="/privacy" style={{ color: "var(--accent-primary)", textDecoration: "none" }}>Privacy Policy</Link>.
                    </motion.p>
                </motion.div>
            </form>

            <motion.div variants={itemVariants} style={{
                marginTop: "32px", paddingTop: "24px",
                borderTop: "1px solid var(--border-subtle)",
                textAlign: "center", fontSize: "14px", color: "var(--text-secondary)"
            }}>
                Already have an account?{" "}
                <Link href="/login" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 700 }}>
                    Sign in
                </Link>
            </motion.div>
        </motion.div>
    );
}
