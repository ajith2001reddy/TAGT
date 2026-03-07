"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Infinity } from "lucide-react";

const TIERS = [
    {
        name: "Starter",
        price: 29,
        desc: "For small operators just getting started.",
        features: [
            "Up to 20 Rooms",
            "Up to 50 Residents",
            "Basic Maintenance Tracker",
            "Manual Billing",
            "Email Support"
        ],
        buttonText: "Start Free Trial",
        highlight: false,
        color: "#00d4ff"
    },
    {
        name: "Growth",
        price: 99,
        desc: "Everything you need to scale operations.",
        features: [
            "Up to 100 Rooms",
            "Up to 300 Residents",
            "Automated Rent Invoicing",
            "Auto-Late Fee Calculation",
            "Email & SMS Reminders",
            "Basic Analytics"
        ],
        buttonText: "Upgrade to Growth",
        highlight: false,
        color: "#34d399"
    },
    {
        name: "Pro",
        price: 299,
        desc: "Advanced intelligence for serious portfolios.",
        features: [
            "Up to 500 Rooms",
            "Unlimited Residents",
            "AI Revenue Forecasting",
            "Churn Risk Detection",
            "Maintenance Predictions",
            "Smart Actionable Alerts",
            "Priority Support"
        ],
        buttonText: "Get Pro Complete",
        highlight: true,
        color: "#a78bfa"
    },
    {
        name: "Enterprise",
        price: "Custom",
        desc: "For institutional operators & very large portfolios.",
        features: [
            "Unlimited Properties",
            "Custom Data Engineering",
            "White-labeled App",
            "Dedicated Account Manager",
            "On-Premise Deployment Option",
            "24/7 Phone Support"
        ],
        buttonText: "Contact Sales",
        highlight: false,
        color: "#f59e0b"
    }
];

export default function SubscriptionPage() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

    return (
        <div style={{ minHeight: "100vh", background: "#04070c", color: "#f0f4f8", fontFamily: "'Inter', sans-serif" }}>
            {/* ─── Ambient orbs ─── */}
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
                <div style={{
                    position: "absolute", top: "-10vh", left: "20%",
                    width: "50vw", height: "50vw", borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 60%)",
                    filter: "blur(60px)",
                }} />
            </div>

            <nav style={{ padding: "24px 40px", position: "relative", zIndex: 10 }}>
                <Link href="/" style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "14px", fontWeight: 500,
                    transition: "color 0.2s"
                }} onMouseEnter={e => (e.currentTarget.style.color = "#fff")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}>
                    <ArrowLeft size={16} /> Back to Home
                </Link>
            </nav>

            <main style={{ padding: "80px 24px", maxWidth: "1280px", margin: "0 auto", position: "relative", zIndex: 10 }}>
                <div style={{ textAlign: "center", marginBottom: "64px" }}>
                    <h1 style={{
                        fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 900, letterSpacing: "-0.04em",
                        background: "linear-gradient(135deg, #fff 40%, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        marginBottom: "24px"
                    }}>
                        Invest in Operations.
                    </h1>
                    <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.6)", maxWidth: "600px", margin: "0 auto", lineHeight: 1.6 }}>
                        Run your entire property portfolio on autopilot. Choose the plan that fits your growth stage.
                    </p>

                    <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
                        <div style={{
                            display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: "100px",
                            padding: "4px", border: "1px solid rgba(255,255,255,0.1)"
                        }}>
                            <button
                                onClick={() => setBillingCycle("monthly")}
                                style={{
                                    padding: "8px 24px", borderRadius: "100px", fontSize: "14px", fontWeight: 600,
                                    background: billingCycle === "monthly" ? "#fff" : "transparent",
                                    color: billingCycle === "monthly" ? "#000" : "rgba(255,255,255,0.6)",
                                    border: "none", cursor: "pointer", transition: "all 0.2s"
                                }}
                            >Monthly</button>
                            <button
                                onClick={() => setBillingCycle("yearly")}
                                style={{
                                    padding: "8px 24px", borderRadius: "100px", fontSize: "14px", fontWeight: 600,
                                    background: billingCycle === "yearly" ? "#fff" : "transparent",
                                    color: billingCycle === "yearly" ? "#000" : "rgba(255,255,255,0.6)",
                                    border: "none", cursor: "pointer", transition: "all 0.2s",
                                    display: "flex", alignItems: "center", gap: "6px"
                                }}
                            >
                                Yearly <span style={{ fontSize: "10px", padding: "2px 6px", background: "rgba(52, 211, 153, 0.2)", color: "#34d399", borderRadius: "4px" }}>Save 20%</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", alignItems: "center" }}>
                    {TIERS.map((tier) => (
                        <div key={tier.name} style={{
                            padding: "40px 32px", borderRadius: "24px",
                            background: tier.highlight ? "linear-gradient(145deg, rgba(167,139,250,0.1), rgba(8,14,24,0.9))" : "rgba(255,255,255,0.02)",
                            border: tier.highlight ? `1px solid ${tier.color}50` : "1px solid rgba(255,255,255,0.08)",
                            backdropFilter: "blur(12px)",
                            transform: tier.highlight ? "scale(1.05)" : "scale(1)",
                            zIndex: tier.highlight ? 10 : 1,
                            boxShadow: tier.highlight ? `0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)` : "none",
                            display: "flex", flexDirection: "column", height: "100%"
                        }}>
                            {tier.highlight && (
                                <div style={{
                                    position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)",
                                    background: `linear-gradient(135deg, ${tier.color}, #d8b4fe)`, color: "#000",
                                    padding: "6px 16px", borderRadius: "100px", fontSize: "12px", fontWeight: 800,
                                    textTransform: "uppercase", letterSpacing: "0.1em", boxShadow: `0 4px 20px ${tier.color}40`
                                }}>
                                    Most Popular
                                </div>
                            )}

                            <h3 style={{ fontSize: "20px", fontWeight: 700, color: tier.color, marginBottom: "8px" }}>{tier.name}</h3>
                            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", marginBottom: "24px", minHeight: "40px" }}>{tier.desc}</p>

                            <div style={{ marginBottom: "32px" }}>
                                <span style={{ fontSize: "48px", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em" }}>
                                    {typeof tier.price === "number" ? `$${billingCycle === "yearly" ? Math.floor(tier.price * 0.8) : tier.price}` : tier.price}
                                </span>
                                {typeof tier.price === "number" && <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.4)" }}>/mo</span>}
                            </div>

                            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px", flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
                                {tier.features.map(f => (
                                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: 1.4 }}>
                                        <Check size={18} color={tier.color} style={{ flexShrink: 0, marginTop: "2px" }} />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <button style={{
                                width: "100%", padding: "16px", borderRadius: "14px", fontSize: "15px", fontWeight: 700,
                                background: tier.highlight ? `linear-gradient(135deg, ${tier.color}, #d8b4fe)` : "rgba(255,255,255,0.05)",
                                color: tier.highlight ? "#000" : "#fff",
                                border: tier.highlight ? "none" : "1px solid rgba(255,255,255,0.1)",
                                cursor: "pointer", transition: "all 0.2s",
                                boxShadow: tier.highlight ? `0 8px 30px ${tier.color}40` : "none"
                            }}
                                onMouseEnter={e => {
                                    if (tier.highlight) {
                                        (e.currentTarget.style.transform = "translateY(-2px)");
                                    } else {
                                        (e.currentTarget.style.background = "rgba(255,255,255,0.1)");
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (tier.highlight) {
                                        (e.currentTarget.style.transform = "translateY(0)");
                                    } else {
                                        (e.currentTarget.style.background = "rgba(255,255,255,0.05)");
                                    }
                                }}
                            >
                                {tier.buttonText}
                            </button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
