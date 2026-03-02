"use client";

import { useProperty } from "@/context/PropertyContext";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function PropertySwitcher() {
    const { property, setCurrentProperty } = useProperty();
    const [properties, setProperties] = useState<any[]>([]);

    useEffect(() => {
        api.get("/owner/properties")
            .then(({ data }) => setProperties(data.data || []))
            .catch(() => { });
    }, []);

    return (
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <svg
                width="13" height="13"
                viewBox="0 0 24 24" fill="none"
                stroke="var(--text-tertiary)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ position: "absolute", left: "10px", pointerEvents: "none" }}
            >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <select
                value={property?._id || ""}
                onChange={(e) => setCurrentProperty(e.target.value)}
                style={{
                    paddingLeft: "28px",
                    paddingRight: "28px",
                    paddingTop: "6px",
                    paddingBottom: "6px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "8px",
                    color: "var(--text-secondary)",
                    fontSize: "12px",
                    fontFamily: "var(--font-body)",
                    cursor: "pointer",
                    outline: "none",
                    appearance: "none",
                    WebkitAppearance: "none",
                    minWidth: "140px",
                }}
            >
                <option value="" style={{ background: "#0d1520" }}>All Properties</option>
                {properties.map((p) => (
                    <option key={p._id} value={p._id} style={{ background: "#0d1520" }}>{p.name}</option>
                ))}
            </select>
            <svg
                width="11" height="11"
                viewBox="0 0 24 24" fill="none"
                stroke="var(--text-tertiary)" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ position: "absolute", right: "8px", pointerEvents: "none" }}
            >
                <polyline points="6 9 12 15 18 9" />
            </svg>
        </div>
    );
}