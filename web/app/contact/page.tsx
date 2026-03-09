"use client";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function ContactPage() {
    return (
        <div style={{ minHeight: "100vh", background: "#04070c", color: "#f0f4f8", fontFamily: "'Inter', sans-serif" }}>
            <PublicNavbar />

            <main style={{ padding: "160px 24px 100px", position: "relative", zIndex: 1, maxWidth: "1000px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: "80px" }}>
                    <h1 style={{
                        fontSize: "clamp(40px, 8vw, 72px)", fontWeight: 900, letterSpacing: "-0.04em",
                        background: "linear-gradient(135deg, #fff 40%, #a0b4cc)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        marginBottom: "24px"
                    }}>
                        Get in Touch.
                    </h1>
                    <p style={{ fontSize: "20px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                        Our team is here to help you scale your property business.
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px" }}>
                    {/* Contact Info */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                        <div>
                            <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", marginBottom: "12px" }}>General Enquiries</h3>
                            <p style={{ color: "rgba(255,255,255,0.5)" }}>support@tagt.website</p>
                        </div>
                        <div>
                            <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", marginBottom: "12px" }}>Sales & Partnerships</h3>
                            <p style={{ color: "rgba(255,255,255,0.5)" }}>sales@tagt.website</p>
                        </div>
                        <div>
                            <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", marginBottom: "12px" }}>Headquarters</h3>
                            <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                                12th Floor, Tech Hub Towers<br />
                                Indiranagar, Bangalore<br />
                                Karnataka, IN
                            </p>
                        </div>
                    </div>

                    {/* simple Form mockup */}
                    <div style={{
                        padding: "40px", borderRadius: "24px",
                        border: "1px solid rgba(255,255,255,0.06)",
                        background: "rgba(255,255,255,0.02)",
                        backdropFilter: "blur(20px)"
                    }}>
                        <form style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: "rgba(255,255,255,0.6)" }}>Full Name</label>
                                <input type="text" placeholder="John Doe" style={{
                                    width: "100%", padding: "14px", borderRadius: "10px",
                                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff"
                                }} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: "rgba(255,255,255,0.6)" }}>Work Email</label>
                                <input type="email" placeholder="john@property.com" style={{
                                    width: "100%", padding: "14px", borderRadius: "10px",
                                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff"
                                }} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: "rgba(255,255,255,0.6)" }}>Message</label>
                                <textarea rows={4} placeholder="Tell us about your portfolio..." style={{
                                    width: "100%", padding: "14px", borderRadius: "10px",
                                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff"
                                }} />
                            </div>
                            <button type="button" style={{
                                padding: "16px", borderRadius: "12px", background: "linear-gradient(135deg, #00d4ff, #0066cc)",
                                color: "#000", fontWeight: 700, border: "none", cursor: "pointer", marginTop: "10px"
                            }}>Send Message</button>
                        </form>
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
