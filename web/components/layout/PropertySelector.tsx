"use client";

import { useProperty } from "@/context/PropertyContext";
import { Building2, ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PropertySelector() {
    const { property, properties, setCurrentProperty } = useProperty();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (properties.length === 0) return null;

    return (
        <div ref={dropdownRef} style={{ position: "relative", margin: "4px 10px 12px" }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease"
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = "var(--border-default)";
                }}
                onMouseLeave={e => {
                    if (!isOpen) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                        e.currentTarget.style.borderColor = "var(--border-subtle)";
                    }
                }}
            >
                <div style={{
                    width: "28px", height: "28px", borderRadius: "8px",
                    background: "var(--accent-primary)15", color: "var(--accent-primary)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                    <Building2 size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "9px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1px" }}>Active Property</div>
                    <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {property?.name || "Select Property"}
                    </div>
                </div>
                <ChevronDown size={14} style={{ color: "var(--text-tertiary)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        style={{
                            position: "absolute",
                            top: "calc(100% + 8px)",
                            left: 0,
                            right: 0,
                            background: "#0c141d",
                            border: "1px solid var(--border-default)",
                            borderRadius: "14px",
                            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                            zIndex: 100,
                            padding: "6px",
                            maxHeight: "300px",
                            overflowY: "auto"
                        }}
                    >
                        {properties.map(p => {
                            const selected = p._id === property?._id;
                            return (
                                <button
                                    key={p._id}
                                    onClick={() => {
                                        setCurrentProperty(p._id);
                                        setIsOpen(false);
                                    }}
                                    style={{
                                        width: "100%",
                                        padding: "10px 12px",
                                        borderRadius: "10px",
                                        background: selected ? "rgba(0,212,255,0.08)" : "transparent",
                                        border: "none",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        cursor: "pointer",
                                        textAlign: "left",
                                        transition: "all 0.1s"
                                    }}
                                    onMouseEnter={e => !selected && (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                                    onMouseLeave={e => !selected && (e.currentTarget.style.background = "transparent")}
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: "13px", fontWeight: selected ? 600 : 400, color: selected ? "var(--accent-primary)" : "var(--text-secondary)" }}>{p.name}</div>
                                        <div style={{ fontSize: "11px", color: "var(--text-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.city}</div>
                                    </div>
                                    {selected && <Check size={14} style={{ color: "var(--accent-primary)" }} />}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
