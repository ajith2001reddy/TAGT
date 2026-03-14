"use client";

import { useState, useEffect } from "react";
import { fetchLeases, Lease, uploadLease } from "@/features/owner/lease.service";
import { fetchResidents, Resident } from "@/features/owner/residents.service";
import { FileText, Upload, CheckCircle2, Clock } from "lucide-react";
import { toast } from "react-hot-toast";

export default function OwnerLeasePage() {
    const [leases, setLeases] = useState<Lease[]>([]);
    const [residents, setResidents] = useState<Resident[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    const [form, setForm] = useState({
        residentId: "",
        fileUrl: ""
    });

    useEffect(() => {
        Promise.all([fetchLeases(), fetchResidents()])
            .then(([l, r]) => {
                setLeases(l);
                setResidents(r);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.residentId || !form.fileUrl) return toast.error("Please fill all fields");
        
        setUploading(true);
        try {
            const resident = residents.find(r => r._id === form.residentId);
            let propId = "";
            if (resident?.propertyId) {
                if (typeof resident.propertyId === 'string') {
                    propId = resident.propertyId;
                } else {
                    propId = resident.propertyId._id;
                }
            }

            await uploadLease({
                residentId: form.residentId,
                propertyId: propId || "",
                fileUrl: form.fileUrl
            });
            toast.success("Lease uploaded and sent to resident!");
            setShowUpload(false);
            const l = await fetchLeases();
            setLeases(l);
        } catch {
            toast.error("Failed to upload lease");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
                <div>
                    <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "8px" }}>Resident Leases</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Manage, upload, and track digital signatures for your lease agreements.</p>
                </div>
                <button className="btn-primary" onClick={() => setShowUpload(true)} style={{ gap: "10px" }}>
                    <Upload size={18} /> Upload New Lease
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", marginBottom: "32px" }}>
                <StatsCard title="Total Leases" value={leases.length.toString()} icon={<FileText size={20} />} color="#00d4ff" />
                <StatsCard title="Pending Sign" value={leases.filter(l => l.status === 'pending').length.toString()} icon={<Clock size={20} />} color="#fbbf24" />
                <StatsCard title="Signed" value={leases.filter(l => l.status === 'signed').length.toString()} icon={<CheckCircle2 size={20} />} color="#34d399" />
            </div>

            <div className="glass-card" style={{ borderRadius: "24px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border-subtle)" }}>
                            {["Resident", "Date Uploaded", "Status", "Actions"].map(h => (
                                <th key={h} style={{ padding: "16px 24px", textAlign: "left", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-tertiary)" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} style={{ padding: "40px", textAlign: "center" }}>Loading leases...</td></tr>
                        ) : leases.length === 0 ? (
                            <tr><td colSpan={4} style={{ padding: "60px", textAlign: "center", color: "var(--text-tertiary)" }}>No leases uploaded yet.</td></tr>
                        ) : leases.map(l => (
                            <tr key={l._id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                <td style={{ padding: "16px 24px" }}>
                                    <div style={{ fontWeight: 600 }}>{l.residentId?.name}</div>
                                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{l.residentId?.email}</div>
                                </td>
                                <td style={{ padding: "16px 24px", fontSize: "13px" }}>
                                    {new Date(l.createdAt).toLocaleDateString()}
                                </td>
                                <td style={{ padding: "16px 24px" }}>
                                    <span style={{ 
                                        padding: "4px 10px", borderRadius: "100px", fontSize: "10px", fontWeight: 700,
                                        background: l.status === 'signed' ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)',
                                        color: l.status === 'signed' ? '#34d399' : '#fbbf24',
                                        border: `1px solid ${l.status === 'signed' ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)'}`
                                    }}>
                                        {l.status.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: "16px 24px" }}>
                                    <a href={l.fileUrl} target="_blank" className="btn-ghost" style={{ padding: "6px 12px", fontSize: "12px" }}>View File</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showUpload && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
                    <div className="glass-card animate-fade-up" style={{ padding: "32px", width: "480px" }}>
                        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px" }}>Upload Lease Document</h2>
                        <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: "8px" }}>SELECT RESIDENT</label>
                                <select 
                                    className="input-field" 
                                    value={form.residentId} 
                                    onChange={e => setForm({...form, residentId: e.target.value})}
                                    required
                                >
                                    <option value="">Choose resident...</option>
                                    {residents.map(r => <option key={r._id} value={r._id}>{r.name} ({r.email})</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: "8px" }}>LEASE DOCUMENT URL (PDF)</label>
                                <input 
                                    className="input-field" 
                                    placeholder="https://cloudinary.com/..." 
                                    value={form.fileUrl}
                                    onChange={e => setForm({...form, fileUrl: e.target.value})}
                                    required
                                />
                                <span style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "6px", display: "block" }}>Paste the link to your Cloudinary or S3 hosted PDF.</span>
                            </div>

                            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowUpload(false)} style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={uploading} style={{ flex: 1 }}>
                                    {uploading ? "Uploading..." : "Send to Resident"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatsCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
    return (
        <div className="glass-card" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "20px", borderRadius: "20px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 600 }}>{title}</div>
                <div style={{ fontSize: "24px", fontWeight: 800 }}>{value}</div>
            </div>
        </div>
    );
}
