"use client";

import { useState } from "react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "18px", padding: "24px", marginBottom: "16px" }}>
            <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "20px" }}>{title}</div>
            {children}
        </div>
    );
}

function FormRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid var(--border-subtle)", gap: "20px" }}>
            <div>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>{label}</div>
                {desc && <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>{desc}</div>}
            </div>
            <div style={{ flexShrink: 0 }}>{children}</div>
        </div>
    );
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{value ? "On" : "Off"}</span>
            <button onClick={() => onChange(!value)} style={{
                width: "44px", height: "24px", borderRadius: "12px", border: "none", cursor: "pointer",
                background: value ? "var(--accent-primary)" : "var(--border-default)",
                position: "relative", transition: "background 0.2s ease",
            }}>
                <div style={{
                    position: "absolute", top: "3px",
                    left: value ? "23px" : "3px",
                    width: "18px", height: "18px",
                    borderRadius: "50%", background: "#000",
                    transition: "left 0.2s ease",
                }} />
            </button>
        </div>
    );
}

export default function SettingsPage() {
    const [lateFee, setLateFee] = useState("5");
    const [graceDays, setGraceDays] = useState("5");
    const [dueDay, setDueDay] = useState("1");
    const [autoRent, setAutoRent] = useState(true);
    const [autoReminder, setAutoReminder] = useState(false);
    const [saved, setSaved] = useState(false);

    async function handleSave() {
        // Future: PATCH /v2/property/settings
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    }

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: "32px" }}>
                <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Configuration</div>
                <h1 className="display-text" style={{ fontSize: "30px", marginBottom: "4px" }}>Settings</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Billing rules and automation controls for your property</p>
            </div>

            <Section title="Billing Rules">
                <FormRow label="Late Fee %" desc="Applied after grace period expires">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input type="number" className="input-field" value={lateFee} onChange={e => setLateFee(e.target.value)} min="0" max="50" style={{ width: "80px", textAlign: "center", padding: "8px 12px", fontSize: "14px" }} />
                        <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>%</span>
                    </div>
                </FormRow>
                <FormRow label="Grace Period" desc="Days after due date before late fee kicks in">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input type="number" className="input-field" value={graceDays} onChange={e => setGraceDays(e.target.value)} min="0" max="30" style={{ width: "80px", textAlign: "center", padding: "8px 12px", fontSize: "14px" }} />
                        <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>days</span>
                    </div>
                </FormRow>
                <FormRow label="Rent Due Day" desc="Day of the month when rent is due">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input type="number" className="input-field" value={dueDay} onChange={e => setDueDay(e.target.value)} min="1" max="28" style={{ width: "80px", textAlign: "center", padding: "8px 12px", fontSize: "14px" }} />
                        <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>of month</span>
                    </div>
                </FormRow>
            </Section>

            <Section title="Automation">
                <FormRow label="Auto Rent Generation" desc="Automatically create rent bills on the 1st of each month">
                    <Toggle value={autoRent} onChange={setAutoRent} label="Auto rent" />
                </FormRow>
                <div style={{ paddingTop: "4px" }}>
                    <FormRow label="Auto Email Reminders" desc="Send reminders 3 days before due date (coming soon)">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Toggle value={autoReminder} onChange={setAutoReminder} label="Reminders" />
                            <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", background: "var(--yellow-bg)", color: "var(--yellow)", border: "1px solid rgba(255,215,64,0.2)", borderRadius: "5px", padding: "2px 7px", letterSpacing: "0.08em" }}>SOON</span>
                        </div>
                    </FormRow>
                </div>
            </Section>

            <div style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.1)", borderRadius: "12px", padding: "14px 18px", marginBottom: "24px", fontSize: "13px", color: "var(--text-secondary)" }}>
                💡 These settings will be saved to your property profile. Changes to billing rules only affect <b>future</b> bills, not existing ones.
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button className="btn-primary" onClick={handleSave} style={{ padding: "12px 32px" }}>
                    Save Settings
                </button>
                {saved && (
                    <div className="animate-fade-in" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--green)" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                        Saved!
                    </div>
                )}
            </div>
        </div>
    );
}
