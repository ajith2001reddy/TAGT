"use client";

import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            minHeight: "100vh",
            background: "var(--bg-base)",
            fontFamily: "var(--font-body)",
            display: "flex", flexDirection: "column",
        }}>
            <div className="mesh-bg" />

            {/* Nav */}
            <div style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                padding: "0 40px", height: "64px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                borderBottom: "1px solid var(--border-subtle)",
                background: "rgba(3,5,7,0.8)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
            }}>
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
                    <div style={{
                        width: "28px", height: "28px", borderRadius: "8px",
                        background: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        <span style={{ color: "#000", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "13px" }}>T</span>
                    </div>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "17px", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                        TAGT
                    </span>
                </Link>
                <span className="label-text">PROPERTY MANAGEMENT PLATFORM</span>
            </div>

            {/* Content */}
            <div style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                padding: "80px 24px 40px", position: "relative", zIndex: 1,
            }}>
                <div style={{ width: "100%", maxWidth: "420px" }}>
                    {/* Card */}
                    <div className="animate-fade-up" style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-default)",
                        borderRadius: "20px",
                        padding: "40px",
                        boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.04)",
                        position: "relative", overflow: "hidden",
                    }}>
                        {/* Top gradient accent */}
                        <div style={{
                            position: "absolute", top: 0, left: 0, right: 0, height: "1px",
                            background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)",
                        }} />
                        {children}
                    </div>

                    {/* Bottom info */}
                    <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-tertiary)", marginTop: "24px", lineHeight: 1.7 }}>
                        Protected by Firebase Authentication.{" "}
                        <Link href="/" style={{ color: "var(--accent-primary)", textDecoration: "none" }}>
                            Learn more
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}