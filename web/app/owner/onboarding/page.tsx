"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

interface JoinRequest {
    _id: string;
    residentId: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
        photo?: string;
    };
    propertyId: {
        _id: string;
        name: string;
    };
    message: string;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
}

export default function OwnerOnboardingPage() {
    const [requests, setRequests] = useState<JoinRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await api.get("/v2/join-requests/owner");
            setRequests(res.data.data);
        } catch (err) {
            console.error("Failed to fetch requests", err);
            toast.error("Failed to load onboarding requests");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: "approve" | "reject") => {
        setProcessingId(id);
        try {
            await api.patch(`/v2/join-requests/${id}/${action}`);
            toast.success(`Request ${action}d successfully`);
            setRequests(prev => prev.filter(r => r._id !== id));
        } catch (err: any) {
            toast.error(err.response?.data?.message || `Failed to ${action} request`);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return (
        <div style={{ padding: "40px" }}>
            <div className="skeleton" style={{ height: "40px", width: "300px", marginBottom: "32px", borderRadius: "12px" }} />
            <div style={{ display: "grid", gap: "20px" }}>
                {[1, 2, 3].map(i => (
                    <div key={i} className="skeleton" style={{ height: "120px", borderRadius: "24px" }} />
                ))}
            </div>
        </div>
    );

    // Filter out any requests where the resident or property was deleted
    const pendingRequests = requests.filter(r => r.status === "pending" && r.residentId && r.propertyId);

    return (
        <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto", animation: "fadeIn 0.6s ease-out" }}>
            <div style={{ marginBottom: "40px" }}>
                <h1 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "8px" }}>Onboarding Center</h1>
                <p style={{ color: "var(--text-tertiary)" }}>Manage incoming join requests from prospective residents.</p>
            </div>

            {pendingRequests.length === 0 ? (
                <div style={{
                    background: "var(--bg-glass)",
                    border: "1px dashed var(--border-default)",
                    borderRadius: "32px",
                    padding: "80px 40px",
                    textAlign: "center"
                }}>
                    <div style={{ fontSize: "48px", marginBottom: "20px" }}>✨</div>
                    <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>All caught up!</h3>
                    <p style={{ color: "var(--text-tertiary)" }}>No pending join requests at the moment.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gap: "24px" }}>
                    {pendingRequests.map(request => (
                        <div key={request._id} style={{
                            background: "var(--bg-glass)",
                            border: "1px solid var(--border-default)",
                            borderRadius: "28px",
                            padding: "24px 32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            transition: "all 0.3s",
                            gap: "24px"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "20px", flexGrow: 1 }}>
                                <div style={{
                                    width: "60px",
                                    height: "60px",
                                    borderRadius: "20px",
                                    background: "var(--bg-elevated)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "24px",
                                    overflow: "hidden",
                                    border: "1px solid var(--border-subtle)"
                                }}>
                                    {request.residentId?.photo ? (
                                        <img src={request.residentId.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        request.residentId?.name?.charAt(0) ?? "?"
                                    )}
                                </div>
                                <div style={{ flexGrow: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                        <h4 style={{ fontSize: "18px", fontWeight: 700 }}>{request.residentId?.name ?? "Unknown Resident"}</h4>
                                        <span style={{ fontSize: "11px", background: "var(--accent-primary)", color: "white", padding: "2px 8px", borderRadius: "10px", fontWeight: 600 }}>
                                            Join Request
                                        </span>
                                    </div>
                                    <div style={{ fontSize: "13px", color: "var(--text-tertiary)", marginBottom: "8px" }}>
                                        {request.residentId?.email} • {request.residentId?.phone || "No phone provided"}
                                    </div>
                                    <div style={{
                                        fontSize: "14px",
                                        lineHeight: 1.5,
                                        padding: "12px 16px",
                                        background: "rgba(0,0,0,0.03)",
                                        borderRadius: "16px",
                                        border: "1px solid var(--border-subtle)",
                                        fontStyle: "italic"
                                    }}>
                                        "{request.message || "No message provided"}"
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "160px" }}>
                                <div style={{ fontSize: "11px", color: "var(--text-tertiary)", textAlign: "center", marginBottom: "4px" }}>
                                    Requested for: <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{request.propertyId?.name ?? "Unknown Property"}</span>
                                </div>
                                <button
                                    disabled={processingId === request._id}
                                    onClick={() => handleAction(request._id, "approve")}
                                    style={{
                                        padding: "12px",
                                        borderRadius: "14px",
                                        background: "var(--accent-primary)",
                                        color: "white",
                                        border: "none",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        transition: "all 0.2s"
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                                    onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                                >
                                    {processingId === request._id ? "Processing..." : "Approve & Admit"}
                                </button>
                                <button
                                    disabled={processingId === request._id}
                                    onClick={() => handleAction(request._id, "reject")}
                                    style={{
                                        padding: "12px",
                                        borderRadius: "14px",
                                        background: "rgba(255, 82, 82, 0.1)",
                                        color: "#ff5252",
                                        border: "1px solid rgba(255, 82, 82, 0.2)",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    Reject
                                </button>
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
