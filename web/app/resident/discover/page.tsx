"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import Image from "next/image";

interface Property {
    _id: string;
    name: string;
    address: string;
    city: string;
    phone: string;
    heroImage?: string;
}

export default function DiscoverPropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [requestingId, setRequestingId] = useState<string | null>(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async (searchTerm = "") => {
        setLoading(true);
        try {
            const res = await api.get(`/v2/properties/discover?search=${searchTerm}`);
            setProperties(res.data.data);
        } catch (err) {
            console.error("Discovery error", err);
            toast.error("Failed to load properties");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProperties(search);
    };

    const handleJoinRequest = async (propertyId: string) => {
        if (!message) {
            toast.error("Please add a short note for the manager");
            return;
        }

        setRequestingId(propertyId);
        try {
            await api.post("/v2/join-requests", { propertyId, message });
            toast.success("Join request sent successfully!");
            setMessage("");
            setRequestingId(null);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to send request");
            setRequestingId(null);
        }
    };

    return (
        <div style={{ padding: "40px 24px", maxWidth: "1200px", margin: "0 auto", animation: "fadeIn 0.8s ease-out" }}>
            <div style={{ marginBottom: "48px", textAlign: "center" }}>
                <h1 style={{ fontSize: "42px", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "12px", background: "linear-gradient(to right, var(--text-primary), var(--text-tertiary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Find Your New Home
                </h1>
                <p style={{ color: "var(--text-tertiary)", fontSize: "18px", maxWidth: "600px", margin: "0 auto" }}>
                    Search and apply to premium properties curated for modern living.
                </p>
            </div>

            <form onSubmit={handleSearch} style={{ maxWidth: "600px", margin: "0 auto 60px", position: "relative" }}>
                <input
                    type="text"
                    placeholder="Search by name, city or address..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "20px 24px",
                        borderRadius: "24px",
                        background: "var(--bg-glass)",
                        border: "1px solid var(--border-default)",
                        color: "var(--text-primary)",
                        fontSize: "16px",
                        outline: "none",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "var(--accent-primary)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--border-default)"}
                />
                <button type="submit" style={{
                    position: "absolute",
                    right: "12px",
                    top: "10px",
                    padding: "10px 24px",
                    borderRadius: "16px",
                    background: "var(--accent-primary)",
                    color: "white",
                    border: "none",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "transform 0.2s"
                }} onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")} onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}>
                    Search
                </button>
            </form>

            {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "32px" }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="skeleton" style={{ height: "400px", borderRadius: "32px" }} />
                    ))}
                </div>
            ) : properties.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 0" }}>
                    <div style={{ fontSize: "64px", marginBottom: "24px" }}>🔍</div>
                    <h3 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>No properties found</h3>
                    <p style={{ color: "var(--text-tertiary)" }}>Try searching for a different city or name.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "32px" }}>
                    {properties.map(property => (
                        <div key={property._id} style={{
                            background: "var(--bg-glass)",
                            border: "1px solid var(--border-default)",
                            borderRadius: "32px",
                            overflow: "hidden",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            display: "flex",
                            flexDirection: "column",
                            position: "relative"
                        }} className="property-card"
                            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-8px)")}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}>
                            <div style={{ height: "240px", position: "relative" }}>
                                <img
                                    src={property.heroImage || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80"}
                                    alt={property.name}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                                <div style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", color: "white", padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                                    {property.city}
                                </div>
                            </div>
                            <div style={{ padding: "28px", flexGrow: 1, display: "flex", flexDirection: "column" }}>
                                <h3 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>{property.name}</h3>
                                <p style={{ color: "var(--text-tertiary)", fontSize: "14px", marginBottom: "24px", flexGrow: 1 }}>{property.address}</p>

                                {requestingId === property._id ? (
                                    <div style={{ animation: "fadeIn 0.3s" }}>
                                        <textarea
                                            placeholder="Introduce yourself to the manager..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            style={{
                                                width: "100%",
                                                padding: "14px",
                                                borderRadius: "16px",
                                                background: "rgba(0,0,0,0.05)",
                                                border: "1px solid var(--border-default)",
                                                color: "var(--text-primary)",
                                                fontSize: "13px",
                                                resize: "none",
                                                marginBottom: "12px",
                                                outline: "none"
                                            }}
                                            rows={3}
                                            autoFocus
                                        />
                                        <div style={{ display: "flex", gap: "10px" }}>
                                            <button
                                                onClick={() => handleJoinRequest(property._id)}
                                                style={{ flex: 2, padding: "12px", borderRadius: "14px", background: "var(--accent-primary)", color: "white", border: "none", fontWeight: 600, cursor: "pointer" }}>
                                                Send Request
                                            </button>
                                            <button
                                                onClick={() => setRequestingId(null)}
                                                style={{ flex: 1, padding: "12px", borderRadius: "14px", background: "rgba(0,0,0,0.05)", color: "var(--text-primary)", border: "none", fontWeight: 600, cursor: "pointer" }}>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setRequestingId(property._id)}
                                        style={{
                                            width: "100%",
                                            padding: "16px",
                                            borderRadius: "18px",
                                            background: "var(--bg-elevated)",
                                            color: "var(--text-primary)",
                                            border: "1px solid var(--border-default)",
                                            fontWeight: 700,
                                            fontSize: "14px",
                                            cursor: "pointer",
                                            transition: "all 0.3s"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "var(--accent-primary)";
                                            e.currentTarget.style.color = "white";
                                            e.currentTarget.style.borderColor = "var(--accent-primary)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "var(--bg-elevated)";
                                            e.currentTarget.style.color = "var(--text-primary)";
                                            e.currentTarget.style.borderColor = "var(--border-default)";
                                        }}
                                    >
                                        Request to Join
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
