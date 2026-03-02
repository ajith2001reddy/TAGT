type StatCardProps = {
    label: string;
    value: string | number;
    delta?: string;
    deltaType?: "up" | "down" | "neutral";
    icon?: React.ReactNode;
    accent?: string;
};

export function StatCard({ label, value, delta, deltaType = "neutral", icon, accent = "var(--accent-primary)" }: StatCardProps) {
    const deltaColor = deltaType === "up" ? "var(--green)" : deltaType === "down" ? "var(--red)" : "var(--text-tertiary)";

    return (
        <div className="stat-card animate-fade-up">
            {/* Top row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
                <span className="label-text">{label}</span>
                {icon && (
                    <div style={{
                        width: "34px", height: "34px", borderRadius: "10px",
                        background: `${accent}12`,
                        border: `1px solid ${accent}20`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        {icon}
                    </div>
                )}
            </div>

            {/* Value */}
            <div style={{
                fontFamily: "var(--font-display)",
                fontSize: "32px", fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1,
                color: "var(--text-primary)",
                marginBottom: "8px",
            }}>
                {value}
            </div>

            {/* Delta */}
            {delta && (
                <div style={{ fontSize: "12px", color: deltaColor, fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: "4px" }}>
                    {deltaType === "up" && "↑"}
                    {deltaType === "down" && "↓"}
                    {delta}
                </div>
            )}

            {/* Bottom accent bar */}
            <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                height: "2px",
                background: `linear-gradient(90deg, ${accent}40, transparent)`,
                borderRadius: "0 0 16px 16px",
            }} />
        </div>
    );
}