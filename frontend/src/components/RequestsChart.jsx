import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";

export default function RequestsChart({ data = [] }) {
    return (
        <div className="bg-white/10 border border-white/10 rounded-2xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4">
                Requests by Status
            </h3>

            {/* Responsive height */}
            <div className="w-full h-[220px] sm:h-[300px]">
                <ResponsiveContainer>
                    <BarChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 10,
                            left: -10,
                            bottom: 10
                        }}
                    >
                        <XAxis
                            dataKey="status"
                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            allowDecimals={false}
                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: "rgba(255,255,255,0.05)" }}
                            contentStyle={{
                                backgroundColor: "#020617",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "8px",
                                color: "#e5e7eb",
                                fontSize: "12px"
                            }}
                        />
                        <Bar
                            dataKey="count"
                            fill="#2563eb"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={40}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
