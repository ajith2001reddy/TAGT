"use client";

import { useState } from "react";
import { Bed } from "@/features/owner/rooms.service";
import { useBeds } from "@/features/owner/useBeds";
import { ResidentAssignmentModal } from "./ResidentAssignmentModal";

interface BedGridProps {
    roomId: string;
}

export function BedGrid({ roomId }: BedGridProps) {
    const { beds, loading, reload } = useBeds(roomId);
    const [selectedBed, setSelectedBed] = useState<Bed | null>(null);

    if (loading) {
        return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))", gap: "8px", marginTop: "12px" }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: "40px", borderRadius: "8px" }} />)}
        </div>;
    }

    return (
        <div style={{ marginTop: "16px" }}>
            <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", letterSpacing: "0.06em", marginBottom: "10px", textTransform: "uppercase" }}>
                Beds
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "8px" }}>
                {beds.map(bed => (
                    <div
                        key={bed._id}
                        onClick={() => bed.status === "available" && setSelectedBed(bed)}
                        style={{
                            padding: "8px",
                            borderRadius: "10px",
                            background: bed.status === "occupied" ? "rgba(52, 211, 153, 0.1)" : "var(--bg-card-subtle)",
                            border: `1px solid ${bed.status === "occupied" ? "rgba(52, 211, 153, 0.2)" : "var(--border-subtle)"}`,
                            textAlign: "center",
                            cursor: bed.status === "available" ? "pointer" : "default",
                            transition: "all 0.2s ease"
                        }}
                        onMouseEnter={e => {
                            if (bed.status === "available") {
                                (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-primary)";
                                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                            }
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.borderColor = bed.status === "occupied" ? "rgba(52, 211, 153, 0.2)" : "var(--border-subtle)";
                            (e.currentTarget as HTMLElement).style.transform = "";
                        }}
                    >
                        <div style={{ fontSize: "10px", fontWeight: 600, color: bed.status === "occupied" ? "#34d399" : "var(--text-secondary)" }}>
                            {bed?.bedNumber.replace("Bed ", "#")}
                        </div>
                        <div style={{ fontSize: "9px", color: "var(--text-tertiary)", marginTop: "2px" }}>
                            {bed.status}
                        </div>
                    </div>
                ))}
            </div>

            {selectedBed && (
                <ResidentAssignmentModal
                    bed={selectedBed}
                    onClose={() => setSelectedBed(null)}
                    onSuccess={() => { reload(); }}
                />
            )}
        </div>
    );
}
