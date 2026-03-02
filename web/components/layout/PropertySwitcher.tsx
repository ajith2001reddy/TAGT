"use client";

import { useProperty } from "@/context/PropertyContext";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export function PropertySwitcher() {
    const { selectedProperty, setSelectedProperty } = useProperty();
    const [properties, setProperties] = useState<any[]>([]);

    useEffect(() => {
        async function load() {
            const { data } = await api.get("/owner/properties");
            setProperties(data.data);
        }
        load();
    }, []);

    return (
        <select
            value={selectedProperty || ""}
            onChange={(e) =>
                setSelectedProperty(e.target.value || null)
            }
            className="bg-neutral-800 text-white px-3 py-1 rounded"
        >
            <option value="">All Properties</option>
            {properties.map((p) => (
                <option key={p._id} value={p._id}>
                    {p.name}
                </option>
            ))}
        </select>
    );
}