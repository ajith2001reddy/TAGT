import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { predictChurn } from "../services/analyticsService";

export default function ChurnRiskTable() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadChurn();
    }, []);

    const loadChurn = async () => {
        try {
            setLoading(true);
            const res = await predictChurn();
            setData(res);
        } catch {
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const badgeColor = (risk) => {
        if (risk === "HIGH") return "bg-red-500/20 text-red-400 border-red-500/30";
        if (risk === "MEDIUM") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
        return "bg-green-500/20 text-green-400 border-green-500/30";
    };

    if (loading) {
        return (
            <div className="glass rounded-2xl p-6 animate-pulse h-56" />
        );
    }

    if (!data || !data.residents?.length) {
        return (
            <div className="glass rounded-2xl p-6 text-center text-gray-400">
                No churn risk data available
            </div>
        );
    }

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
                        Resident Churn Risk
                    </h2>
                    <p className="text-sm text-gray-400">
                        Residents likely to leave soon
                    </p>
                </div>

                <div className="flex gap-4 text-xs sm:text-sm">
                    <span className="text-red-400">High: {data.highRisk}</span>
                    <span className="text-yellow-400">Medium: {data.mediumRisk}</span>
                    <span className="text-green-400">Low: {data.lowRisk}</span>
                </div>
            </div>

            {/* MOBILE */}
            <div className="space-y-4 sm:hidden">
                {data.residents.map((r) => (
                    <div
                        key={r.residentId}
                        className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-medium text-white">{r.name}</p>
                                <p className="text-xs text-gray-400">{r.email}</p>
                            </div>
                            <span
                                className={`px-2 py-1 rounded-lg text-xs font-semibold border ${badgeColor(
                                    r.riskLevel
                                )}`}
                            >
                                {r.riskLevel}
                            </span>
                        </div>

                        <p className="text-sm text-gray-300">
                            <b>Score:</b> {r.score}
                        </p>
                        <p className="text-sm text-gray-300">
                            <b>Reasons:</b>{" "}
                            {r.reasons.length ? r.reasons.join(", ") : "None"}
                        </p>
                        <p className="text-sm text-gray-300">
                            <b>Action:</b>{" "}
                            {r.riskLevel === "HIGH"
                                ? "Immediate follow-up"
                                : r.riskLevel === "MEDIUM"
                                    ? "Check-in & support"
                                    : "No action needed"}
                        </p>
                    </div>
                ))}
            </div>

            {/* DESKTOP */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="text-gray-400 border-b border-white/10">
                        <tr>
                            <th className="text-left py-2">Resident</th>
                            <th className="text-center py-2">Score</th>
                            <th className="text-center py-2">Risk</th>
                            <th className="text-left py-2">Reasons</th>
                            <th className="text-left py-2">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {data.residents.map((r) => (
                            <tr key={r.residentId}>
                                <td className="py-3">
                                    <div className="font-medium text-white">
                                        {r.name}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {r.email}
                                    </div>
                                </td>
                                <td className="text-center font-semibold text-white">
                                    {r.score}
                                </td>
                                <td className="text-center">
                                    <span
                                        className={`px-2 py-1 rounded-lg text-xs font-semibold border ${badgeColor(
                                            r.riskLevel
                                        )}`}
                                    >
                                        {r.riskLevel}
                                    </span>
                                </td>
                                <td className="py-3 text-gray-300">
                                    {r.reasons.length ? r.reasons.join(", ") : "None"}
                                </td>
                                <td className="py-3 text-gray-300">
                                    {r.riskLevel === "HIGH"
                                        ? "Immediate follow-up"
                                        : r.riskLevel === "MEDIUM"
                                            ? "Check-in & support"
                                            : "No action needed"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
