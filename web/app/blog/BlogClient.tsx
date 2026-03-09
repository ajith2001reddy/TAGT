"use client";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import Link from "next/link";

export default function BlogClient() {
    const posts = [
        {
            id: 1,
            title: "How to Reduce Resident Churn by 15%",
            excerpt: "Learn how data-driven communication can keep your beds occupied longer.",
            date: "March 10, 2026",
            tag: "Operations",
            image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 2,
            title: "The Future of Co-Living in India",
            excerpt: "Why purpose-built student housing is the next big investment opportunity.",
            date: "March 05, 2026",
            tag: "Real Estate",
            image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 3,
            title: "Automating Late Fees: A Guide",
            excerpt: "Stop being the 'bad guy' and let software handle your rent reconciliation.",
            date: "Feb 28, 2026",
            tag: "Automation",
            image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80"
        }
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#04070c", color: "#f0f4f8", fontFamily: "'Inter', sans-serif" }}>
            <PublicNavbar />

            <main style={{ padding: "160px 24px 100px", position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: "80px" }}>
                    <h1 style={{
                        fontSize: "clamp(40px, 8vw, 72px)", fontWeight: 900, letterSpacing: "-0.04em",
                        background: "linear-gradient(135deg, #fff 40%, #a0b4cc)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        marginBottom: "24px"
                    }}>
                        The Operator's Journal.
                    </h1>
                    <p style={{ fontSize: "20px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                        Insights, strategies, and industry news for property owners.
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "32px" }}>
                    {posts.map(post => (
                        <div key={post.id} style={{
                            borderRadius: "24px", border: "1px solid rgba(255,255,255,0.06)",
                            background: "rgba(255,255,255,0.02)", overflow: "hidden",
                            transition: "transform 0.3s ease"
                        }}>
                            <div style={{ height: "200px", background: `url(${post.image}) center/cover` }} />
                            <div style={{ padding: "32px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                    <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: "#00d4ff", textTransform: "uppercase" }}>{post.tag}</span>
                                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>{post.date}</span>
                                </div>
                                <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginBottom: "12px", lineHeight: 1.4 }}>{post.title}</h3>
                                <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: "24px" }}>{post.excerpt}</p>
                                <div style={{ color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Read Article →</div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
