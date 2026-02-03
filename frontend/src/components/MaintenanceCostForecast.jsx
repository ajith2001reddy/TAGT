import { useEffect, useState, useCallback } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";
import { motion } from "framer-motion";
import { predictMaintenanceCost } from "../services/analyticsService";

export default function MaintenanceCostForecast() {
    const [months, setMonths] = useState(6);
    const [data, setData] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadForecast = useCallback(async () => {
        try {
            setLoading(true);
            const res = await predictMaintenanceCost(months);

            const history =
                res?.history?.map((h) => ({
                    month: h.month,
                    cost: h.cost
                })) || [];

            const forecast =
                res?.forecast?.map((f) => ({
                    month: f.month,
                    cost: f.predictedCost
                })) || [];

            setMeta(res?.meta || null);
            setData([...history, ...forecast]);
        } catch {
            setData([]);
            setMeta(null);
        } finally {
            setLoading(false);
        }
    }, [months]);

    useEffect(() => {
        loadForecast();
    }, [loadForecast]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-2xl p-4 sm:p-6"
        >
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-white">
                        Maintenance Cost Forecast
                    </h2>
                    <p className="text-sm text-gray-400">
                        Estimated maintenance expenses
                    </p>
                </div>

                <div className="flex gap-2">
                    {[3, 6, 12].map((m) => (
                        <button
                            key={m}
                            onClick={() => setMonths(m)}
                            className={`px-3 py-2 rounded-xl text-sm font-medium transition
                                ${months === m
                                    ? "bg-amber-500/90 text-black shadow-lg shadow-amber-500/30"
                                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                                }`}
                        >
                            {m}M
                        </button>
                    ))}
                </div>
            </div>

            {/* META */}
            {meta && (
                <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm text-gray-400">
                    <span>
                        Avg Trend:{" "}
                        <strong className="text-white">
                            ${meta.trend}/month
                        </strong>
                    </span>
                    <span>
                        Spike Risk:{" "}
                        <strong
                            className={
                                meta.spikeRisk === "HIGH"
                                    ? "text-red-400"
                                    : meta.spikeRisk === "MEDIUM"
                                        ? "text-yellow-400"
                                        : "text-green-400"
                            }
                        >
                            {meta.spikeRisk}
                        </strong>
                    </span>
                </div>
            )}

            {/* CHART */}
            {loading ? (
                <div className="h-56 rounded-xl bg-white/5 animate-pulse" />
            ) : data.length === 0 ? (
                <p className="text-gray-400 text-center py-12">
                    Not enough data to generate forecast
                </p>
            ) : (
                <div className="w-full h-[220px] sm:h-[260px]">
                    <ResponsiveContainer>
                        <LineChart
                            data={data}
                            margin={{ top: 10, right: 10, left: -10, bottom: 10 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.08)"
                            />
                            <XAxis
                                dataKey="month"
                                stroke="#9ca3af"
                                tick={{ fontSize: 11 }}
                                angle={-30}
                                textAnchor="end"
                                height={50}
                            />
                            <YAxis
                                stroke="#9ca3af"
                                tick={{ fontSize: 11 }}
                                tickFormatter={(v) => `$${v}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: "rgba(0,0,0,0.85)",
                                    backdropFilter: "blur(12px)",
                                    border: "1px solid rgba(255,255,255,0.15)",
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                    color: "#fff"
                                }}
                                formatter={(v) => [`$${v}`, "Cost"]}
                            />
                            <Line
                                type="monotone"
                                dataKey="cost"
                                stroke="#fbbf24"
                                strokeWidth={3}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </motion.div>
    );
}
