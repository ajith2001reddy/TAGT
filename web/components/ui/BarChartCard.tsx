"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useMounted } from "@/hooks/useMounted";

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "13px",
                fontFamily: "var(--font-mono)",
            }}>
                <p style={{ color: "var(--text-secondary)", marginBottom: "4px" }}>{label}</p>
                <p style={{ color: "var(--accent-primary)", fontWeight: 600 }}>{payload[0].value}</p>
            </div>
        );
    }
    return null;
};

export function BarChartCard({ title, data, dataKey }: { title: string; data: { name: string;[key: string]: string | number }[]; dataKey: string }) {
    const mounted = useMounted();
    return (
        <div className="glass-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600, letterSpacing: "-0.01em" }}>
                    {title}
                </h3>
                <span className="label-text">LIVE</span>
            </div>
            <div style={{ height: "240px" }}>
                {mounted ? (
                    <ResponsiveContainer width="100%" height="100%" minHeight={0}>
                        <BarChart data={data} barSize={36}>
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "var(--text-tertiary)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "var(--text-tertiary)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)", radius: 6 }} />
                            <Bar dataKey={dataKey} radius={[6, 6, 0, 0]}>
                                {data.map((_, index) => (
                                    <Cell
                                        key={index}
                                        fill={index === 0 ? "var(--accent-primary)" : "rgba(0,212,255,0.25)"}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : null}
            </div>
        </div>
    );
}