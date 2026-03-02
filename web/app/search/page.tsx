"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Search, MapPin, Phone, ExternalLink, MessageCircle, AlertCircle, ArrowLeft } from "lucide-react";

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

interface NominatimResult {
    lat: string;
    lon: string;
    display_name: string;
}

interface Place {
    display_name: string;
    lat: string;
    lon: string;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parseOverpassResults(
    data: any,
    centerLat: number,
    centerLon: number
): PGResult[] {
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

        const parts = [
            tags["addr:housenumber"],
            tags["addr:street"],
            tags["addr:city"],
        ].filter(Boolean);

        results.push({
            id: el.id,
            name,
            type: tags.amenity || tags.tourism || "pg",
            lat,
            lon,
            address: parts.length ? parts.join(", ") : undefined,
            phone: tags.phone || tags["contact:phone"],
            website: tags.website || tags["contact:website"],
            opening_hours: tags.opening_hours,
            distanceKm: haversine(centerLat, centerLon, lat, lon),
        });
    }

    return results.sort(
        (a, b) => (a.distanceKm || 0) - (b.distanceKm || 0)
    );
}

export default function SearchPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useSearchParams();

    const location = params.get("location") || "";
    const latParam = params.get("lat");
    const lngParam = params.get("lng");

    const [results, setResults] = useState<PGResult[]>([]);
    const [loading, setLoading] = useState(false); // Default to false to avoid initial blank flash
    const [error, setError] = useState("");
    const [sendingId, setSendingId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState(location);
    const [lastLoc, setLastLoc] = useState(""); // Track last searched location

    // ✅ ENQUIRY FUNCTION (INSIDE COMPONENT)
    async function handleEnquiry(pg: PGResult) {
        if (!user) {
            router.push("/login?callback=/search" + window.location.search);
            return;
        }

        try {
            setSendingId(pg.id);

            await api.post("/enquiries", {
                pgId: pg.id,
                pgName: pg.name,
                message: "I am interested in this PG.",
            });

            alert("Enquiry sent successfully!");
        } catch (err) {
            alert("Failed to send enquiry");
        } finally {
            setSendingId(null);
        }
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        router.push(`/search?location=${encodeURIComponent(searchQuery)}`);
    };

    const runSearch = useCallback(async () => {
        if (!location || location === lastLoc) return;

        setLoading(true);
        setError("");

        try {
            let lat = latParam ? parseFloat(latParam) : null;
            let lon = lngParam ? parseFloat(lngParam) : null;

            if (!lat || !lon) {
                const geoRes = await fetch(
                    `/api/geocode?q=${encodeURIComponent(location)}`
                );
                const geoData: NominatimResult[] = await geoRes.json();

                if (!geoData.length) {
                    setError(`We couldn't find "${location}" on the map. Try a different city or area.`);
                    setLoading(false);
                    return;
                }

                lat = parseFloat(geoData[0].lat);
                lon = parseFloat(geoData[0].lon);
            }

            // Artificial delay to prevent hitting API too fast after geocode
            await new Promise(r => setTimeout(r, 600));

            const res = await fetch(
                `/api/search?lat=${lat}&lon=${lon}`
            );

            if (!res.ok) {
                if (res.status === 429) throw new Error("Our search partner is busy. Please wait a second.");
                throw new Error("Temporary search failure. Please try again.");
            }

            const data = await res.json();
            const parsed = parseOverpassResults(data, lat, lon);

            setResults(parsed);
            setLastLoc(location);
        } catch (err: any) {
            setError(err.message || "Search failed.");
        } finally {
            setLoading(false);
        }
    }, [location, latParam, lngParam, lastLoc]);

    useEffect(() => {
        if (location) runSearch();
        else setLoading(false);
    }, [location, runSearch]);

    return (
        <div className="min-h-screen pb-20">
            <div className="mesh-bg" />

            {/* Header / Search Bar Section */}
            <div className="sticky top-0 z-50 bg-base/80 backdrop-blur-md border-b border-white/5 py-4 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors hidden md:block"
                    >
                        <ArrowLeft size={20} className="text-secondary" />
                    </button>

                    <form onSubmit={handleSearchSubmit} className="relative flex-1 group w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary group-focus-within:text-accent-primary transition-colors" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for PGs, hostels, or locations..."
                            className="input-field pl-12 h-12 w-full"
                        />
                    </form>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 mt-12 relative z-10">
                <div className="mb-12">
                    <span className="label-text mb-2 block">Search Results</span>
                    <h1 className="display-text text-4xl glow-text">
                        Stay options near <span className="accent-line">{location}</span>
                    </h1>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="glass-card p-6 h-64 skeleton opacity-50" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="glass-card p-12 text-center max-w-2xl mx-auto">
                        <div className="bg-red-bg p-4 rounded-full w-fit mx-auto mb-6 text-red">
                            <AlertCircle size={32} />
                        </div>
                        <h2 className="display-text text-2xl mb-4">Something went wrong</h2>
                        <p className="text-secondary mb-8">{error}</p>
                        <button onClick={() => runSearch()} className="btn-primary">
                            Try Again
                        </button>
                    </div>
                ) : results.length === 0 ? (
                    <div className="glass-card p-12 text-center max-w-2xl mx-auto animate-fade-up">
                        <div className="bg-white/5 p-4 rounded-full w-fit mx-auto mb-6 text-accent-primary">
                            <MapPin size={32} />
                        </div>
                        <h2 className="display-text text-2xl mb-4">No stays found nearby</h2>
                        <p className="text-secondary mb-8 leading-relaxed">
                            We couldn&apos;t find any PGs or hostels exactly in {location}.
                            Try searching for a broader area or a major landmark nearby.
                        </p>
                        <button onClick={() => setSearchQuery("")} className="btn-ghost">
                            Clear Search
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                        {results.map((pg, idx) => (
                            <div
                                key={pg.id}
                                className={`glass-card p-6 animate-fade-up delay-${(idx % 6) + 1}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="badge badge-pending">{pg.type}</span>
                                    {pg.distanceKm && (
                                        <span className="mono-text text-accent-primary">
                                            {pg.distanceKm.toFixed(1)} km away
                                        </span>
                                    )}
                                </div>

                                <h3 className="display-text text-xl mb-3">{pg.name}</h3>

                                {pg.address && (
                                    <div className="flex items-start gap-3 text-secondary text-sm mb-4">
                                        <MapPin size={16} className="shrink-0 mt-0.5" />
                                        <p>{pg.address}</p>
                                    </div>
                                )}

                                <div className="mt-8 pt-6 border-t border-white/5 flex gap-3">
                                    <button
                                        onClick={() => handleEnquiry(pg)}
                                        disabled={sendingId !== null}
                                        className="btn-primary flex-1 h-11 relative overflow-hidden"
                                    >
                                        {sendingId === pg.id ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Sending...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <MessageCircle size={18} />
                                                Enquire
                                            </span>
                                        )}
                                    </button>

                                    <a
                                        href={`https://www.openstreetmap.org/?mlat=${pg.lat}&mlon=${pg.lon}&zoom=17`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-ghost p-0 w-11 h-11 flex items-center justify-center"
                                        title="View on Map"
                                    >
                                        <ExternalLink size={18} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
