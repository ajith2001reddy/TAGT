"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const GRID_COLS = 12;

export default function LandingPage() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [mounted, setMounted] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search?location=${location}&type=${type}`);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
      {/* Mesh background */}
      <div className="mesh-bg" />

      {/* Grid lines */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {Array.from({ length: GRID_COLS }).map((_, i) => (
          <div
            key={i}
            className="hero-grid-line"
            style={{ left: `${(i + 1) * (100 / GRID_COLS)}%`, opacity: 0.4 }}
          />
        ))}
      </div>

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 40px",
        height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid var(--border-subtle)",
        background: "rgba(3,5,7,0.7)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "8px",
            background: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <span style={{ color: "#000", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "13px" }}>T</span>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "18px", letterSpacing: "-0.02em" }}>
            TAGT
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link href="/login" className="btn-ghost" style={{ padding: "8px 18px", fontSize: "13px" }}>
            Sign In
          </Link>
          <Link href="/signup" className="btn-primary" style={{ padding: "9px 20px", fontSize: "13px" }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "80px 24px 60px",
        position: "relative", zIndex: 1,
      }}>
        {/* Eyebrow tag */}
        <div className={`animate-fade-up ${mounted ? "" : "opacity-0"}`} style={{ marginBottom: "24px" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "6px 14px", borderRadius: "100px",
            border: "1px solid rgba(0,212,255,0.2)",
            background: "rgba(0,212,255,0.06)",
            fontSize: "12px", fontFamily: "var(--font-mono)",
            color: "var(--accent-primary)", letterSpacing: "0.08em",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent-primary)", boxShadow: "0 0 8px rgba(0,212,255,0.8)", display: "inline-block" }} />
            NOW IN BETA — PROPERTY MANAGEMENT REIMAGINED
          </span>
        </div>

        {/* Main headline */}
        <h1 className={`display-text glow-text animate-fade-up delay-1 ${mounted ? "" : "opacity-0"}`} style={{
          fontSize: "clamp(44px, 8vw, 88px)",
          textAlign: "center",
          maxWidth: "900px",
          marginBottom: "24px",
          lineHeight: 1.05,
        }}>
          The Operating System<br />
          <span style={{ color: "var(--accent-primary)" }}>for Modern PGs</span>
        </h1>

        <p className={`animate-fade-up delay-2 ${mounted ? "" : "opacity-0"}`} style={{
          fontSize: "18px", color: "var(--text-secondary)", textAlign: "center",
          maxWidth: "520px", lineHeight: 1.7, marginBottom: "48px",
        }}>
          End-to-end property intelligence. From bed to balance sheet — fully automated, beautifully simple.
        </p>

        {/* Search box */}
        <form onSubmit={handleSearch} className={`animate-fade-up delay-3 ${mounted ? "" : "opacity-0"}`} style={{
          display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center",
          padding: "8px", borderRadius: "16px",
          border: "1px solid var(--border-default)",
          background: "var(--bg-card)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          marginBottom: "80px",
          width: "100%", maxWidth: "600px",
        }}>
          <input
            className="input-field"
            placeholder="City or locality..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            style={{ flex: 1, minWidth: "160px", background: "transparent", border: "none", outline: "none", boxShadow: "none", padding: "10px 14px" }}
          />
          <div style={{ width: "1px", background: "var(--border-default)", margin: "6px 0" }} />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
            style={{
              flex: "0 0 auto", background: "transparent", border: "none", outline: "none",
              color: type ? "var(--text-primary)" : "var(--text-tertiary)",
              fontFamily: "var(--font-body)", fontSize: "15px", padding: "10px 14px", cursor: "pointer",
            }}
          >
            <option value="" style={{ background: "#0d1520" }}>Property type</option>
            <option value="boys" style={{ background: "#0d1520" }}>Boys PG</option>
            <option value="girls" style={{ background: "#0d1520" }}>Girls PG</option>
            <option value="co-living" style={{ background: "#0d1520" }}>Co-Living</option>
          </select>
          <button type="submit" className="btn-primary" style={{ flexShrink: 0 }}>
            Search
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </form>

        {/* Stats row */}
        <div className={`animate-fade-up delay-4 ${mounted ? "" : "opacity-0"}`} style={{
          display: "flex", gap: "48px", flexWrap: "wrap", justifyContent: "center",
        }}>
          {[
            { value: "2,400+", label: "Active Beds" },
            { value: "98.2%", label: "Uptime SLA" },
            { value: "₹4.2Cr", label: "Rent Processed" },
            { value: "340ms", label: "Avg Response" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em" }}>
                {stat.value}
              </div>
              <div className="label-text" style={{ marginTop: "4px" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features section */}
      <section style={{
        padding: "120px 40px",
        borderTop: "1px solid var(--border-subtle)",
        position: "relative", zIndex: 1,
        maxWidth: "1200px", margin: "0 auto",
      }}>
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <div className="label-text" style={{ marginBottom: "16px" }}>PLATFORM CAPABILITIES</div>
          <h2 className="display-text" style={{ fontSize: "clamp(32px, 5vw, 52px)", maxWidth: "600px", margin: "0 auto" }}>
            Why operators choose TAGT
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
          {[
            {
              icon: "⚡", title: "Automated Rent Engine",
              desc: "Monthly billing, late fee escalation, and reminders run on autopilot. Zero manual intervention.",
              accent: "var(--accent-primary)"
            },
            {
              icon: "📊", title: "Live Analytics",
              desc: "Occupancy rates, collection ratios, and churn prediction in a single unified dashboard.",
              accent: "#7c3aed"
            },
            {
              icon: "🔐", title: "Role-Based Access",
              desc: "Super admin, owner, and resident roles with scoped data access. Enterprise-grade security.",
              accent: "#059669"
            },
            {
              icon: "🔔", title: "Smart Notifications",
              desc: "Automated payment reminders via email. Configurable thresholds. No resident excuses.",
              accent: "#d97706"
            },
            {
              icon: "🏠", title: "Multi-Property Support",
              desc: "Manage a portfolio of properties from a single account. Instant property switching.",
              accent: "#dc2626"
            },
            {
              icon: "📱", title: "Resident Portal",
              desc: "Self-service dashboard for payments, maintenance requests, and status tracking.",
              accent: "#0891b2"
            },
          ].map((f, i) => (
            <div key={f.title} className="glass-card" style={{ padding: "28px", animationDelay: `${i * 0.07}s` }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: `${f.accent}15`,
                border: `1px solid ${f.accent}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px", marginBottom: "18px",
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: 600, marginBottom: "10px", letterSpacing: "-0.01em" }}>
                {f.title}
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.7 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: "100px 40px",
        borderTop: "1px solid var(--border-subtle)",
        textAlign: "center",
        position: "relative", zIndex: 1,
      }}>
        <div style={{
          maxWidth: "560px", margin: "0 auto",
          padding: "56px 40px",
          border: "1px solid var(--border-default)",
          borderRadius: "24px",
          background: "var(--bg-card)",
          boxShadow: "0 0 80px rgba(0,212,255,0.05)",
        }}>
          <h2 className="display-text" style={{ fontSize: "38px", marginBottom: "16px" }}>
            Ready to scale?
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "32px", lineHeight: 1.7 }}>
            Join hundreds of PG operators managing smarter with TAGT.
          </p>
          <Link href="/signup" className="btn-primary" style={{ padding: "14px 32px", fontSize: "15px" }}>
            Start Free — No Card Needed
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "32px 40px",
        borderTop: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        color: "var(--text-tertiary)", fontSize: "13px",
        position: "relative", zIndex: 1,
        flexWrap: "wrap", gap: "16px",
      }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text-secondary)" }}>TAGT</span>
        <span>© {new Date().getFullYear()} TAGT. Property Management Platform.</span>
        <div style={{ display: "flex", gap: "24px" }}>
          <Link href="/login" style={{ color: "var(--text-tertiary)", textDecoration: "none" }}>Login</Link>
          <Link href="/signup" style={{ color: "var(--text-tertiary)", textDecoration: "none" }}>Sign Up</Link>
        </div>
      </footer>
    </div>
  );
}