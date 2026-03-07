"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchProfile, updateProfile, changePassword, UserProfile } from "@/features/profile/profile.service";
import { User, Mail, Phone, Lock, Save, ShieldCheck, CreditCard, Building, MapPin } from "lucide-react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "18px", padding: "28px", marginBottom: "20px" }}>
            <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "4px", height: "12px", background: "var(--accent-primary)", borderRadius: "2px" }} />
                {title}
            </div>
            {children}
        </div>
    );
}

interface InputGroupProps {
    label: string;
    icon: React.ElementType;
    value: string | undefined;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    disabled?: boolean;
}
function InputGroup({ label, icon: Icon, value, onChange, placeholder, type = "text", disabled = false }: InputGroupProps) {
    return (
        <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px", marginLeft: "4px" }}>{label}</label>
            <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", pointerEvents: "none" }}>
                    <Icon size={16} />
                </div>
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="input-field"
                    style={{
                        paddingLeft: "40px",
                        opacity: disabled ? 0.6 : 1,
                        background: disabled ? "var(--bg-elevated)" : "var(--bg-card-subtle)",
                        cursor: disabled ? "not-allowed" : "text"
                    }}
                />
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form states
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    // Password states
    const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
    const [passSaving, setPassSaving] = useState(false);
    const [passError, setPassError] = useState("");
    const [passSuccess, setPassSuccess] = useState("");

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        try {
            const data = await fetchProfile();
            setProfile(data);
            setName(data.name);
            setPhone(data.phoneNumber || "");
        } catch (err) {
            setError("Failed to load profile data.");
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdateProfile() {
        setError(""); setSuccess(""); setSaving(true);
        try {
            const updated = await updateProfile({ name, phoneNumber: phone });
            setProfile(updated);
            setSuccess("Profile updated successfully!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    }

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault();
        setPassError(""); setPassSuccess("");
        const hasPassword = !!profile?.isPasswordSet;

        if (hasPassword && !passwords.current) {
            return setPassError("Current password is required.");
        }

        if (passwords.new !== passwords.confirm) {
            return setPassError("New passwords do not match.");
        }

        setPassSaving(true);
        try {
            await changePassword({ currentPassword: passwords.current, newPassword: passwords.new });
            await loadProfile(); // Refresh to update isPasswordSet flag
            setPassSuccess(hasPassword ? "Password changed successfully!" : "Password created successfully!");
            setPasswords({ current: "", new: "", confirm: "" });
            setTimeout(() => setPassSuccess(""), 3000);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setPassError(error.response?.data?.message || "Failed to change password.");
        } finally {
            setPassSaving(false);
        }
    }

    if (loading) return (
        <div style={{ padding: "40px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="skeleton" style={{ height: "100px", borderRadius: "20px" }} />
            <div className="skeleton" style={{ height: "400px", borderRadius: "20px" }} />
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "80px" }}>
            {/* Header */}
            <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "24px", background: "rgba(255,255,255,0.03)", padding: "32px", borderRadius: "24px", border: "1px solid var(--border-subtle)" }}>
                <div style={{
                    width: "80px", height: "80px", borderRadius: "24px",
                    background: "linear-gradient(135deg, var(--accent-primary), #0068a0)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "32px", fontWeight: 800, color: "#000",
                    boxShadow: "0 10px 30px rgba(0,212,255,0.15)"
                }}>
                    {profile?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h1 className="display-text" style={{ fontSize: "32px", marginBottom: "4px" }}>{profile?.name}</h1>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <span style={{
                            fontSize: "11px", fontWeight: 700, fontFamily: "var(--font-mono)",
                            textTransform: "uppercase", padding: "4px 10px", borderRadius: "6px",
                            background: "rgba(0,212,255,0.1)", color: "var(--accent-primary)",
                            border: "1px solid rgba(0,212,255,0.2)"
                        }}>
                            {profile?.role.replace("_", " ")}
                        </span>
                        <span style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>{profile?.email}</span>
                    </div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {/* Personal Info */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <Section title="Personal Information">
                        <InputGroup label="Full Name" icon={User} value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" />
                        <InputGroup label="Email Address" icon={Mail} value={profile?.email} disabled />
                        <InputGroup label="Phone Number" icon={Phone} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />

                        {error && <div style={{ color: "var(--red)", fontSize: "13px", marginBottom: "16px", padding: "10px", background: "var(--red-bg)", borderRadius: "8px", border: "1px solid rgba(255,82,82,0.1)" }}>{error}</div>}
                        {success && <div style={{ color: "var(--green)", fontSize: "13px", marginBottom: "16px", padding: "10px", background: "var(--green-bg)", borderRadius: "8px", border: "1px solid rgba(0,230,118,0.1)" }}>{success}</div>}

                        <button className="btn-primary" onClick={handleUpdateProfile} disabled={saving} style={{ width: "100%", height: "48px", gap: "10px" }}>
                            {saving ? "Saving..." : <><Save size={18} /> Save Profile Changes</>}
                        </button>
                    </Section>

                    {/* Account Security - Only for non-super admins */}
                    {profile?.role !== "super_admin" && (
                        <Section title={profile?.isPasswordSet ? "Security & Password" : "Secure Your Account"}>
                            {!profile?.isPasswordSet && (
                                <div style={{
                                    padding: "16px",
                                    background: "rgba(0,212,255,0.05)",
                                    borderRadius: "12px",
                                    border: "1px solid rgba(0,212,255,0.1)",
                                    marginBottom: "20px",
                                    fontSize: "13px",
                                    color: "var(--text-secondary)",
                                    lineHeight: "1.5"
                                }}>
                                    <p style={{ fontWeight: 600, color: "var(--accent-primary)", marginBottom: "4px" }}>🔑 Password Login</p>
                                    You are currently using Phone/OTP login. Set a password here to login faster next time without needing an SMS code.
                                </div>
                            )}
                            <form onSubmit={handleChangePassword}>
                                {profile?.isPasswordSet && (
                                    <InputGroup label="Current Password" icon={Lock} type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} placeholder="••••••••" />
                                )}
                                <InputGroup label={profile?.isPasswordSet ? "New Password" : "Create Password"} icon={ShieldCheck} type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} placeholder="••••••••" />
                                <InputGroup label="Confirm Password" icon={ShieldCheck} type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="••••••••" />

                                {passError && <div style={{ color: "var(--red)", fontSize: "13px", marginBottom: "16px", padding: "10px", background: "var(--red-bg)", borderRadius: "8px", border: "1px solid rgba(255,82,82,0.1)" }}>{passError}</div>}
                                {passSuccess && <div style={{ color: "var(--green)", fontSize: "13px", marginBottom: "16px", padding: "10px", background: "var(--green-bg)", borderRadius: "8px", border: "1px solid rgba(0,230,118,0.1)" }}>{passSuccess}</div>}

                                <button type="submit" className="btn-ghost" disabled={passSaving} style={{ width: "100%", height: "48px", gap: "10px" }}>
                                    {passSaving ? "Updating password..." : profile?.isPasswordSet ? "Change Password" : "Set Login Password"}
                                </button>
                            </form>
                        </Section>
                    )}
                </div>

                {/* Role Specific Info */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {profile?.role === "resident" && (
                        <Section title="Residential Details">
                            <div style={{ display: "grid", gap: "16px" }}>
                                <div style={{ padding: "16px", background: "var(--bg-card-subtle)", borderRadius: "12px", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: "16px" }}>
                                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
                                        <Building size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Property</div>
                                        <div style={{ fontSize: "14px", fontWeight: 600 }}>Resident Property</div>
                                    </div>
                                </div>
                                <div style={{ padding: "16px", background: "var(--bg-card-subtle)", borderRadius: "12px", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: "16px" }}>
                                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(167, 139, 250, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a78bfa" }}>
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Room / Bed</div>
                                        <div style={{ fontSize: "14px", fontWeight: 600 }}>Assigned Unit</div>
                                    </div>
                                </div>
                            </div>
                        </Section>
                    )}

                    {profile?.role === "owner" && (
                        <Section title="Subscription Status">
                            <div style={{ padding: "24px", background: "linear-gradient(135deg, rgba(0,212,255,0.05), rgba(79, 70, 229, 0.05))", borderRadius: "16px", border: "1px solid rgba(0,212,255,0.1)", textAlign: "center" }}>
                                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)", margin: "0 auto 16px" }}>
                                    <ShieldCheck size={28} />
                                </div>
                                <h4 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Enterprise Plan</h4>
                                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>Your account is in good standing with full access to all premium features.</p>
                                <button className="btn-ghost" style={{ fontSize: "12px" }}>Manage Billing</button>
                            </div>
                        </Section>
                    )}

                    {profile?.role === "super_admin" && (
                        <Section title="Administrator Privileges">
                            <div style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>
                                <p style={{ marginBottom: "12px" }}>As a Super Administrator, you have full write access to the entire platform. Be careful when updating records.</p>
                                <ul style={{ marginLeft: "20px", listStyle: "circle" }}>
                                    <li>Manage all properties and owners</li>
                                    <li>Global billing audit trails</li>
                                    <li>Platform configuration overrides</li>
                                    <li>Revenue forecasting access</li>
                                </ul>
                            </div>
                        </Section>
                    )}
                </div>
            </div>
        </div>
    );
}
