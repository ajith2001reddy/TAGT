"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function SearchPage() {
    const params = useSearchParams();
    const location = params.get("location");
    const type = params.get("type");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!location || !type) { setLoading(false); return; }
        api.get(`/public/search?location=${location}&type=${type}`)
            .then(({ data }) => setResults(data.data || []))
            .catch(() => setResults([]))
            .finally(() => setLoading(false));
    }, [location, type]);

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
            <div className="mesh-bg" />

            {/* Nav */}
            <nav style={{
                position: "sticky", top: 0, zIndex: 100,
                padding: "0 40px", height: "64px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                borderBottom: "1px solid var(--border-subtle)",
                background: "rgba(3,5,7,0.8)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
            }}>
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#000", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "13px" }}>T</span>
                    </div>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.02em" }}>TAGT</span>
                </Link>
                <Link href="/login" className="btn-ghost" style={{ fontSize: "13px" }}>Sign In</Link>
            </nav>

            <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px", position: "relative", zIndex: 1 }}>
                {/* Header */}
                <div style={{ marginBottom: "40px" }}>
                    <div className="label-text" style={{ marginBottom: "12px" }}>SEARCH RESULTS</div>
                    <h1 className="display-text" style={{ fontSize: "36px", marginBottom: "8px" }}>
                        PGs in <span style={{ color: "var(--accent-primary)" }}>{location}</span>
                    </h1>
                    {!loading && (
                        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                            {results.length} propert{results.length !== 1 ? "ies" : "y"} found for "{type}"
                        </p>
                    )}
                </div>

                {/* Loading */}
                {loading && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="skeleton" style={{ height: "180px", borderRadius: "16px" }} />
                        ))}
                    </div>
                )}

                {/* Results */}
                {!loading && results.length === 0 && (
                    <div style={{ textAlign: "center", padding: "80px", color: "var(--text-tertiary)", border: "1px dashed var(--border-subtle)", borderRadius: "16px" }}>
                        <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔍</div>
                        <p style={{ fontSize: "16px", color: "var(--text-secondary)", marginBottom: "8px" }}>No properties found</p>
                        <p style={{ fontSize: "13px" }}>Try a different location or property type</p>
                    </div>
                )}

                {!loading && results.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                        {results.map((pg, i) => (
                            <div
                                key={pg._id}
                                className="glass-card animate-fade-up"
                                style={{ padding: "24px", animationDelay: `${i * 0.06}s` }}
                            >
                                {/* Header */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                                    <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                                        🏠
                                    </div>
                                    <span style={{ padding: "4px 10px", borderRadius: "6px", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.15)", fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--accent-primary)", textTransform: "uppercase" }}>
                                        {pg.type || "PG"}
                                    </span>
                                </div>

                                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: 600, marginBottom: "6px", letterSpacing: "-0.01em" }}>
                                    {pg.name}
                                </h3>
                                <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "20px" }}>{pg.address}</p>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <span style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em" }}>
                                            ₹{(pg.price || 0).toLocaleString()}
                                        </span>
                                        <span style={{ fontSize: "12px", color: "var(--text-tertiary)", marginLeft: "4px" }}>/month</span>
                                    </div>
                                    <Link href="/signup" className="btn-primary" style={{ padding: "8px 16px", fontSize: "12px" }}>
                                        Enquire
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}