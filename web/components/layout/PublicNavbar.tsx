"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState, useEffect } from "react";

export function PublicNavbar() {
    const { user } = useAuth();
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const onScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const navBg = scrollY > 40 ? "rgba(4,7,12,0.92)" : "rgba(4,7,12,0.05)";

    return (
        <nav style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
            padding: "0 40px", height: "68px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: navBg,
            backdropFilter: scrollY > 40 ? "blur(28px)" : "none",
            WebkitBackdropFilter: scrollY > 40 ? "blur(28px)" : "none",
            borderBottom: scrollY > 40 ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
            transition: "all 0.4s ease",
        }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
                <img
                    src="/logo.png"
                    alt="TAGT Logo"
                    style={{ width: "32px", height: "32px", borderRadius: "8px", objectFit: "cover", boxShadow: "0 0 16px rgba(0,212,255,0.25)" }}
                />
                <span style={{ fontWeight: 800, fontSize: "20px", letterSpacing: "-0.03em", background: "linear-gradient(135deg, #ffffff, #a0b4cc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    TAGT
                </span>
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                <Link href="/about" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>About</Link>
                <Link href="/pricing" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>Pricing</Link>
                <Link href="/faq" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>FAQ</Link>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {user ? (
                    <Link href="/dashboard" style={{
                        padding: "9px 22px", borderRadius: "10px", fontSize: "13px", fontWeight: 600,
                        background: "linear-gradient(135deg, #00d4ff, #0066cc)",
                        color: "#000", textDecoration: "none",
                        boxShadow: "0 0 20px rgba(0,212,255,0.3)",
                        transition: "all 0.25s",
                    }}>Dashboard →</Link>
                ) : (
                    <>
                        <Link href="/login" style={{
                            padding: "9px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 500,
                            color: "rgba(255,255,255,0.7)", textDecoration: "none",
                        }}>Sign In</Link>
                        <Link href="/signup" style={{
                            padding: "9px 22px", borderRadius: "10px", fontSize: "13px", fontWeight: 600,
                            background: "linear-gradient(135deg, #00d4ff, #0066cc)",
                            color: "#000", textDecoration: "none",
                            boxShadow: "0 0 20px rgba(0,212,255,0.3)",
                        }}>Get Started →</Link>
                    </>
                )}
            </div>
        </nav>
    );
}
