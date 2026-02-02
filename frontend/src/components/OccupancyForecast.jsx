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
import { predictOccupancy } from "../services/analyticsService";

/* =====================================================
   OCCUPANCY FORECAST (STEP 2)
   - History + Prediction
   - 3 / 6 / 12 month toggle
===================================================== */

export default function OccupancyForecast() {
    const [months, setMonths] = useState(6);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadForecast = useCallback(async () => {
        try {
            setLoading(true);
            const res = await predictOccupancy(months);

            const history =
                res?.history?.map((h) => ({
                    month: h.month,
                    occupancy: h.occupancyRate,
                    type: "History"
                })) || [];

            const forecast =
                res?.forecast?.map((f) => ({
                    month: f.month,
                    occupancy: f.predictedOccupancy,
                    type: "Forecast"
                })) || [];

            setData([...history, ...forecast]);
        } catch (err) {
            console.error("OCCUPANCY FORECAST ERROR", err);
            setData([]);
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
                        Occupancy Forecast
                    </h2>
                    <p className="text-sm text-gray-400">
                        Predicted occupancy for upcoming months
                    </p>
                </div>

                {/* RANGE SELECTOR */}
                <div className="flex gap-2">
                    {[3, 6, 12].map((m) => (
                        <button
                            key={m}
                            onClick={() => setMonths(m)}
                            className={`px-3 py-1 rounded text-sm ${months === m
                                    ? "bg-blue-600 text-white"
                                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                                }`}
                        >
                            {m}M
                        </button>
                    ))}
                </div>
            </div>

            {/* CHART */}
            {loading ? (
                <div className="h-64 animate-pulse bg-white/5 rounded-xl" />
            ) : data.length === 0 ? (
                <p className="text-gray-400 text-center py-10">
                    Not enough data to generate forecast
                </p>
            ) : (
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="month" stroke="#94a3b8" />
                            <YAxis
                                stroke="#94a3b8"
                                domain={[0, 100]}
                                tickFormatter={(v) => `${v}%`}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: "#020617",
                                    border: "1px solid #334155",
                                    borderRadius: "8px"
                                }}
                                formatter={(value) => [`${value}%`, "Occupancy"]}
                            />
                            <Line
                                type="monotone"
                                dataKey="occupancy"
                                stroke="#38bdf8"
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
