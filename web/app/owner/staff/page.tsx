"use client";

import { useEffect, useState } from "react";
import { Users, UserPlus, Shield, Mail, MoreVertical, Trash2 } from "lucide-react";
import { fetchStaffList, inviteStaff, removeStaff, Staff } from "@/features/owner/staff.service";
import { useProperty } from "@/context/PropertyContext";
import { toast } from "react-hot-toast";

export default function OwnerStaffPage() {
    const { property } = useProperty();
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (property?._id) {
            fetchStaffList(property._id).then(data => {
                setStaff(data);
                setLoading(false);
            }).catch(() => setLoading(false));
        }
    }, [property?._id]);

    const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const role = formData.get("role") as any;

        try {
            const newStaff = await inviteStaff({ email, role, name: email.split("@")[0], status: "invited" });
            setStaff([...staff, newStaff]);
            toast.success("Invitation sent successfully!");
            (e.target as HTMLFormElement).reset();
        } catch {
            toast.error("Failed to send invitation.");
        }
    };

    const handleRemove = async (id: string) => {
        if (confirm("Are you sure you want to remove this staff member?")) {
            await removeStaff(id);
            setStaff(staff.filter(s => s._id !== id));
            toast.success("Staff member removed.");
        }
    };

    if (loading) return <div className="skeleton" style={{ height: "400px", borderRadius: "24px" }} />;

    return (
        <div className="animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
                <div>
                    <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "8px" }}>Team & Staff</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Manage property managers, accountants, and staff permissions.</p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }}>
                <div className="glass-card" style={{ borderRadius: "24px", overflow: "hidden" }}>
                    <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", fontWeight: 700, fontSize: "15px" }}>
                        Staff Members ({staff.length})
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {staff.map((s, i) => (
                            <div key={s._id} style={{
                                padding: "20px 24px", borderBottom: i === staff.length - 1 ? "none" : "1px solid var(--border-subtle)",
                                display: "flex", justifyContent: "space-between", alignItems: "center"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{
                                        width: "40px", height: "40px", borderRadius: "12px",
                                        background: "rgba(255,255,255,0.03)", display: "flex",
                                        alignItems: "center", justifyContent: "center", color: "var(--accent-primary)"
                                    }}>
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "14px", fontWeight: 700 }}>{s.name}</div>
                                        <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{s.email}</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                    <div style={{ textAlign: "right", marginRight: "16px" }}>
                                        <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Role</div>
                                        <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{s.role}</div>
                                    </div>
                                    <button onClick={() => handleRemove(s._id)} style={{ background: "transparent", border: "none", color: "var(--red)", cursor: "pointer", opacity: 0.6 }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card" style={{ padding: "32px", borderRadius: "24px", height: "fit-content" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>Invite Member</h3>
                    <form onSubmit={handleInvite} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: "8px" }}>EMAIL ADDRESS</label>
                            <input name="email" className="input-field" placeholder="staff@example.com" required />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: "8px" }}>ROLE</label>
                            <select name="role" className="input-field" style={{ appearance: "none" }}>
                                <option value="manager">Property Manager</option>
                                <option value="accountant">Accountant</option>
                                <option value="staff">Field Staff</option>
                            </select>
                        </div>
                        <button type="submit" className="btn-primary" style={{ marginTop: "12px", gap: "10px" }}>
                            <UserPlus size={18} /> Send Invite
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
