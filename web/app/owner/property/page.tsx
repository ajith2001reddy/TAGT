"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Home, MapPin, Building2, Shield, Users, Bed } from "lucide-react";

interface Property {
    _id: string;
    name: string;
    type: string;
    address: string;
    city: string;
    totalRooms: number;
    totalBeds: number;
    occupiedBeds: number;
}

export default function PropertyDetailsPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const res = await api.get("/owner/properties");
            setProperties(res.data.data);
        } catch (err) {
            console.error("Failed to fetch properties", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: "40px" }}>
                <div className="skeleton" style={{ height: "40px", width: "200px", marginBottom: "30px" }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                    <div className="skeleton" style={{ height: "300px", borderRadius: "24px" }} />
                    <div className="skeleton" style={{ height: "300px", borderRadius: "24px" }} />
                </div>
            </div>
        );
    }

    if (properties.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "100px 40px" }}>
                <div style={{ fontSize: "64px", marginBottom: "20px" }}>🏘️</div>
                <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>No Property Assigned</h2>
                <p style={{ color: "var(--text-tertiary)", maxWidth: "400px", margin: "0 auto" }}>
                    You haven't been assigned to any properties yet. Please contact the platform administrator.
                </p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ marginBottom: "36px" }}>
                <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Portfolio</div>
                <h1 className="display-text" style={{ fontSize: "32px", marginBottom: "6px" }}>Property Details</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>View and manage your assigned property information</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                {properties.map((property) => (
                    <div key={property._id} className="glass-card" style={{ padding: "32px", borderRadius: "24px", border: "1px solid var(--border-default)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "40px" }}>
                            {/* Left Side: Basic Info */}
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                                    <div style={{ width: "48px", height: "48px", background: "var(--accent-primary)15", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
                                        <Building2 size={24} />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>{property.name}</h2>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-tertiary)", fontSize: "13px", marginTop: "2px" }}>
                                            <span style={{ textTransform: "uppercase", fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em", color: "var(--accent-primary)", background: "var(--accent-primary)10", padding: "2px 8px", borderRadius: "4px" }}>
                                                {property.type}
                                            </span>
                                            <span>•</span>
                                            <MapPin size={14} />
                                            <span>{property.address}, {property.city}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "32px" }}>
                                    <div style={{ padding: "20px", background: "var(--bg-subtle)", borderRadius: "16px", border: "1px solid var(--border-subtle)" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-tertiary)", fontSize: "12px", marginBottom: "8px" }}>
                                            <Shield size={16} />
                                            <span style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Compliance Status</span>
                                        </div>
                                        <div style={{ fontSize: "18px", fontWeight: 600, color: "#34d399" }}>Verified & Active</div>
                                    </div>
                                    <div style={{ padding: "20px", background: "var(--bg-subtle)", borderRadius: "16px", border: "1px solid var(--border-subtle)" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-tertiary)", fontSize: "12px", marginBottom: "8px" }}>
                                            <Home size={16} />
                                            <span style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Units Configured</span>
                                        </div>
                                        <div style={{ fontSize: "18px", fontWeight: 600 }}>{property.totalRooms} Rooms</div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Quick Stats */}
                            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "20px", padding: "24px", border: "1px solid var(--border-subtle)" }}>
                                <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-tertiary)" }}>Occupancy Overview</h3>

                                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-secondary)" }}>
                                            <Bed size={18} />
                                            <span>Total Capacity</span>
                                        </div>
                                        <span style={{ fontSize: "18px", fontWeight: 700 }}>{property.totalBeds} Beds</span>
                                    </div>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-secondary)" }}>
                                            <Users size={18} />
                                            <span>Current Residents</span>
                                        </div>
                                        <span style={{ fontSize: "18px", fontWeight: 700 }}>{property.occupiedBeds}</span>
                                    </div>

                                    <div style={{ marginTop: "10px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "8px" }}>
                                            <span style={{ color: "var(--text-tertiary)" }}>Utilization Rate</span>
                                            <span style={{ fontWeight: 700, color: "#34d399" }}>{property.totalBeds > 0 ? Math.round((property.occupiedBeds / property.totalBeds) * 100) : 0}%</span>
                                        </div>
                                        <div style={{ height: "6px", background: "var(--border-subtle)", borderRadius: "3px", overflow: "hidden" }}>
                                            <div style={{
                                                height: "100%",
                                                width: `${property.totalBeds > 0 ? (property.occupiedBeds / property.totalBeds) * 100 : 0}%`,
                                                background: "linear-gradient(90deg, var(--accent-primary), #34d399)",
                                                borderRadius: "3px"
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
