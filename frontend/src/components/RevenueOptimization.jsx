import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { optimizeRevenue } from "../services/analyticsService";

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
        } catch {
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const severityStyle = (level) => {
        if (level === "HIGH")
            return "bg-red-500/20 text-red-400 border-red-500/30";
        if (level === "MEDIUM")
            return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
        return "bg-green-500/20 text-green-400 border-green-500/30";
    };

    if (loading) {
        return (
            <div className="glass rounded-2xl p-6 h-64 animate-pulse" />
        );
    }

    if (!data) {
        return (
            <div className="glass rounded-2xl p-6 text-center text-gray-400">
                Revenue insights unavailable
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-2xl p-5 sm:p-6"
        >
            {/* HEADER */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">
                    Revenue Optimization Insights
                </h2>
                <p className="text-sm text-gray-400">
                    AI-powered recommendations to maximize revenue
                </p>
            </div>

            {/* METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-gray-400">Occupancy Rate</p>
                    <p className="text-2xl font-semibold text-white">
                        {data.metrics.occupancyRate}%
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-gray-400">Collection Rate</p>
                    <p className="text-2xl font-semibold text-white">
                        {data.metrics.collectionRate}%
                    </p>
                </div>

                <div className="bg-red-500/10 backdrop-blur-md rounded-xl p-4 border border-red-500/20">
                    <p className="text-sm text-gray-400">
                        Estimated Revenue Leak
                    </p>
                    <p className="text-2xl font-semibold text-red-400">
                        ${data.revenueLeakEstimate}
                    </p>
                </div>
            </div>

            {/* INSIGHTS */}
            <div className="space-y-4">
                {data.insights.map((insight, idx) => (
                    <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4
                                   bg-white/5 backdrop-blur-md border border-white/10
                                   rounded-xl p-4"
                    >
                        <div>
                            <p className="font-medium text-white">
                                {insight.message}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                {insight.recommendation}
                            </p>
                        </div>

                        <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${severityStyle(
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
