"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

interface Property {
    _id: string;
    name: string;
    address: string;
    city: string;
    totalRooms: number;
    totalBeds: number;
    occupiedBeds: number;
    owner: {
        _id: string;
        name: string;
        email: string;
    };
    status: string;
    createdAt: string;
}

export default function PropertiesListPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

    useEffect(() => {
        fetchProperties(1);
    }, []);

    const fetchProperties = async (page: number) => {
        try {
            setLoading(true);
            const res = await api.get(`/v2/provider/properties?page=${page}`);
            setProperties(res.data.data);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error("Failed to fetch properties", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && properties.length === 0) {
        return (
            <div style={{ padding: "40px" }}>
                <div className="skeleton" style={{ height: "40px", width: "200px", marginBottom: "20px" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: "60px", borderRadius: "12px" }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Platform Administration</div>
                    <h1 className="display-text" style={{ fontSize: "32px", marginBottom: "6px" }}>Properties</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Manage all {pagination.total} properties across the platform</p>
                </div>
            </div>

            <div style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-default)",
                borderRadius: "18px",
                overflow: "hidden"
            }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                    <thead>
                        <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border-subtle)" }}>
                            <th style={{ textAlign: "left", padding: "16px 24px", color: "var(--text-tertiary)", fontWeight: 500 }}>Property Name</th>
                            <th style={{ textAlign: "left", padding: "16px 24px", color: "var(--text-tertiary)", fontWeight: 500 }}>Owner</th>
                            <th style={{ textAlign: "left", padding: "16px 24px", color: "var(--text-tertiary)", fontWeight: 500 }}>City</th>
                            <th style={{ textAlign: "center", padding: "16px 24px", color: "var(--text-tertiary)", fontWeight: 500 }}>Rooms/Beds</th>
                            <th style={{ textAlign: "center", padding: "16px 24px", color: "var(--text-tertiary)", fontWeight: 500 }}>Status</th>
                            <th style={{ textAlign: "right", padding: "16px 24px", color: "var(--text-tertiary)", fontWeight: 500 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {properties.map((p) => {
                            const occupancy = p.totalBeds > 0 ? Math.round((p.occupiedBeds / p.totalBeds) * 100) : 0;
                            return (
                                <tr key={p._id} style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.2s" }} className="hover-bg">
                                    <td style={{ padding: "16px 24px" }}>
                                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</div>
                                        <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>{p.address}</div>
                                    </td>
                                    <td style={{ padding: "16px 24px" }}>
                                        <div style={{ color: "var(--text-secondary)" }}>{p.owner?.name || "N/A"}</div>
                                        <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{p.owner?.email}</div>
                                    </td>
                                    <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>{p.city}</td>
                                    <td style={{ padding: "16px 24px", textAlign: "center" }}>
                                        <div style={{ color: "var(--text-primary)" }}>{p.totalRooms} R / {p.totalBeds} B</div>
                                        <div style={{ fontSize: "11px", color: occupancy > 80 ? "#34d399" : occupancy > 50 ? "#fbbf24" : "var(--text-tertiary)" }}>
                                            {occupancy}% Occupied
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px 24px", textAlign: "center" }}>
                                        <span style={{
                                            padding: "4px 10px",
                                            borderRadius: "6px",
                                            fontSize: "11px",
                                            fontWeight: 700,
                                            background: p.status === "active" ? "rgba(52, 211, 153, 0.12)" : "rgba(251, 191, 36, 0.12)",
                                            color: p.status === "active" ? "#34d399" : "#fbbf24",
                                            border: p.status === "active" ? "1px solid rgba(52, 211, 153, 0.2)" : "1px solid rgba(251, 191, 36, 0.2)",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                                        <button className="btn-ghost" style={{ fontSize: "12px", padding: "6px 12px" }}>Manage</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {properties.length === 0 && !loading && (
                    <div style={{ padding: "60px", textAlign: "center", color: "var(--text-tertiary)" }}>
                        No properties found on the platform.
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination.total > pagination.limit && (
                <div style={{ marginTop: "24px", display: "flex", justifyContent: "center", gap: "8px" }}>
                    <button
                        disabled={pagination.page === 1}
                        onClick={() => fetchProperties(pagination.page - 1)}
                        className="btn-ghost"
                        style={{ padding: "8px 16px" }}
                    >
                        Previous
                    </button>
                    <span style={{ display: "flex", alignItems: "center", padding: "0 16px", color: "var(--text-secondary)", fontSize: "14px" }}>
                        Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                    </span>
                    <button
                        disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                        onClick={() => fetchProperties(pagination.page + 1)}
                        className="btn-ghost"
                        style={{ padding: "8px 16px" }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
