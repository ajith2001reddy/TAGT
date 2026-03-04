"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface DashboardCardProps {
    label: string;
    value: string | number;
    sub?: string;
    color: string;
    icon: ReactNode;
    trend?: "up" | "down" | "stable";
    trendValue?: string;
    delay?: number;
    onClick?: () => void;
}

export function DashboardCard({
    label, value, sub, color, icon, trend, trendValue, delay = 0, onClick
}: DashboardCardProps) {
    const TrendIcon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus;
    const trendColor = trend === "up" ? "#34d399" : trend === "down" ? "#ff5252" : "var(--text-tertiary)";

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            style={{
                background: "var(--bg-card)", border: "1px solid var(--border-default)",
                borderRadius: "20px", padding: "24px",
                position: "relative", overflow: "hidden",
                cursor: onClick ? "pointer" : "default",
                boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            }}
            onClick={onClick}
        >
            {/* Colored gradient top edge */}
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "2px",
                background: `linear-gradient(90deg, transparent, ${color}70, transparent)`,
            }} />

            {/* Background glow */}
            <div style={{
                position: "absolute", top: "-30%", right: "-10%",
                width: "120px", height: "120px",
                background: `radial-gradient(circle, ${color}08 0%, transparent 70%)`,
                pointerEvents: "none",
            }} />

            {/* Icon */}
            <div style={{
                position: "absolute", top: "20px", right: "20px",
                width: "40px", height: "40px",
                background: `${color}12`,
                border: `1px solid ${color}25`,
                borderRadius: "12px",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: color,
            }}>
                {icon}
            </div>

            <div style={{ marginBottom: "10px" }}>
                <div style={{
                    fontSize: "10.5px", fontFamily: "var(--font-mono)",
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    color: "var(--text-tertiary)",
                }}>{label}</div>
            </div>

            <div style={{
                fontFamily: "var(--font-display)", fontSize: "32px",
                fontWeight: 700, letterSpacing: "-0.03em",
                color: "var(--text-primary)", lineHeight: 1.1,
                marginBottom: "8px",
            }}>
                {value}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {sub && (
                    <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{sub}</span>
                )}
                {trend && trendValue && (
                    <span style={{
                        display: "flex", alignItems: "center", gap: "3px",
                        fontSize: "11px", fontWeight: 600, color: trendColor,
                        background: `${trendColor}12`, borderRadius: "5px",
                        padding: "2px 7px", fontFamily: "var(--font-mono)",
                        marginLeft: sub ? "auto" : 0,
                    }}>
                        <TrendIcon size={10} />
                        {trendValue}
                    </span>
                )}
            </div>
        </motion.div>
    );
}

interface ChartCardProps {
    title: string;
    sub?: string;
    children: ReactNode;
    actions?: ReactNode;
    delay?: number;
}

export function ChartCard({ title, sub, children, actions, delay = 0 }: ChartCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{
                background: "var(--bg-card)", border: "1px solid var(--border-default)",
                borderRadius: "20px", padding: "24px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <div>
                    <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "4px" }}>
                        {sub || "Chart"}
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: 700, letterSpacing: "-0.02em" }}>
                        {title}
                    </div>
                </div>
                {actions && <div>{actions}</div>}
            </div>
            {children}
        </motion.div>
    );
}

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    sub?: string;
    action?: ReactNode;
}

export function EmptyState({ icon, title, sub, action }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", padding: "48px 24px",
                background: "var(--bg-card)", border: "1px dashed var(--border-default)",
                borderRadius: "20px", textAlign: "center", gap: "12px",
            }}
        >
            <div style={{
                color: "var(--text-tertiary)", opacity: 0.6,
                width: "52px", height: "52px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.04)", borderRadius: "14px",
            }}>
                {icon}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600 }}>{title}</div>
            {sub && <div style={{ fontSize: "13px", color: "var(--text-tertiary)", maxWidth: "300px" }}>{sub}</div>}
            {action && <div style={{ marginTop: "4px" }}>{action}</div>}
        </motion.div>
    );
}

interface PageHeaderProps {
    label?: string;
    title: string;
    sub?: string;
    actions?: ReactNode;
}

export function PageHeader({ label, title, sub, actions }: PageHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-end", flexWrap: "wrap", gap: "12px",
                marginBottom: "28px",
            }}
        >
            <div>
                {label && (
                    <div style={{
                        fontSize: "10.5px", fontFamily: "var(--font-mono)",
                        letterSpacing: "0.14em", textTransform: "uppercase",
                        color: "var(--text-tertiary)", marginBottom: "6px",
                    }}>{label}</div>
                )}
                <h1 style={{
                    fontFamily: "var(--font-display)", fontSize: "28px",
                    fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15,
                    margin: 0, color: "var(--text-primary)",
                }}>{title}</h1>
                {sub && (
                    <p style={{
                        fontSize: "13px", color: "var(--text-secondary)",
                        marginTop: "4px", lineHeight: 1.5,
                    }}>{sub}</p>
                )}
            </div>
            {actions && <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>{actions}</div>}
        </motion.div>
    );
}
