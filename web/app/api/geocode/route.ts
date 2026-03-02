import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type") || "search"; // "search" or "reverse"

    if (!q) return NextResponse.json([]);

    try {
        const url =
            type === "reverse"
                ? `https://nominatim.openstreetmap.org/reverse?lat=${q}&format=json`
                : `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&countrycodes=in&limit=6&addressdetails=0`;

        const res = await fetch(url, {
            headers: {
                "User-Agent": "TAGT-PropertyPlatform/1.0 (contact@tagt.app)",
                "Accept-Language": "en",
                "Accept": "application/json",
            },
            // Cache for 60 seconds to reduce Nominatim load
            next: { revalidate: 60 },
        });

        if (!res.ok) return NextResponse.json([]);

        const data = await res.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json([]);
    }
}
