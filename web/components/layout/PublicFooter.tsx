"use client";

import Link from "next/link";

export function PublicFooter() {
    return (
        <footer style={{
            padding: "60px 40px 32px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            background: "#04070c",
            position: "relative", zIndex: 1,
        }}>
            <div style={{
                maxWidth: "1280px", margin: "0 auto",
                display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "40px", marginBottom: "60px"
            }}>
                {/* Brand */}
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                        <span style={{ fontWeight: 800, fontSize: "20px", letterSpacing: "-0.03em", color: "#fff" }}>TAGT</span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", lineHeight: 1.6 }}>
                        The new standard in property operations. Manage every bed, bill, and tenant with AI-powered ease.
                    </p>
                </div>

                {/* Product */}
                <div>
                    <h4 style={{ color: "#fff", fontSize: "15px", fontWeight: 600, marginBottom: "20px" }}>Product</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <Link href="/pricing" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: "14px" }}>Pricing</Link>
                        <Link href="/search" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: "14px" }}>Discover PGs</Link>
                        <Link href="/signup" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: "14px" }}>Join as Owner</Link>
                    </div>
                </div>

                {/* Company */}
                <div>
                    <h4 style={{ color: "#fff", fontSize: "15px", fontWeight: 600, marginBottom: "20px" }}>Company</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <Link href="/about" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: "14px" }}>About Us</Link>
                        <Link href="/blog" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: "14px" }}>Blog</Link>
                        <Link href="/contact" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: "14px" }}>Contact</Link>
                    </div>
                </div>

                {/* Legal */}
                <div>
                    <h4 style={{ color: "#fff", fontSize: "15px", fontWeight: 600, marginBottom: "20px" }}>Legal</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <Link href="/terms" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: "14px" }}>Terms of Service</Link>
                        <Link href="/privacy" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: "14px" }}>Privacy Policy</Link>
                    </div>
                </div>
            </div>

            <div style={{
                paddingTop: "32px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                color: "rgba(255,255,255,0.28)", fontSize: "13px",
                flexWrap: "wrap", gap: "16px",
            }}>
                <span>© {new Date().getFullYear()} TAGT — All rights reserved.</span>
                <div style={{ display: "flex", gap: "24px" }}>
                    <span>Made with ❤️ for Property Owners</span>
                </div>
            </div>
        </footer>
    );
}
