"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function ResidentJoinPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [joinCode, setJoinCode] = useState("");
    const [property, setProperty] = useState<any>(null);
    const [searching, setSearching] = useState(false);
    const [message, setMessage] = useState("");

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinCode) return;
        setSearching(true);
        setProperty(null);
        try {
            const res = await api.get(`/v2/properties/discover?joinCode=${joinCode}`);
            if (res.data.data.length > 0) {
                setProperty(res.data.data[0]);
            } else {
                toast.error("Invalid join code. Please check and try again.");
            }
        } catch (err) {
            toast.error("Failed to lookup property");
        } finally {
            setSearching(false);
        }
    };

    const handleJoin = async () => {
        setLoading(true);
        try {
            await api.post("/v2/join-requests", {
                joinCode,
                message: message || "I would like to join your property."
            });
            toast.success("Join request sent! Please wait for owner approval.");
            router.push("/resident"); // Will handle pending state redirection if implemented
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to send request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "60px 24px", maxWidth: "500px", margin: "0 auto", animation: "fadeIn 0.6s ease-out" }}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔑</div>
                <h1 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-0.02em" }}>Join a Property</h1>
                <p style={{ color: "var(--text-secondary)" }}>Enter the code provided by your property manager.</p>
            </div>

            <form onSubmit={handleLookup} style={{ marginBottom: "32px" }}>
                <div style={{ position: "relative" }}>
                    <input
                        className="input-field"
                        placeholder="Enter Join Code (e.g. SUNRISE-PG-1234)"
                        value={joinCode}
                        onChange={e => setJoinCode(e.target.value.toUpperCase())}
                        style={{ paddingRight: "100px", fontSize: "16px", fontWeight: 600, letterSpacing: "0.05em" }}
                    />
                    <button
                        disabled={searching}
                        type="submit"
                        style={{
                            position: "absolute", right: "8px", top: "8px", bottom: "8px",
                            padding: "0 20px", borderRadius: "12px", background: "var(--accent-primary)",
                            color: "white", border: "none", fontWeight: 600, cursor: "pointer"
                        }}
                    >
                        {searching ? "..." : "Find"}
                    </button>
                </div>
            </form>

            {property && (
                <div style={{
                    background: "var(--bg-glass)", border: "1px solid var(--border-default)",
                    borderRadius: "28px", padding: "28px", animation: "slideUp 0.4s ease-out"
                }}>
                    <div style={{ display: "flex", gap: "20px", marginBottom: "24px" }}>
                        <div style={{
                            width: "80px", height: "80px", borderRadius: "20px",
                            background: "var(--bg-elevated)", display: "flex", alignItems: "center",
                            justifyContent: "center", fontSize: "32px", border: "1px solid var(--border-subtle)",
                            overflow: "hidden"
                        }}>
                            {property.heroImage ? <img src={property.heroImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🏢"}
                        </div>
                        <div>
                            <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>{property.name}</h3>
                            <div style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>{property.city}</div>
                            <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px" }}>{property.address}</div>
                        </div>
                    </div>

                    <div style={{ marginBottom: "24px" }}>
                        <label className="label-text" style={{ display: "block", marginBottom: "8px" }}>Personal Note (Optional)</label>
                        <textarea
                            className="input-field"
                            placeholder="Introduce yourself to the manager..."
                            style={{ height: "80px", resize: "none", fontSize: "14px" }}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleJoin}
                        disabled={loading}
                        style={{
                            width: "100%", padding: "16px", borderRadius: "16px",
                            background: "var(--accent-primary)", color: "white", border: "none",
                            fontWeight: 700, cursor: "pointer"
                        }}
                    >
                        {loading ? "Sending..." : "Send Join Request"}
                    </button>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
