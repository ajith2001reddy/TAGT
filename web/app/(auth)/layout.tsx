import Link from "next/link";
import { CheckCircle2, ShieldCheck, Users } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
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
                background: "radial-gradient(circle, rgba(205, 255, 68, 0.05) 0%, transparent 70%)",
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
                        <img src="/logo.png" alt="" style={{ width: "24px" }} />
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
                        maxWidth: "90%"
                    }}>
                        Start your <br />
                        <span style={{ color: "#CDFF44" }}>property journey</span>
                    </h2>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-tertiary)", fontSize: "14px" }}>
                        <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "1px solid #CDFF44", display: "flex", alignItems: "center", justifyContent: "center", color: "#CDFF44" }}>
                            <CheckCircle2 size={12} />
                        </div>
                        Join 10k+ active property owners & residents
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
                    {[
                        { icon: Users, title: "Invite unlimited colleagues", desc: "Integrate with guaranteed developer-friendly APIs or openly to choose a build-ready or low-code solution." },
                        { icon: ShieldCheck, title: "Ensure compliance", desc: "Receive detailed insights on all your numbers in real-time, see where visitors are coming from." },
                        { icon: ShieldCheck, title: "Built-in security", desc: "Keep your team members and customers in the loop by sharing your dashboard public." }
                    ].map((feature, i) => (
                        <div key={i} style={{ display: "flex", gap: "20px" }}>
                            <div style={{ color: "#CDFF44", marginTop: "4px" }}>
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

            <style jsx global>{`
                @media (max-width: 1024px) {
                    .features-panel { display: none !important; }
                }
            `}</style>
        </div>
    );
}