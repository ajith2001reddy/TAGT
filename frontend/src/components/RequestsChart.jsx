import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";
import { motion } from "framer-motion";

export default function RequestsChart({ data = [] }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-2xl p-4 sm:p-6"
        >
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4">
                Requests by Status
            </h3>

            <div className="w-full h-[220px] sm:h-[300px]">
                <ResponsiveContainer>
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -10, bottom: 10 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.08)"
                        />
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
                                background: "rgba(0,0,0,0.85)",
                                backdropFilter: "blur(12px)",
                                border: "1px solid rgba(255,255,255,0.15)",
                                borderRadius: "12px",
                                color: "#fff",
                                fontSize: "12px"
                            }}
                        />
                        <Bar
                            dataKey="count"
                            fill="url(#barGradient)"
                            radius={[8, 8, 0, 0]}
                            maxBarSize={44}
                        />
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#60a5fa" />
                                <stop offset="100%" stopColor="#2563eb" />
                            </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
