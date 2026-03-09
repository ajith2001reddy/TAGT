"use client";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function FAQPage() {
    const faqs = [
        { q: "Is TAGT really free?", a: "Yes! Our Starter plan is free forever for small portfolios (up to 10 rooms). No credit card required to start." },
        { q: "How do automated payments work?", a: "We integrate with Stripe and popular local gateways to automate rent collection. Once a resident pays, the system automatically reconclies the ledger." },
        { q: "Can I manage multiple properties?", a: "Absolutely. Our platform is designed for portfolio owners. You can switch between building sites with one click." },
        { q: "What is 'Intelligence Mode'?", a: "Our proprietary AI engine that predicts which residents might leave soon (churn risk) and forecasts your revenue for the next 12 months." },
        { q: "Is my data secure?", a: "We use bank-grade encryption and multi-tenant isolation at the database level to ensure your property data is yours and yours alone." }
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#04070c", color: "#f0f4f8", fontFamily: "'Inter', sans-serif" }}>
            <PublicNavbar />

            <main style={{ padding: "160px 24px 100px", position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: "80px" }}>
                    <h1 style={{
                        fontSize: "clamp(40px, 8vw, 72px)", fontWeight: 900, letterSpacing: "-0.04em",
                        background: "linear-gradient(135deg, #fff 40%, #a0b4cc)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        marginBottom: "24px"
                    }}>
                        FAQs.
                    </h1>
                    <p style={{ fontSize: "20px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                        Everything you need to know about the platform.
                    </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {faqs.map((faq, i) => (
                        <div key={i} style={{
                            padding: "32px", borderRadius: "20px",
                            border: "1px solid rgba(255,255,255,0.06)",
                            background: "rgba(255,255,255,0.02)"
                        }}>
                            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "16px" }}>{faq.q}</h3>
                            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{faq.a}</p>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: "80px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                    Still have questions? <Link href="/contact" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 600 }}>Contact support →</Link>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}

import Link from "next/link";
