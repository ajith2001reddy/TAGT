"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function SearchPage() {
    const params = useSearchParams();
    const location = params.get("location");
    const type = params.get("type");

    const [results, setResults] = useState<any[]>([]);

    useEffect(() => {
        async function fetchResults() {
            const { data } = await api.get(
                `/public/search?location=${location}&type=${type}`
            );
            setResults(data.data || []);
        }

        if (location && type) fetchResults();
    }, [location, type]);

    return (
        <div className="min-h-screen bg-black text-white p-10">
            <h1 className="text-3xl font-bold mb-8">
                PGs in {location}
            </h1>

            <div className="grid md:grid-cols-3 gap-6">
                {results.map((pg) => (
                    <div
                        key={pg._id}
                        className="bg-neutral-900 p-6 rounded-xl border border-white/10"
                    >
                        <h3 className="font-bold text-lg">{pg.name}</h3>
                        <p className="text-white/60">{pg.address}</p>
                        <p className="mt-2 font-semibold">₹{pg.price}/month</p>
                    </div>
                ))}
            </div>
        </div>
    );
}