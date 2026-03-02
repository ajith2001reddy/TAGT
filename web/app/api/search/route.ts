import { NextRequest, NextResponse } from "next/server";

const CACHE = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

function buildOverpassQuery(lat: number, lon: number, radiusM = 3000) {
    return `
[out:json][timeout:10];
(
  node["tourism"~"hostel|guest_house|hotel"](around:${radiusM},${lat},${lon});
  node["amenity"~"hostel|guest_house|boarding_home"](around:${radiusM},${lat},${lon});
);
out tags center;`;
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const lat = parseFloat(searchParams.get("lat") || "");
        const lon = parseFloat(searchParams.get("lon") || "");

        if (isNaN(lat) || isNaN(lon)) {
            return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
        }

        const cacheKey = `${lat.toFixed(4)}_${lon.toFixed(4)}`; // Use 4 decimal places for better cache hits
        const now = Date.now();

        if (CACHE.has(cacheKey)) {
            const cached = CACHE.get(cacheKey)!;
            if (now - cached.timestamp < CACHE_TTL) {
                return NextResponse.json(cached.data);
            }
        }

        const query = buildOverpassQuery(lat, lon);

        // Retry logic for Overpass
        let attempts = 0;
        let lastError = null;

        while (attempts < 2) {
            try {
                const overpassRes = await fetch("https://overpass-api.de/api/interpreter", {
                    method: "POST",
                    body: `data=${encodeURIComponent(query)}`,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "User-Agent": "TAGT-App-1.0",
                    },
                    signal: AbortSignal.timeout(12000), // 12s timeout
                });

                if (overpassRes.ok) {
                    const data = await overpassRes.json();
                    CACHE.set(cacheKey, { data, timestamp: now });
                    return NextResponse.json(data);
                }

                if (overpassRes.status === 429) {
                    // Wait a bit if throttled
                    await new Promise(r => setTimeout(r, 1500));
                }

                lastError = `Overpass error ${overpassRes.status}`;
            } catch (err: any) {
                lastError = err.message;
            }
            attempts++;
        }

        return NextResponse.json({ error: lastError || "Search failed" }, { status: 500 });

    } catch (err) {
        console.error("Search API error:", err);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}