"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical Global Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{
        margin: 0, padding: 0, minHeight: "100vh",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "#04070c", color: "#f0f4f8", fontFamily: "system-ui, sans-serif",
      }}>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "16px", color: "#ff5252" }}>
            Critical System Error
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px", marginBottom: "32px" }}>
            The application experienced a fatal error and cannot recover normally.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: "12px 24px", borderRadius: "12px", fontSize: "14px", fontWeight: 600,
              background: "#ff5252", border: "none", color: "#fff", cursor: "pointer",
            }}
          >
            Hard Reload
          </button>
        </div>
      </body>
    </html>
  );
}
