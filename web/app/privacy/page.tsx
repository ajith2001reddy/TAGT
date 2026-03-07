"use client";

import Link from "next/link";

export default function PrivacyPage() {
    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-main)", color: "var(--text-primary)", padding: "40px 20px" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <Link href="/" style={{ color: "var(--accent-primary)", textDecoration: "none", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "32px" }}>
                    ← Back to Home
                </Link>

                <h1 className="display-text" style={{ fontSize: "32px", marginBottom: "16px" }}>Privacy Policy</h1>
                <p style={{ color: "var(--text-secondary)", marginBottom: "40px" }}>Last updated: March 07, 2026</p>

                <div className="glass-card" style={{ padding: "40px", minHeight: "600px" }}>
                    {/* 
                        TIPS FOR THE USER:
                        If you have a Termly embed code, paste it here.
                        It usually looks like: <div data-id="..." data-type="iframe" class="termly-embed"></div>
                    */}
                    <div
                        data-id="YOUR_TERMLY_DOCUMENT_ID"
                        data-type="iframe"
                        style={{ width: "100%", height: "100%", border: "none" }}
                    >
                        <p style={{ textAlign: "center", color: "var(--text-tertiary)", paddingTop: "100px" }}>
                            Privacy Policy content will be loaded here from Termly.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
