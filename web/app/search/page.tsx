"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Search, MapPin, MessageCircle, ExternalLink, AlertCircle, ArrowLeft, Sliders, X } from "lucide-react";

interface PGResult {
    id: number;
    name: string;
    type: string;
    lat: number;
    lon: number;
    address?: string;
    phone?: string;
    website?: string;
    opening_hours?: string;
    distanceKm?: number;
}

interface NominatimResult { lat: string; lon: string; display_name: string; }
interface Place { display_name: string; lat: string; lon: string; }

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parseOverpassResults(data: any, centerLat: number, centerLon: number): PGResult[] {
    const elements = data?.elements || [];
    const seen = new Set<string>();
    const results: PGResult[] = [];
    for (const el of elements) {
        const tags = el.tags || {};
        const name = tags.name || tags["name:en"];
        if (!name) continue;
        const lat = el.lat ?? el.center?.lat;
        const lon = el.lon ?? el.center?.lon;
        if (!lat || !lon) continue;
        const key = `${name}_${lat}_${lon}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const parts = [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]].filter(Boolean);
        results.push({
            id: el.id, name, type: tags.amenity || tags.tourism || "pg",
            lat, lon, address: parts.length ? parts.join(", ") : undefined,
            phone: tags.phone || tags["contact:phone"],
            website: tags.website || tags["contact:website"],
            opening_hours: tags.opening_hours,
            distanceKm: haversine(centerLat, centerLon, lat, lon),
        });
    }
    return results.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
}

function SkeletonCard() {
    return (
        <div style={{
            borderRadius: "20px", border: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)", padding: "28px",
            animation: "pulse 1.8s ease-in-out infinite",
        }}>
            <div style={{ width: "60px", height: "20px", borderRadius: "6px", background: "rgba(255,255,255,0.07)", marginBottom: "20px" }} />
            <div style={{ width: "70%", height: "24px", borderRadius: "8px", background: "rgba(255,255,255,0.07)", marginBottom: "12px" }} />
            <div style={{ width: "90%", height: "14px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", marginBottom: "8px" }} />
            <div style={{ width: "60%", height: "14px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", marginBottom: "28px" }} />
            <div style={{ height: "44px", borderRadius: "12px", background: "rgba(255,255,255,0.06)" }} />
        </div>
    );
}

function SearchContent() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useSearchParams();

    const location = params.get("location") || "";
    const latParam = params.get("lat");
    const lngParam = params.get("lng");

    const [results, setResults] = useState<PGResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sendingId, setSendingId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState(location);
    const [lastLoc, setLastLoc] = useState("");
    const [enquiredIds, setEnquiredIds] = useState<Set<number>>(new Set());
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const onScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    async function handleEnquiry(pg: PGResult) {
        if (!user) {
            router.push("/login?callback=/search" + window.location.search);
            return;
        }
        try {
            setSendingId(pg.id);
            await api.post("/enquiries", { propertyId: pg.id, pgName: pg.name, message: "I am interested in this PG." });
            setEnquiredIds(prev => new Set([...prev, pg.id]));
        } catch {
            alert("Failed to send enquiry");
        } finally { setSendingId(null); }
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        router.push(`/search?location=${encodeURIComponent(searchQuery)}`);
    };

    const runSearch = useCallback(async () => {
        if (!location || location === lastLoc) return;
        setLoading(true); setError("");
        try {
            let lat = latParam ? parseFloat(latParam) : null;
            let lon = lngParam ? parseFloat(lngParam) : null;
            if (!lat || !lon) {
                const geoRes = await fetch(`/api/geocode?q=${encodeURIComponent(location)}`);
                const geoData: NominatimResult[] = await geoRes.json();
                if (!geoData.length) { setError(`We couldn't find "${location}" on the map.`); setLoading(false); return; }
                lat = parseFloat(geoData[0].lat); lon = parseFloat(geoData[0].lon);
            }
            await new Promise(r => setTimeout(r, 600));
            const res = await fetch(`/api/search?lat=${lat}&lon=${lon}`);
            if (!res.ok) {
                if (res.status === 429) throw new Error("Our search partner is busy. Please wait a moment.");
                throw new Error("Temporary search failure. Please try again.");
            }
            const data = await res.json();
            setResults(parseOverpassResults(data, lat, lon));
            setLastLoc(location);
        } catch (err: any) {
            setError(err.message || "Search failed.");
        } finally { setLoading(false); }
    }, [location, latParam, lngParam, lastLoc]);

    useEffect(() => {
        if (location) runSearch();
        else setLoading(false);
    }, [location, runSearch]);

    const TYPE_COLORS: Record<string, string> = {
        hostel: "#a78bfa",
        hotel: "#f59e0b",
        guest_house: "#34d399",
        pg: "#00d4ff",
    };

    function getTypeColor(type: string) {
        return TYPE_COLORS[type.toLowerCase()] ?? "#00d4ff";
    }

    return (
        <div style={{ minHeight: "100vh", background: "#04070c", color: "#f0f4f8", fontFamily: "'Inter', sans-serif" }}>

            {/* Ambient orbs */}
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
                <div style={{
                    position: "absolute", top: "-10vh", left: "30%",
                    width: "50vw", height: "40vw", borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(0,180,255,0.07) 0%, transparent 70%)",
                    filter: "blur(60px)",
                }} />
                <div style={{
                    position: "absolute", bottom: "0", right: "-10%",
                    width: "40vw", height: "40vw", borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
                    filter: "blur(60px)",
                }} />
                <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
                    backgroundSize: "80px 80px",
                }} />
            </div>

            {/* Sticky Search Bar */}
            <div style={{
                position: "sticky", top: 0, zIndex: 50,
                background: scrollY > 10 ? "rgba(4,7,12,0.92)" : "rgba(4,7,12,0.7)",
                backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                padding: "14px 40px",
                transition: "background 0.3s",
            }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", gap: "12px", alignItems: "center" }}>
                    <button
                        onClick={() => router.back()}
                        style={{
                            width: "40px", height: "40px", borderRadius: "12px", flexShrink: 0,
                            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", color: "rgba(255,255,255,0.5)", transition: "all 0.2s",
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <form onSubmit={handleSearchSubmit} style={{ flex: 1, position: "relative", display: "flex" }}>
                        <div style={{
                            flex: 1, display: "flex", alignItems: "center",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.09)",
                            borderRadius: "14px", overflow: "hidden",
                            transition: "border-color 0.2s",
                        }}
                            onFocus={() => { }}
                        >
                            <Search size={16} style={{ marginLeft: "16px", color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search for PGs, hostels, or locations..."
                                style={{
                                    flex: 1, background: "transparent", border: "none", outline: "none",
                                    color: "#fff", fontFamily: "inherit", fontSize: "14px",
                                    padding: "12px 16px", caretColor: "#00d4ff",
                                }}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    style={{ background: "transparent", border: "none", cursor: "pointer", padding: "0 12px", color: "rgba(255,255,255,0.3)", display: "flex" }}
                                >
                                    <X size={14} />
                                </button>
                            )}
                            <button type="submit" style={{
                                padding: "10px 20px", margin: "4px",
                                borderRadius: "10px",
                                background: "linear-gradient(135deg, #00d4ff, #0066cc)",
                                color: "#000", border: "none", cursor: "pointer",
                                fontSize: "13px", fontWeight: 700, fontFamily: "inherit",
                                flexShrink: 0,
                            }}>Search</button>
                        </div>
                    </form>

                    <Link href="/" style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        fontSize: "14px", fontWeight: 800, letterSpacing: "-0.02em",
                        color: "rgba(255,255,255,0.7)", textDecoration: "none",
                        flexShrink: 0,
                    }}>
                        <div style={{
                            width: "26px", height: "26px", borderRadius: "8px",
                            background: "linear-gradient(135deg, #00d4ff, #0066cc)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <span style={{ color: "#000", fontWeight: 900, fontSize: "12px" }}>T</span>
                        </div>
                        TAGT
                    </Link>
                </div>
            </div>

            {/* Main content */}
            <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 40px 80px", position: "relative", zIndex: 1 }}>

                {/* Page title */}
                <div style={{ marginBottom: "48px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", color: "#00d4ff", textTransform: "uppercase", marginBottom: "12px" }}>
                        Search Results
                    </div>
                    <h1 style={{
                        fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900,
                        letterSpacing: "-0.04em", lineHeight: 1.1,
                        background: "linear-gradient(135deg, #ffffff 50%, #6090b0)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>
                        {location ? <>Stay options near <span style={{ background: "linear-gradient(135deg, #00d4ff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{location}</span></> : "Search for PGs & Hostels"}
                    </h1>
                    {!loading && results.length > 0 && (
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginTop: "8px" }}>
                            {results.length} places found · sorted by distance
                        </p>
                    )}
                </div>

                {/* States */}
                {loading ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "18px" }}>
                        {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                    </div>

                ) : error ? (
                    <div style={{
                        maxWidth: "520px", margin: "60px auto", textAlign: "center",
                        padding: "56px 40px", borderRadius: "28px",
                        border: "1px solid rgba(255,82,82,0.15)",
                        background: "rgba(255,82,82,0.04)",
                    }}>
                        <div style={{ fontSize: "48px", marginBottom: "20px" }}>⚠️</div>
                        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "12px", color: "#fff" }}>Something went wrong</h2>
                        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "14px", lineHeight: 1.75, marginBottom: "32px" }}>{error}</p>
                        <button
                            onClick={() => { setLastLoc(""); runSearch(); }}
                            style={{
                                padding: "12px 28px", borderRadius: "12px",
                                background: "linear-gradient(135deg, #00d4ff, #0066cc)",
                                color: "#000", border: "none", cursor: "pointer",
                                fontSize: "14px", fontWeight: 700, fontFamily: "inherit",
                            }}
                        >Try Again</button>
                    </div>

                ) : results.length === 0 ? (
                    <div style={{
                        maxWidth: "520px", margin: "60px auto", textAlign: "center",
                        padding: "56px 40px", borderRadius: "28px",
                        border: "1px solid rgba(255,255,255,0.07)",
                        background: "rgba(255,255,255,0.02)",
                    }}>
                        <div style={{ fontSize: "48px", marginBottom: "20px" }}>🔍</div>
                        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "12px", color: "#fff" }}>No stays found nearby</h2>
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", lineHeight: 1.75, marginBottom: "32px" }}>
                            We couldn&apos;t find any PGs or hostels in <strong style={{ color: "rgba(255,255,255,0.7)" }}>{location}</strong>. Try a broader area or a major landmark nearby.
                        </p>
                        <button
                            onClick={() => setSearchQuery("")}
                            style={{
                                padding: "12px 28px", borderRadius: "12px",
                                border: "1px solid rgba(255,255,255,0.12)",
                                background: "transparent", color: "rgba(255,255,255,0.7)",
                                cursor: "pointer", fontSize: "14px", fontWeight: 600,
                                fontFamily: "inherit", transition: "all 0.2s",
                            }}
                        >Clear Search</button>
                    </div>

                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "18px" }}>
                        {results.map((pg, idx) => {
                            const color = getTypeColor(pg.type);
                            const enquired = enquiredIds.has(pg.id);
                            return (
                                <div
                                    key={pg.id}
                                    style={{
                                        borderRadius: "20px",
                                        border: "1px solid rgba(255,255,255,0.07)",
                                        background: "rgba(255,255,255,0.03)",
                                        padding: "26px",
                                        backdropFilter: "blur(12px)",
                                        transition: "all 0.3s ease",
                                        animation: `fadeUp 0.5s ease both`,
                                        animationDelay: `${idx * 0.05}s`,
                                        position: "relative", overflow: "hidden",
                                    }}
                                    onMouseEnter={e => {
                                        const el = e.currentTarget as HTMLElement;
                                        el.style.borderColor = `${color}25`;
                                        el.style.transform = "translateY(-3px)";
                                        el.style.boxShadow = `0 16px 48px ${color}0d`;
                                    }}
                                    onMouseLeave={e => {
                                        const el = e.currentTarget as HTMLElement;
                                        el.style.borderColor = "rgba(255,255,255,0.07)";
                                        el.style.transform = "translateY(0)";
                                        el.style.boxShadow = "none";
                                    }}
                                >
                                    {/* Corner glow */}
                                    <div style={{
                                        position: "absolute", top: 0, right: 0,
                                        width: "120px", height: "120px",
                                        background: `radial-gradient(circle at top right, ${color}10, transparent 70%)`,
                                        borderRadius: "0 20px 0 0", pointerEvents: "none",
                                    }} />

                                    {/* Header row */}
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
                                        <span style={{
                                            fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
                                            textTransform: "uppercase", padding: "4px 10px", borderRadius: "6px",
                                            background: `${color}12`, color, border: `1px solid ${color}22`,
                                        }}>{pg.type}</span>
                                        {pg.distanceKm && (
                                            <span style={{
                                                fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.4)",
                                                fontFamily: "monospace", display: "flex", alignItems: "center", gap: "4px",
                                            }}>
                                                <MapPin size={10} />
                                                {pg.distanceKm.toFixed(1)} km
                                            </span>
                                        )}
                                    </div>

                                    {/* Name */}
                                    <h3 style={{
                                        fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em",
                                        marginBottom: "10px", color: "#fff", lineHeight: 1.3,
                                    }}>{pg.name}</h3>

                                    {/* Address */}
                                    {pg.address && (
                                        <div style={{
                                            display: "flex", alignItems: "flex-start", gap: "8px",
                                            color: "rgba(255,255,255,0.38)", fontSize: "13px",
                                            lineHeight: 1.5, marginBottom: "8px",
                                        }}>
                                            <MapPin size={13} style={{ flexShrink: 0, marginTop: "2px", color }} />
                                            <span>{pg.address}</span>
                                        </div>
                                    )}

                                    {pg.opening_hours && (
                                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginBottom: "4px" }}>
                                            🕐 {pg.opening_hours}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div style={{
                                        marginTop: "22px", paddingTop: "20px",
                                        borderTop: "1px solid rgba(255,255,255,0.06)",
                                        display: "flex", gap: "10px",
                                    }}>
                                        <button
                                            onClick={() => handleEnquiry(pg)}
                                            disabled={sendingId !== null || enquired}
                                            style={{
                                                flex: 1, padding: "12px", borderRadius: "12px",
                                                background: enquired
                                                    ? "rgba(52,211,153,0.1)"
                                                    : `linear-gradient(135deg, ${color}, ${color}cc)`,
                                                color: enquired ? "#34d399" : "#000",
                                                border: enquired ? "1px solid rgba(52,211,153,0.25)" : "none",
                                                cursor: enquired ? "default" : "pointer",
                                                fontSize: "13px", fontWeight: 700, fontFamily: "inherit",
                                                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                                                transition: "all 0.2s",
                                                boxShadow: enquired ? "none" : `0 4px 16px ${color}30`,
                                                opacity: sendingId !== null && sendingId !== pg.id ? 0.5 : 1,
                                            }}
                                        >
                                            {sendingId === pg.id ? (
                                                <>
                                                    <div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#000", animation: "spin 0.7s linear infinite" }} />
                                                    Sending…
                                                </>
                                            ) : enquired ? (
                                                <>✓ Sent!</>
                                            ) : (
                                                <>
                                                    <MessageCircle size={14} />
                                                    Enquire
                                                </>
                                            )}
                                        </button>

                                        <a
                                            href={`https://www.openstreetmap.org/?mlat=${pg.lat}&mlon=${pg.lon}&zoom=17`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="View on Map"
                                            style={{
                                                width: "44px", height: "44px", borderRadius: "12px",
                                                border: "1px solid rgba(255,255,255,0.09)",
                                                background: "rgba(255,255,255,0.04)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                color: "rgba(255,255,255,0.5)", textDecoration: "none",
                                                transition: "all 0.2s", flexShrink: 0,
                                            }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
                                        >
                                            <ExternalLink size={16} />
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                ::placeholder { color: rgba(255,255,255,0.25) !important; }
                * { box-sizing: border-box; }
            `}</style>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: "100vh", background: "#04070c", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="skeleton" style={{ width: 40, height: 40, borderRadius: 20 }}></div></div>}>
            <SearchContent />
        </Suspense>
    );
}
