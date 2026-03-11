"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRazorpay } from "react-razorpay";

interface PlanLimits { properties: number; rooms: number; residents: number; reports: boolean; analytics: boolean; emailReminders: boolean; }
interface Plan { id: string; name: string; price: number; priceLabel: string; limits: PlanLimits; features: string[]; highlight: boolean; }
interface MyPlan { plan: string; limits: PlanLimits; status: string; currentPeriodEnd: string | null; usage: { residents: number; rooms: number }; }

function UsageBar({ used, max, label }: { used: number; max: number; label: string }) {
    const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0;
    const color = pct >= 90 ? "#ff5252" : pct >= 70 ? "#fbbf24" : "#34d399";
    return (
        <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "12px" }}>
                <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color }}>{used} / {max === 9999 ? "∞" : max}</span>
            </div>
            <div style={{ height: "5px", background: "var(--border-subtle)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${max === 9999 ? Math.min(pct, 30) : pct}%`, background: color, borderRadius: "3px", transition: "width 0.8s ease" }} />
            </div>
        </div>
    );
}

const PLAN_BADGE_COLOR: Record<string, string> = { free: "var(--text-tertiary)", pro: "var(--accent-primary)", enterprise: "#a78bfa" };

export default function SubscriptionPage() {
    const [myPlan, setMyPlan] = useState<MyPlan | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState<string | null>(null);
    const [upgraded, setUpgraded] = useState(false);

    async function fetchData() {
        const [planRes, myRes] = await Promise.all([
            api.get("/v2/subscription/plans"),
            api.get("/v2/subscription/my-plan"),
        ]);
        setPlans(planRes.data.data);
        setMyPlan(myRes.data.data);
        setLoading(false);
    }
    useEffect(() => { fetchData().catch(console.error); }, []);

    const { Razorpay } = useRazorpay();

    async function handleUpgrade(planId: string) {
        if (planId === myPlan?.plan || planId === "free") return; 

        if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
            alert("Razorpay Key ID missing from frontend environment.");
            return;
        }

        setUpgrading(planId);
        try {
            const res = await api.post("/v2/razorpay/checkout-subscription", { planId });
            const subscriptionId = res.data.data.subscriptionId;

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                subscription_id: subscriptionId,
                name: "TAGT SaaS",
                description: `Upgrade to ${planId.toUpperCase()} plan`,
                handler: async function (response: any) {
                    setUpgraded(true);
                    setUpgrading(null);
                    setTimeout(() => setUpgraded(false), 5000);
                    fetchData(); // Refresh plan data after successful upgrade
                },
                theme: { color: "#8b5cf6" },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on("payment.failed", function (response: any) {
                alert(response.error.description);
                setUpgrading(null);
            });
            rzp.open();
        } catch (err: unknown) {
            console.error(err);
            const error = err as { response?: { data?: { message?: string } } };
            alert(error.response?.data?.message || "Failed to initiate upgrade. Check Razorpay configuration.");
            setUpgrading(null);
        }
    }

    // Check for return from Stripe
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("success") === "1") {
            setUpgraded(true);
            setTimeout(() => setUpgraded(false), 5000);

            // Clean up the URL
            const url = new URL(window.location.href);
            url.searchParams.delete("success");
            url.searchParams.delete("session_id");
            window.history.replaceState({}, "", url.toString());
        }
    }, []);

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "32px" }}>
                <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Platform Billing</div>
                <h1 className="display-text" style={{ fontSize: "30px", marginBottom: "4px" }}>Subscription</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Manage your plan and feature access</p>
            </div>

            {upgraded && (
                <div className="animate-fade-in" style={{ background: "var(--green-bg)", border: "1px solid rgba(0,230,118,0.2)", borderRadius: "12px", padding: "14px 18px", marginBottom: "20px", color: "var(--green)", fontSize: "13px", display: "flex", gap: "10px" }}>
                    ✅ Payment Successful! Your plan has been upgraded. Please wait a moment for the new features to unlock.
                </div>
            )}

            {/* Current plan status */}
            {!loading && myPlan && (
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "18px", padding: "24px", marginBottom: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                            <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "6px" }}>Current Plan</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, textTransform: "capitalize", color: PLAN_BADGE_COLOR[myPlan.plan] }}>{myPlan.plan}</div>
                                <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", background: PLAN_BADGE_COLOR[myPlan.plan] + "15", color: PLAN_BADGE_COLOR[myPlan.plan], border: `1px solid ${PLAN_BADGE_COLOR[myPlan.plan]}30`, padding: "3px 9px", borderRadius: "6px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{myPlan.status}</span>
                            </div>
                        </div>
                        {myPlan.currentPeriodEnd && <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>Renews {new Date(myPlan.currentPeriodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>}
                    </div>
                    <UsageBar used={myPlan.usage.rooms} max={myPlan.limits.rooms} label="Rooms" />
                    <UsageBar used={myPlan.usage.residents} max={myPlan.limits.residents} label="Residents" />
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
                        {[
                            { label: "Analytics", enabled: myPlan.limits.analytics },
                            { label: "Reports", enabled: myPlan.limits.reports },
                            { label: "Email Reminders", enabled: myPlan.limits.emailReminders },
                        ].map(({ label, enabled }) => (
                            <span key={label} style={{ fontSize: "11px", fontFamily: "var(--font-mono)", padding: "4px 10px", borderRadius: "7px", background: enabled ? "var(--green-bg)" : "var(--bg-elevated)", color: enabled ? "var(--green)" : "var(--text-tertiary)", border: `1px solid ${enabled ? "rgba(0,230,118,0.2)" : "var(--border-subtle)"}` }}>
                                {enabled ? "✓" : "✗"} {label}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Plan cards */}
            {loading
                ? <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: "380px", borderRadius: "18px" }} />)}</div>
                : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
                        {plans.map((plan, i) => {
                            const isCurrent = myPlan?.plan === plan.id;
                            const isHighlight = plan.highlight;
                            const accentColor = plan.id === "enterprise" ? "#a78bfa" : plan.id === "pro" ? "var(--accent-primary)" : "var(--text-tertiary)";
                            return (
                                <div key={plan.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
                                    <div style={{
                                        background: isHighlight ? "linear-gradient(135deg, rgba(0,212,255,0.06), var(--bg-card))" : "var(--bg-card)",
                                        border: `1px solid ${isCurrent ? accentColor + "80" : isHighlight ? "rgba(0,212,255,0.2)" : "var(--border-default)"}`,
                                        borderRadius: "20px", padding: "28px", position: "relative", overflow: "hidden",
                                        transition: "all 0.25s ease",
                                    }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 48px rgba(0,0,0,0.4)`; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
                                    >
                                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${accentColor}80, transparent)` }} />
                                        {isHighlight && <div style={{ position: "absolute", top: "14px", right: "14px", fontSize: "10px", fontFamily: "var(--font-mono)", background: "var(--accent-primary)", color: "#000", fontWeight: 700, padding: "3px 9px", borderRadius: "5px", letterSpacing: "0.08em" }}>POPULAR</div>}

                                        <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, marginBottom: "4px", color: accentColor }}>{plan.name}</div>
                                        <div style={{ fontFamily: "var(--font-display)", fontSize: "30px", fontWeight: 700, letterSpacing: "-0.04em", marginBottom: "20px" }}>{plan.priceLabel}</div>

                                        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: "8px" }}>
                                            {plan.features.map(f => (
                                                <li key={f} style={{ fontSize: "13px", color: "var(--text-secondary)", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.5" style={{ marginTop: "2px", flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            onClick={() => handleUpgrade(plan.id)}
                                            disabled={isCurrent || upgrading === plan.id}
                                            style={{
                                                width: "100%", padding: "12px", borderRadius: "10px", border: "none", cursor: isCurrent ? "default" : "pointer",
                                                background: isCurrent ? "var(--bg-elevated)" : isHighlight ? "var(--accent-primary)" : `${accentColor}18`,
                                                color: isCurrent ? "var(--text-tertiary)" : isHighlight ? "#000" : accentColor,
                                                fontWeight: 700, fontSize: "13px",
                                                fontFamily: "var(--font-display)", transition: "all 0.15s",
                                            }}
                                        >
                                            {upgrading === plan.id ? "Upgrading…" : isCurrent ? "Current Plan ✓" : plan.id === "free" ? "Downgrade" : `Upgrade to ${plan.name}`}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            }

            <div style={{ marginTop: "28px", padding: "16px 20px", background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.1)", borderRadius: "12px", fontSize: "13px", color: "var(--text-secondary)" }}>
                💳 Secure checkout powered by Stripe. Subscriptions can be cancelled at any time from this dashboard.
            </div>
        </div>
    );
}
