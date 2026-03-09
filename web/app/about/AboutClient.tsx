"use client";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function AboutClient() {
    return (
        <div style={{ minHeight: "100vh", background: "#04070c", color: "#f0f4f8", fontFamily: "'Inter', sans-serif" }}>
            <PublicNavbar />

            <main style={{ padding: "160px 24px 100px", position: "relative", zIndex: 1, maxWidth: "1000px", margin: "0 auto" }}>
                {/* Background glow */}
                <div style={{
                    position: "fixed", top: "20vh", left: "50%", transform: "translateX(-50%)",
                    width: "60vw", height: "60vw", borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)",
                    filter: "blur(60px)", pointerEvents: "none", zIndex: -1
                }} />

                <div style={{ textAlign: "center", marginBottom: "80px" }}>
                    <h1 style={{
                        fontSize: "clamp(40px, 8vw, 72px)", fontWeight: 900, letterSpacing: "-0.04em",
                        background: "linear-gradient(135deg, #fff 40%, #a0b4cc)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        marginBottom: "24px"
                    }}>
                        The Story Behind TAGT.
                    </h1>
                    <p style={{ fontSize: "20px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: "700px", margin: "0 auto" }}>
                        We're building the operating system for modern co-living and student housing.
                    </p>
                </div>

                <div style={{ display: "grid", gap: "48px" }}>
                    <section>
                        <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "20px", color: "#00d4ff" }}>Our Mission</h2>
                        <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.7)", lineHeight: 1.8 }}>
                            Property management has been stuck in the past—hidden in spreadsheets, paper invoices, and manual WhatsApp reminders.
                            TAGT (Transparent Automated Growth Technology) was born to bring Silicon Valley-grade software to PG and hostel owners.
                            We believe that when technology handles the boring stuff (billing, onboarding, tracking), owners can focus on what matters:
                            providing great living spaces for their residents.
                        </p>
                    </section>

                    <section style={{
                        padding: "40px", borderRadius: "24px",
                        border: "1px solid rgba(255,255,255,0.06)",
                        background: "rgba(255,255,255,0.02)",
                        backdropFilter: "blur(20px)"
                    }}>
                        <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "20px", color: "#fff" }}>Why TAGT?</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "32px" }}>
                            {[
                                { title: "Transparency", desc: "No hidden fees, no missing records. Everything verified." },
                                { title: "Automation", desc: "Rent, bills, and late fees generated while you sleep." },
                                { title: "Growth", desc: "AI-driven insights to maximize your property's ROI." }
                            ].map(item => (
                                <div key={item.title}>
                                    <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", marginBottom: "10px" }}>{item.title}</h3>
                                    <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
