"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { CreditCard, Zap, Crown, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OwnerBillingPage() {
    const { dbUser } = useAuth();
    const currentPlan = "free"; // Mockup

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "32px" }}>
                <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "8px" }}>Billing & Subscription</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Manage your platform plan and payment methods.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }}>
                {/* Plans Grid */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div className="glass-card" style={{ padding: "32px", borderRadius: "24px", border: "1px solid rgba(0,212,255,0.2)", background: "linear-gradient(135deg, rgba(0,212,255,0.05), transparent)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <div>
                                <div style={{ fontSize: "12px", color: "var(--accent-primary)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>CURRENT PLAN</div>
                                <h2 style={{ fontSize: "24px", fontWeight: 800 }}>Starter — <span style={{ color: "var(--text-tertiary)" }}>Free</span></h2>
                            </div>
                            <Link href="/pricing" className="btn-primary">Upgrade My Plan</Link>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
                            <div>
                                <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>RESERVATION LIMIT</div>
                                <div style={{ fontSize: "16px", fontWeight: 600 }}>20 / 20 Used</div>
                                <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
                                    <div style={{ width: "100%", height: "100%", background: "var(--red)" }} />
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>ROOM LIMIT</div>
                                <div style={{ fontSize: "16px", fontWeight: 600 }}>8 / 10 Used</div>
                                <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
                                    <div style={{ width: "80%", height: "100%", background: "var(--accent-primary)" }} />
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>NEXT BILLING DATE</div>
                                <div style={{ fontSize: "16px", fontWeight: 600 }}>N/A</div>
                            </div>
                        </div>
                    </div>

                    <h3 style={{ fontSize: "18px", fontWeight: 700, marginTop: "12px" }}>Available Plans</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        {[
                            { id: "pro", name: "Professional", price: "999", icon: <Zap size={20} color="#00d4ff" />, features: ["500 Residents", "Auto-Reminders", "Finance Pack"] },
                            { id: "ent", name: "Enterprise", price: "2999", icon: <Crown size={20} color="#a78bfa" />, features: ["Unlimited Flow", "Revenue Leak Engine", "Staff Management"] }
                        ].map(plan => (
                            <div key={plan.id} className="glass-card" style={{ padding: "24px", borderRadius: "20px" }}>
                                <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        {plan.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "15px", fontWeight: 700 }}>{plan.name}</div>
                                        <div style={{ fontSize: "20px", fontWeight: 800 }}>₹{plan.price}<span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>/mo</span></div>
                                    </div>
                                </div>
                                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {plan.features.map(f => (
                                        <li key={f} style={{ fontSize: "13px", color: "var(--text-secondary)", display: "flex", gap: "10px" }}>
                                            <CheckCircle2 size={14} color="var(--green)" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <button className="btn-ghost" style={{ width: "100%" }}>Select Plan <ArrowRight size={14} /></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Billing History */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div className="glass-card" style={{ padding: "24px", borderRadius: "24px" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "20px" }}>Billing Methods</h3>
                        <div style={{
                            padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.03)",
                            border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: "12px"
                        }}>
                            <CreditCard size={20} color="var(--text-secondary)" />
                            <div>
                                <div style={{ fontSize: "13px", color: "var(--text-primary)" }}>No card on file</div>
                                <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Add a payment method to upgrade.</div>
                            </div>
                        </div>
                        <button className="btn-ghost" style={{ width: "100%", marginTop: "16px", fontSize: "12px" }}>Add Method</button>
                    </div>

                    <div className="glass-card" style={{ padding: "24px", borderRadius: "24px" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "20px" }}>Recent Invoices</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ fontSize: "13px", color: "var(--text-tertiary)", textAlign: "center", padding: "20px 0" }}>
                                No invoices found.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
