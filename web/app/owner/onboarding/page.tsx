"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Bed, Users, Rocket, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { createProperty } from "@/features/owner/property.service";
import { toast } from "react-hot-toast";

export default function OwnerOnboardingPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "", address: "", rooms: 5, beds: 15
    });

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const steps = [
        { id: 1, label: "Basic Info", icon: <Home size={18} /> },
        { id: 2, label: "Capacity", icon: <Bed size={18} /> },
        { id: 3, label: "Launch", icon: <Rocket size={18} /> },
    ];

    const handleLaunch = async () => {
        try {
            await createProperty(formData);
            toast.success("Property created successfully!");
            window.location.href = "/owner";
        } catch {
            toast.error("Failed to create property.");
        }
    };

    return (
        <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 24px" }}>
            {/* Progress Stepper */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "48px", position: "relative" }}>
                <div style={{ position: "absolute", top: "20px", left: "40px", right: "40px", height: "2px", background: "rgba(255,255,255,0.05)", zIndex: 0 }} />
                <div style={{ position: "absolute", top: "20px", left: "40px", width: `${(step - 1) * 50}%`, height: "2px", background: "var(--accent-primary)", zIndex: 0, transition: "width 0.5s ease" }} />

                {steps.map(s => (
                    <div key={s.id} style={{ position: "relative", zIndex: 1, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                        <div style={{
                            width: "40px", height: "40px", borderRadius: "12px",
                            background: step >= s.id ? "var(--accent-primary)" : "var(--bg-elevated)",
                            color: step >= s.id ? "#000" : "var(--text-tertiary)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: step >= s.id ? "none" : "1px solid var(--border-subtle)",
                            transition: "all 0.3s"
                        }}>
                            {step > s.id ? <CheckCircle2 size={20} /> : s.icon}
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: step >= s.id ? "var(--text-primary)" : "var(--text-tertiary)" }}>{s.label}</span>
                    </div>
                ))}
            </div>

            <main className="glass-card" style={{ padding: "48px", borderRadius: "32px", minHeight: "450px", display: "flex", flexDirection: "column" }}>
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            style={{ flex: 1 }}
                        >
                            <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>Tell us about your property.</h2>
                            <p style={{ color: "var(--text-secondary)", marginBottom: "40px" }}>Start by giving your property a name and location.</p>

                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: "8px" }}>PROPERTY NAME</label>
                                    <input className="input-field" placeholder="e.g. Skyline Residency" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: "8px" }}>STREET ADDRESS</label>
                                    <input className="input-field" placeholder="123 Tech Park, Indiranagar" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            style={{ flex: 1 }}
                        >
                            <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>Configure Inventory.</h2>
                            <p style={{ color: "var(--text-secondary)", marginBottom: "40px" }}>Define your capacity. You can refine specific room details later.</p>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: "8px" }}>TOTAL ROOMS</label>
                                    <input type="number" className="input-field" value={formData.rooms} onChange={e => setFormData({ ...formData, rooms: parseInt(e.target.value) })} />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: "8px" }}>ESTIMATED TOTAL BEDS</label>
                                    <input type="number" className="input-field" value={formData.beds} onChange={e => setFormData({ ...formData, beds: parseInt(e.target.value) })} />
                                </div>
                            </div>

                            <div style={{ marginTop: "40px", padding: "20px", borderRadius: "16px", background: "rgba(0,212,255,0.03)", border: "1px solid rgba(0,212,255,0.1)" }}>
                                <div style={{ display: "flex", gap: "12px" }}>
                                    <Bed size={20} color="var(--accent-primary)" />
                                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                                        <strong>Pro Tip:</strong> Most owners start with a ratio of 3 beds per room. TAGT will auto-generate your digital floor plan based on these numbers.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}
                        >
                            <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: "rgba(52,211,153,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399", margin: "0 auto 32px" }}>
                                <CheckCircle2 size={40} />
                            </div>
                            <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "12px" }}>Ready for takeoff.</h2>
                            <p style={{ color: "var(--text-secondary)", marginBottom: "40px", maxWidth: "400px", margin: "0 auto 40px" }}>
                                Your property <strong>{formData.name}</strong> is about to be deployed to the cloud. You&apos;ll be able to invite residents immediately.
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "300px", margin: "0 auto" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "var(--text-tertiary)" }}>
                                    <span>Plan Status</span>
                                    <span style={{ color: "var(--green)", fontWeight: 700 }}>VERIFIED</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "var(--text-tertiary)" }}>
                                    <span>Inventory Mapping</span>
                                    <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>{formData.rooms} Rooms</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", paddingTop: "40px" }}>
                    {step > 1 ? (
                        <button onClick={prevStep} className="btn-ghost" style={{ gap: "8px" }}>
                            <ArrowLeft size={16} /> Back
                        </button>
                    ) : <div />}

                    <button
                        onClick={step === 3 ? handleLaunch : nextStep}
                        className="btn-primary"
                        style={{ gap: "8px", minWidth: "140px" }}
                    >
                        {step === 3 ? "Complete Launch" : "Continue"} <ArrowRight size={16} />
                    </button>
                </div>
            </main>
        </div>
    );
}
