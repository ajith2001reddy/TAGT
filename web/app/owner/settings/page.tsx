"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Save, User, Shield, Bell } from "lucide-react";

export default function OwnerSettingsPage() {
    const { dbUser } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");

    const tabs = [
        { id: "profile", label: "Profile", icon: <User size={16} /> },
        { id: "security", label: "Security", icon: <Shield size={16} /> },
        { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
    ];

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "32px" }}>
                <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "8px" }}>Settings</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Manage your personal details and account preferences.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "32px" }}>
                {/* Sidebar Tabs */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: "flex", alignItems: "center", gap: "10px",
                                padding: "12px 16px", borderRadius: "12px",
                                background: activeTab === tab.id ? "rgba(0,212,255,0.08)" : "transparent",
                                border: activeTab === tab.id ? "1px solid rgba(0,212,255,0.15)" : "1px solid transparent",
                                color: activeTab === tab.id ? "var(--accent-primary)" : "var(--text-secondary)",
                                cursor: "pointer", transition: "all 0.2s",
                                textAlign: "left", fontSize: "14px", fontWeight: 500
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="glass-card" style={{ padding: "32px", borderRadius: "24px" }}>
                    {activeTab === "profile" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "24px" }}>Profile Information</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <label style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 600 }}>FULL NAME</label>
                                    <input className="input-field" defaultValue={dbUser?.name} />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <label style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 600 }}>EMAIL ADDRESS</label>
                                    <input className="input-field" defaultValue={dbUser?.email} disabled />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px", gridColumn: "span 2" }}>
                                    <label style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 600 }}>PHONE NUMBER</label>
                                    <input className="input-field" defaultValue={(dbUser as any)?.phone} />
                                </div>
                            </div>
                            <button className="btn-primary" style={{ marginTop: "32px" }}>
                                <Save size={16} /> Save Changes
                            </button>
                        </motion.div>
                    )}

                    {activeTab === "security" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "24px" }}>Security Settings</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "400px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <label style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 600 }}>CURRENT PASSWORD</label>
                                    <input className="input-field" type="password" />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <label style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 600 }}>NEW PASSWORD</label>
                                    <input className="input-field" type="password" />
                                </div>
                                <button className="btn-primary">Update Password</button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
