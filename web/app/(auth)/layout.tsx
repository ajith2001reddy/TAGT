"use client";

import Link from "next/link";
import Image from "next/image";
import { createContext, useContext, useState, useEffect } from "react";
import { CheckCircle2, Home, Sparkles, Zap, TrendingUp, BarChart3 } from "lucide-react";

// Context for sharing role state between Layout and Client
const AuthContext = createContext<{
    activeRole: "resident" | "owner";
    setActiveRole: (role: "resident" | "owner") => void;
}>({
    activeRole: "resident",
    setActiveRole: () => {},
});

export const useAuthContext = () => useContext(AuthContext);

interface PlatformStats {
    totalResidents: number;
    activeProperties: number;
    rentProcessedFormatted: string;
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const [activeRole, setActiveRole] = useState<"resident" | "owner">("resident");
    const [stats, setStats] = useState<PlatformStats | null>(null);

    useEffect(() => {
        fetch("/api/v2/public/platform-stats")
            .then(r => r.json())
            .then(d => { if (d.success) setStats(d.data); })
            .catch(() => {});
    }, []);

    const features = {
        resident: [
            { icon: Home, title: "Seamless Living", desc: "Pay rent, book amenities, and manage your documents in one sleek interface." },
            { icon: Sparkles, title: "Community Perks", desc: "Get access to exclusive building events, dry cleaning, and valet services." },
            { icon: Zap, title: "Instant Maintenance", desc: "Report issues with one tap and track repairs in real-time with photo updates." }
        ],
        owner: [
            { icon: TrendingUp, title: "Maximize Yield", desc: "Advanced revenue management tools to ensure you get the best market rates." },
            { icon: BarChart3, title: "Deep Analytics", desc: "Crunch numbers with real-time occupancy, churn, and financial health reports." },
            { icon: Zap, title: "Automated Ops", desc: "Automate leasing, screening, and billing to reduce your overhead by up to 40%." }
        ]
    };

    const activeFeatures = features[activeRole];

    return (
        <AuthContext.Provider value={{ activeRole, setActiveRole }}>
            <div style={{
                minHeight: "100vh",
                background: "#030507",
                fontFamily: "var(--font-body)",
                display: "flex", 
                position: "relative",
                overflow: "hidden"
            }}>
                {/* Elegant Grid Background */}
                <div style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `
                        linear-gradient(rgba(0, 212, 255, 0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 212, 255, 0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: "60px 60px",
                    maskImage: "radial-gradient(ellipse at center, black, transparent 80%)",
                    pointerEvents: "none",
                    opacity: 0.4
                }} />

                {/* Subtle Gradient Glow */}
                <div style={{
                    position: "absolute",
                    top: "-10%",
                    left: "-10%",
                    width: "40%",
                    height: "40%",
                    background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
                    pointerEvents: "none"
                }} />

                {/* Left Side: Brand & Features (Hidden on mobile) */}
                <div className="features-panel" style={{
                    flex: 1.2,
                    display: "flex",
                    flexDirection: "column",
                    padding: "60px 80px",
                    position: "relative",
                    zIndex: 2,
                    borderRight: "1px solid rgba(255, 255, 255, 0.05)",
                    background: "rgba(3, 5, 7, 0.4)",
                    backdropFilter: "blur(40px)"
                }}>
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", marginBottom: "auto" }}>
                        <div style={{ 
                            width: "36px", height: "36px", 
                            background: "var(--accent-primary)", 
                            borderRadius: "10px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 0 20px rgba(0, 212, 255, 0.3)"
                        }}>
                            <Image src="/logo.png" alt="TAGT Logo" width={24} height={24} />
                        </div>
                        <span style={{ 
                            fontFamily: "var(--font-display)", 
                            fontWeight: 800, 
                            fontSize: "22px", 
                            color: "#fff", 
                            letterSpacing: "-0.03em" 
                        }}>TAGT</span>
                    </Link>

                    <div style={{ marginBottom: "60px" }}>
                        <h2 style={{ 
                            fontSize: "48px", 
                            fontWeight: 800, 
                            color: "#fff", 
                            lineHeight: 1.1, 
                            marginBottom: "24px",
                            letterSpacing: "-0.04em",
                            maxWidth: "90%",
                            transition: "all 0.3s ease"
                        }}>
                            Start your <br />
                            <span style={{ color: "var(--accent-primary)" }}>
                                {activeRole === "resident" ? "perfect stay" : "property journey"}
                            </span>
                        </h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-tertiary)", fontSize: "14px" }}>
                            <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "1px solid var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
                                <CheckCircle2 size={12} />
                            </div>
                            {activeRole === "resident"
                                ? stats ? `Trusted by ${stats.totalResidents.toLocaleString()}+ residents` : "Trusted by residents nationwide"
                                : stats ? `${stats.activeProperties.toLocaleString()}+ active properties managed` : "Join active property owners"}
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
                        {activeFeatures.map((feature, i) => (
                            <div key={`${activeRole}-${i}`} style={{ display: "flex", gap: "20px", animation: "fadeUp 0.5s ease forwards" }}>
                                <div style={{ color: "var(--accent-primary)", marginTop: "4px" }}>
                                    <feature.icon size={24} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>{feature.title}</h3>
                                    <p style={{ fontSize: "14px", color: "var(--text-tertiary)", lineHeight: 1.6, maxWidth: "380px" }}>{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: "auto", display: "flex", gap: "24px", fontSize: "12px", color: "var(--text-tertiary)" }}>
                        <span>Terms</span>
                        <span>Privacy</span>
                        <span>Docs</span>
                        <span>Helps</span>
                        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
                            🌐 English ▾
                        </span>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "60px 40px",
                    zIndex: 2,
                    overflowY: "auto"
                }}>
                    <div style={{ width: "100%", maxWidth: "520px" }}>
                        {children}
                    </div>
                </div>

                <style>{`
                    @keyframes fadeUp {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @media (max-width: 1024px) {
                        .features-panel { display: none !important; }
                    }
                `}</style>
            </div>
        </AuthContext.Provider>
    );
}