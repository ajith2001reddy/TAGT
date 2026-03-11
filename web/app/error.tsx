"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry or PostHog
    console.error("Application error:", error);
  }, [error]);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#04070c", color: "#f0f4f8", fontFamily: "'Inter', sans-serif",
      padding: "40px", textAlign: "center",
    }}>
      <div style={{
        maxWidth: "500px", padding: "48px 40px", borderRadius: "24px",
        border: "1px solid rgba(255,82,82,0.2)",
        background: "linear-gradient(145deg, rgba(255,82,82,0.05), rgba(8,14,24,0.9))",
        boxShadow: "0 20px 80px rgba(0,0,0,0.6)",
      }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>⚠️</div>
        <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "16px", color: "#fff" }}>
          Something went wrong
        </h2>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px", lineHeight: 1.6, marginBottom: "32px" }}>
          We encountered an unexpected error while rendering this page. Our engineering team has been notified.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={() => reset()}
            style={{
              padding: "12px 24px", borderRadius: "12px", fontSize: "14px", fontWeight: 600,
              background: "linear-gradient(135deg, #00d4ff, #0066cc)", border: "none", color: "#000",
              cursor: "pointer", transition: "transform 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "scale(1)"}
          >
            Try again
          </button>
          
          <Link href="/" style={{
            padding: "12px 24px", borderRadius: "12px", fontSize: "14px", fontWeight: 600,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff", textDecoration: "none", transition: "background 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"}
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
