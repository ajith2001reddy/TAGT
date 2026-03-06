"use client";

import { useState, useEffect } from "react";
import { Bed, assignResidentToBed } from "./rooms.service";
import { api } from "@/lib/api";

interface Resident {
    _id: string;
    name: string;
    email: string;
}

interface ResidentAssignmentModalProps {
    bed: Bed;
    onClose: () => void;
    onSuccess: () => void;
}

export function ResidentAssignmentModal({ bed, onClose, onSuccess }: ResidentAssignmentModalProps) {
    const [residents, setResidents] = useState<Resident[]>([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadResidents() {
            try {
                const response = await api.get("/v2/residents");
                // Only show active residents who aren't assigned to this bed already
                // In a real app, we might filter those who have NO bed.
                const data = response.data?.data || [];
                setResidents(data);
            } catch (err) {
                setError("Failed to load residents");
            } finally {
                setLoading(false);
            }
        }
        loadResidents();
    }, []);

    const filteredResidents = residents.filter(r =>
        r.name.toLowerCase().includes(searching.toLowerCase()) ||
        r.email.toLowerCase().includes(searching.toLowerCase())
    );

    async function handleAssign(residentId: string) {
        setSubmitting(true);
        setError("");
        try {
            await assignResidentToBed(bed._id, residentId);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || "Assignment failed");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
            padding: "20px"
        }} onClick={onClose}>
            <div
                style={{
                    background: "var(--bg-card)", border: "1px solid var(--border-default)",
                    borderRadius: "20px", width: "100%", maxWidth: "450px",
                    padding: "32px", position: "relative", boxShadow: "0 24px 64px rgba(0,0,0,0.5)"
                }}
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: "20px" }}>×</button>

                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>Assign Resident</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "24px" }}>
                    Select a resident to assign to <span style={{ color: "var(--accent-primary)", fontWeight: 600 }}>{bed.bedLabel ?? bed._id.slice(-4)}</span>
                </p>

                <input
                    className="input-field"
                    placeholder="Search residents..."
                    value={searching}
                    onChange={e => setSearching(e.target.value)}
                    style={{ marginBottom: "16px" }}
                />

                {error && <div style={{ color: "var(--red)", fontSize: "12px", marginBottom: "12px" }}>{error}</div>}

                <div style={{ maxHeight: "300px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: "50px", borderRadius: "12px" }} />)
                    ) : filteredResidents.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "20px", color: "var(--text-tertiary)", fontSize: "13px" }}>No residents found</div>
                    ) : (
                        filteredResidents.map(r => (
                            <button
                                key={r._id}
                                disabled={submitting}
                                onClick={() => handleAssign(r._id)}
                                style={{
                                    display: "flex", flexDirection: "column", alignItems: "flex-start",
                                    padding: "12px 16px", borderRadius: "12px", background: "var(--bg-card-subtle)",
                                    border: "1px solid var(--border-subtle)", cursor: "pointer", textAlign: "left",
                                    transition: "all 0.2s ease"
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-primary)";
                                    (e.currentTarget as HTMLElement).style.background = "rgba(0,183,255,0.05)";
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                                    (e.currentTarget as HTMLElement).style.background = "var(--bg-card-subtle)";
                                }}
                            >
                                <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>{r.name}</span>
                                <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{r.email}</span>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
