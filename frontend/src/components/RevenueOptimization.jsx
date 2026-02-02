import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { optimizeRevenue } from "../services/analyticsService";

/* =====================================================
   REVENUE OPTIMIZATION (STEP 5)
   - AI-style revenue insights
   - Leak detection
   - Actionable recommendations
===================================================== */

export default function RevenueOptimization() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInsights();
    }, []);

    const loadInsights = async () => {
        try {
            setLoading(true);
            const res = await optimizeRevenue();
            setData(res);
        } catch (err) {
            console.error("REVENUE OPTIMIZATION ERROR", err);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const severityColor = (level) => {
        if (level === "HIGH") return "bg-red-600/20 text-red-400";
        if (level === "MEDIUM") return "bg-yellow-600/20 text-yellow-400";
        return "bg-green-600/20 text-green-400";
    };

    if (loading) {
        return (
            <div className="bg-white/10 border border-white/10 rounded-2xl p-6 h-56 animate-pulse" />
        );
    }

    if (!data) {
        return (
            <div className="bg-white/10 border border-white/10 rounded-2xl p-6">
                <p className="text-gray-400 text-center">
                    Revenue insights unavailable
                </p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 border border-white/10 rounded-2xl p-6"
        >
            {/* HEADER */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold">
                    Revenue Optimization Insights
                </h2>
                <p className="text-sm text-gray-400">
                    AI-powered recommendations to maximize revenue
                </p>
            </div>

            {/* METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-400">
                        Occupancy Rate
                    </p>
                    <p className="text-xl font-bold">
                        {data.metrics.occupancyRate}%
                    </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-400">
                        Collection Rate
                    </p>
                    <p className="text-xl font-bold">
                        {data.metrics.collectionRate}%
                    </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-400">
                        Estimated Revenue Leak
                    </p>
                    <p className="text-xl font-bold text-red-400">
                        ${data.revenueLeakEstimate}
                    </p>
                </div>
            </div>

            {/* INSIGHTS */}
            <div className="space-y-4">
                {data.insights.map((insight, idx) => (
                    <div
                        key={idx}
                        className="flex items-start justify-between gap-4 bg-white/5 p-4 rounded-xl"
                    >
                        <div>
                            <p className="font-medium">
                                {insight.message}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                {insight.recommendation}
                            </p>
                        </div>

                        <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${severityColor(
                                insight.severity
                            )}`}
                        >
                            {insight.severity}
                        </span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
