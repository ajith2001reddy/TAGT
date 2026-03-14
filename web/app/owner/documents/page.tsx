"use client";

import { useState, useEffect } from "react";
import { fetchLeases, Lease, uploadLease } from "@/features/owner/lease.service";
import { fetchResidents, Resident } from "@/features/owner/residents.service";
import { FileText, Upload, Clock, ShieldCheck, Search } from "lucide-react";
import { toast } from "react-hot-toast";

export default function DocumentVaultPage() {
    const [leases, setLeases] = useState<Lease[]>([]);
    const [residents, setResidents] = useState<Resident[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState("");
    
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
                propId = typeof resident.propertyId === 'string' ? resident.propertyId : resident.propertyId._id;
            }

            await uploadLease({
                residentId: form.residentId,
                propertyId: propId || "",
                fileUrl: form.fileUrl
            });
            toast.success("Document uploaded and recorded!");
            setShowUpload(false);
            const l = await fetchLeases();
            setLeases(l);
        } catch {
            toast.error("Failed to upload document");
        } finally {
            setUploading(false);
        }
    };

    const filteredDocuments = leases.filter(l => 
        l.residentId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        l.residentId?.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
                <div>
                    <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "8px" }}>Document Vault</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>A legally resilient repository for leases, Aadhaar cards, and KYC records.</p>
                </div>
                <button className="btn-primary" onClick={() => setShowUpload(true)} style={{ gap: "10px" }}>
                    <Upload size={18} /> Add New Document
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", marginBottom: "32px" }}>
                <StatsCard title="Total Docs" value={leases.length.toString()} icon={<FileText size={20} />} color="var(--accent-primary)" />
                <StatsCard title="Verified" value={leases.filter(l => l.status === 'signed').length.toString()} icon={<ShieldCheck size={20} />} color="#34d399" />
                <StatsCard title="Pending Review" value={leases.filter(l => l.status === 'pending').length.toString()} icon={<Clock size={20} />} color="#fbbf24" />
            </div>

            <div className="glass-card" style={{ padding: "0", borderRadius: "24px", overflow: "hidden" }}>
                <div style={{ padding: "24px", display: "flex", gap: "16px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border-subtle)" }}>
                    <div style={{ flex: 1, position: "relative" }}>
                        <Search size={18} style={{ position: "absolute", left: "16px", top: "12px", color: "var(--text-tertiary)" }} />
                        <input 
                            className="input-field" 
                            placeholder="Search by resident name or email..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: "44px" }}
                        />
                    </div>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border-subtle)" }}>
                            {["Resident", "Type", "Status", "Date", "Action"].map(h => (
                                <th key={h} style={{ padding: "16px 24px", textAlign: "left", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-tertiary)" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center" }}>Loading vault...</td></tr>
                        ) : filteredDocuments.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: "60px", textAlign: "center", color: "var(--text-tertiary)" }}>No documents found in the vault.</td></tr>
                        ) : filteredDocuments.map(l => (
                            <tr key={l._id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                <td style={{ padding: "16px 24px" }}>
                                    <div style={{ fontWeight: 600 }}>{l.residentId?.name}</div>
                                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{l.residentId?.email}</div>
                                </td>
                                <td style={{ padding: "16px 24px", fontSize: "13px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <FileText size={14} color="var(--accent-primary)" />
                                        <span>Lease Agreement</span>
                                    </div>
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
                                <td style={{ padding: "16px 24px", fontSize: "13px", color: "var(--text-secondary)" }}>
                                    {new Date(l.createdAt).toLocaleDateString()}
                                </td>
                                <td style={{ padding: "16px 24px" }}>
                                    <a href={l.fileUrl} target="_blank" className="btn-ghost" style={{ padding: "6px 14px", fontSize: "12px" }}>View Archive</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showUpload && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
                    <div className="glass-card animate-fade-up" style={{ padding: "32px", width: "480px" }}>
                        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px" }}>Vault Add Record</h2>
                        <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: "8px" }}>ASSOCIATE RESIDENT</label>
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
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: "8px" }}>DOCUMENT TYPE</label>
                                <select className="input-field" defaultValue="lease">
                                    <option value="lease">Lease Agreement</option>
                                    <option value="id">Aadhaar / ID Card</option>
                                    <option value="other">Other Documents</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: "8px" }}>PUBLIC URL (PDF)</label>
                                <input 
                                    className="input-field" 
                                    placeholder="https://..." 
                                    value={form.fileUrl}
                                    onChange={e => setForm({...form, fileUrl: e.target.value})}
                                    required
                                />
                            </div>

                            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowUpload(false)} style={{ flex: 1 }}>Discard</button>
                                <button type="submit" className="btn-primary" disabled={uploading} style={{ flex: 1 }}>
                                    {uploading ? "Uploading..." : "Save to Vault"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

interface StatsCardProps { title: string; value: string; icon: React.ReactNode; color: string; }
function StatsCard({ title, value, icon, color }: StatsCardProps) {
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
