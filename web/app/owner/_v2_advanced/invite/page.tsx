"use client";

import { useEffect, useState } from "react";
import { UserPlus, Link as LinkIcon, Mail, Smartphone, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { fetchResidents, createResident, Resident } from "@/features/owner/residents.service";
import { toast } from "react-hot-toast";

export default function OwnerInvitePage() {
    const [invites, setInvites] = useState<Resident[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResidents().then(data => {
            setInvites(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const copyInviteLink = () => {
        navigator.clipboard.writeText("https://tagt.website/invite/pro_xyz123");
        toast.success("Invite link copied to clipboard!");
    };

    const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const name = formData.get("name") as string;

        try {
            await createResident({ name, email, roomId: null });
            toast.success("Invitation sent successfully!");
            (e.target as HTMLFormElement).reset();
            // Refresh list
            fetchResidents().then(setInvites);
        } catch {
            toast.error("Failed to send invitation.");
        }
    };

    if (loading) return <div className="skeleton" style={{ height: "400px", borderRadius: "24px" }} />;

    return (
        <div className="animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
                <div>
                    <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "8px" }}>Resident Invites</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Onboard residents to your properties with one-click magic links.</p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {/* Invite Creator */}
                    <div className="glass-card" style={{ padding: "32px", borderRadius: "24px" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "24px" }}>Send New Invite</h3>
                        <form onSubmit={handleInvite}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: "8px" }}>RESIDENT NAME</label>
                                    <input name="name" className="input-field" placeholder="Full Name" required />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: "8px" }}>EMAIL OR PHONE</label>
                                    <input name="email" className="input-field" placeholder="name@email.com" required />
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "12px" }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1, gap: "10px" }}>
                                    <Mail size={18} /> Send over Email
                                </button>
                                <button type="button" className="btn-ghost" style={{ flex: 1, gap: "10px" }}>
                                    <Smartphone size={18} /> Send over SMS
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Pending Invites */}
                    <div className="glass-card" style={{ borderRadius: "24px" }}>
                        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", fontWeight: 700, fontSize: "15px" }}>
                            Recent Invites
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            {invites.map((inv, i) => (
                                <div key={inv._id} style={{
                                    padding: "20px 24px", borderBottom: i === invites.length - 1 ? "none" : "1px solid var(--border-subtle)",
                                    display: "flex", justifyContent: "space-between", alignItems: "center"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <Mail size={16} color="var(--text-tertiary)" />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "14px", fontWeight: 600 }}>{inv.name}</div>
                                            <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{inv.email}</div>
                                        </div>
                                    </div>
                                    <span style={{
                                        fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "100px",
                                        background: inv.isActive ? "rgba(52,211,153,0.1)" : "rgba(251,191,36,0.1)",
                                        color: inv.isActive ? "#34d399" : "#fbbf24",
                                        border: `1px solid ${inv.isActive ? "rgba(52,211,153,0.2)" : "rgba(251,191,36,0.2)"}`
                                    }}>{inv.isActive ? "ACTIVE" : "PENDING"}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Shared Link Card */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div className="glass-card" style={{ padding: "28px", borderRadius: "24px", border: "1px solid rgba(0,212,255,0.2)", background: "linear-gradient(135deg, rgba(0,212,255,0.05), transparent)" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)", marginBottom: "20px" }}>
                            <LinkIcon size={20} />
                        </div>
                        <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>Universal Invite Link</h3>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "20px" }}>Share this link anywhere (WhatsApp, Social Media) to let residents join your property.</p>

                        <div style={{
                            padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.2)",
                            fontSize: "12px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)",
                            marginBottom: "16px", border: "1px solid var(--border-subtle)",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                        }}>
                            tagt.website/invite/pro_xyz123
                        </div>

                        <button onClick={copyInviteLink} className="btn-primary" style={{ width: "100%", fontSize: "13px" }}>Copy Invite Link</button>
                    </div>

                    <div className="glass-card" style={{ padding: "24px", borderRadius: "24px" }}>
                        <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Clock size={16} /> Invite Stats
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Total Sent</span>
                                <span style={{ fontSize: "13px", fontWeight: 700 }}>{invites.length}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Acceptance Rate</span>
                                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--green)" }}>94%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
