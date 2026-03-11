"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#04070c", color: "#f0f4f8", fontFamily: "'Inter', sans-serif",
      padding: "40px", textAlign: "center", position: "relative", overflow: "hidden"
    }}>
      {/* Background Glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "60vw", height: "60vw", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none", zIndex: 0
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "500px" }}>
        <h1 style={{
          fontSize: "120px", fontWeight: 900, lineHeight: 1, marginBottom: "8px",
          background: "linear-gradient(135deg, #a78bfa, #00d4ff)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          404
        </h1>
        <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "16px", color: "#fff" }}>
          Lost in the void
        </h2>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px", lineHeight: 1.6, marginBottom: "40px" }}>
          We could not find the page you were looking for. It might have been moved, deleted, or perhaps it never existed at all.
        </p>

        <Link href="/" style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "14px 32px", borderRadius: "14px", fontSize: "15px", fontWeight: 600,
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
          color: "#fff", textDecoration: "none", transition: "all 0.25s",
          boxShadow: "0 8px 30px rgba(0,0,0,0.3)"
        }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)";
            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Return Home
        </Link>
      </div>
    </div>
  );
}
