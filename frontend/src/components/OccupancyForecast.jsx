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
   OCCUPANCY FORECAST – MOBILE SAFE
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
                    occupancy: h.occupancyRate
                })) || [];

            const forecast =
                res?.forecast?.map((f) => ({
                    month: f.month,
                    occupancy: f.predictedOccupancy
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
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white/10 border border-white/10 rounded-2xl p-4 sm:p-6"
        >
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
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
                            className={`
                                px-3 py-2 rounded-lg text-sm
                                min-h-[40px]
                                ${months === m
                                    ? "bg-blue-600 text-white"
                                    : "bg-white/10 text-gray-300 hover:bg-white/20"}
                            `}
                        >
                            {m}M
                        </button>
                    ))}
                </div>
            </div>

            {/* CHART */}
            {loading ? (
                <div className="h-48 sm:h-64 animate-pulse bg-white/5 rounded-xl" />
            ) : data.length === 0 ? (
                <p className="text-gray-400 text-center py-10">
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
                                stroke="#334155"
                            />
                            <XAxis
                                dataKey="month"
                                stroke="#94a3b8"
                                tick={{ fontSize: 11 }}
                                angle={-30}
                                textAnchor="end"
                                height={50}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                domain={[0, 100]}
                                tickFormatter={(v) => `${v}%`}
                                tick={{ fontSize: 11 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: "#020617",
                                    border: "1px solid #334155",
                                    borderRadius: "8px",
                                    fontSize: "12px"
                                }}
                                formatter={(v) => [`${v}%`, "Occupancy"]}
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
