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

/* =====================================================
   MAINTENANCE COST FORECAST (STEP 3)
===================================================== */

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
        } catch (err) {
            console.error("MAINTENANCE FORECAST ERROR", err);
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 border border-white/10 rounded-2xl p-6"
        >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold">
                        Maintenance Cost Forecast
                    </h2>
                    <p className="text-sm text-gray-400">
                        Estimated maintenance expenses
                    </p>
                </div>

                {/* RANGE SELECTOR */}
                <div className="flex gap-2">
                    {[3, 6, 12].map((m) => (
                        <button
                            key={m}
                            onClick={() => setMonths(m)}
                            className={`px-3 py-1 rounded text-sm ${months === m
                                    ? "bg-amber-600 text-white"
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
                <div className="mb-4 text-sm text-gray-400 flex gap-6 flex-wrap">
                    <span>
                        Avg Trend:{" "}
                        <strong className="text-gray-200">
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
                <div className="h-64 animate-pulse bg-white/5 rounded-xl" />
            ) : data.length === 0 ? (
                <p className="text-gray-400 text-center py-10">
                    Not enough data to generate forecast
                </p>
            ) : (
                <div className="w-full min-h-[260px] h-[260px]">
                    <ResponsiveContainer>
                        <LineChart data={data}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#334155"
                            />
                            <XAxis
                                dataKey="month"
                                stroke="#94a3b8"
                            />
                            <YAxis
                                stroke="#94a3b8"
                                tickFormatter={(v) => `$${v}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: "#020617",
                                    border: "1px solid #334155",
                                    borderRadius: "8px"
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
