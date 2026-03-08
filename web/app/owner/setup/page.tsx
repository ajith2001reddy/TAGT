"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function OwnerSetupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        type: "pg",
        address: "",
        city: "",
        phone: "",
    });

    const [step, setStep] = useState(1);
    const [createdProperty, setCreatedProperty] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("/v2/properties", formData);
            setCreatedProperty(res.data.data);
            setStep(2);
            toast.success("Property created successfully!");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to create property");
        } finally {
            setLoading(false);
        }
    };

    if (step === 2 && createdProperty) {
        return (
            <div style={{ padding: "40px", maxWidth: "600px", margin: "60px auto", animation: "fadeIn 0.5s" }}>
                <div style={{ background: "var(--bg-glass)", border: "1px solid var(--border-default)", borderRadius: "32px", padding: "48px", textAlign: "center" }}>
                    <div style={{ fontSize: "64px", marginBottom: "20px" }}>🎉</div>
                    <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "12px" }}>Property Registered!</h1>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>Your property is ready. Share this code with your residents so they can join.</p>

                    <div style={{ background: "rgba(0,0,0,0.2)", padding: "24px", borderRadius: "20px", border: "1px dashed var(--accent-primary)", marginBottom: "40px" }}>
                        <div style={{ fontSize: "12px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Your Property Join Code</div>
                        <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--accent-primary)", fontFamily: "var(--font-mono)" }}>
                            {createdProperty.joinCode}
                        </div>
                    </div>

                    <button
                        onClick={() => router.push("/owner")}
                        style={{ width: "100%", padding: "16px", borderRadius: "16px", background: "var(--accent-primary)", color: "white", border: "none", fontWeight: 700, cursor: "pointer" }}
                    >
                        Go to Dashboard →
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: "40px 24px", maxWidth: "500px", margin: "40px auto", animation: "fadeIn 0.5s" }}>
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-0.02em" }}>Setup Property</h1>
                <p style={{ color: "var(--text-secondary)" }}>Let's get your first property listed on TAGT.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                    <label className="label-text" style={{ display: "block", marginBottom: "8px" }}>Property Name</label>
                    <input
                        className="input-field"
                        placeholder="e.g. Sunrise PG or Central Hostel"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                        <label className="label-text" style={{ display: "block", marginBottom: "8px" }}>Type</label>
                        <select
                            className="input-field"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="pg">PG / Co-living</option>
                            <option value="hotel">Hostel / Hotel</option>
                        </select>
                    </div>
                    <div>
                        <label className="label-text" style={{ display: "block", marginBottom: "8px" }}>City</label>
                        <input
                            className="input-field"
                            placeholder="e.g. Bangalore"
                            value={formData.city}
                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="label-text" style={{ display: "block", marginBottom: "8px" }}>Full Address</label>
                    <textarea
                        className="input-field"
                        placeholder="Street, Area, Near Landmark..."
                        style={{ height: "100px", resize: "none" }}
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label className="label-text" style={{ display: "block", marginBottom: "8px" }}>Contact Phone</label>
                    <input
                        className="input-field"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                </div>

                <button
                    disabled={loading}
                    type="submit"
                    style={{ width: "100%", padding: "16px", borderRadius: "16px", background: "var(--accent-primary)", color: "white", border: "none", fontWeight: 700, cursor: "pointer", marginTop: "12px" }}
                >
                    {loading ? "Creating..." : "Create Property & Continue"}
                </button>
            </form>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
