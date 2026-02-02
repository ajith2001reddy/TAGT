import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { predictChurn } from "../services/analyticsService";

/* =====================================================
   CHURN RISK TABLE (STEP 4)
   - Resident churn prediction
   - Risk levels with reasons
   - Actionable insights
===================================================== */

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
        } catch (err) {
            console.error("CHURN LOAD ERROR", err);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const badgeColor = (risk) => {
        if (risk === "HIGH") return "bg-red-600/20 text-red-400";
        if (risk === "MEDIUM") return "bg-yellow-600/20 text-yellow-400";
        return "bg-green-600/20 text-green-400";
    };

    if (loading) {
        return (
            <div className="bg-white/10 border border-white/10 rounded-2xl p-6 animate-pulse h-64" />
        );
    }

    if (!data || !data.residents || data.residents.length === 0) {
        return (
            <div className="bg-white/10 border border-white/10 rounded-2xl p-6">
                <p className="text-gray-400 text-center">
                    No churn risk data available
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
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold">
                        Resident Churn Risk
                    </h2>
                    <p className="text-sm text-gray-400">
                        Residents likely to leave soon
                    </p>
                </div>

                {/* SUMMARY */}
                <div className="flex gap-4 text-sm">
                    <span className="text-red-400">
                        High: {data.highRisk}
                    </span>
                    <span className="text-yellow-400">
                        Medium: {data.mediumRisk}
                    </span>
                    <span className="text-green-400">
                        Low: {data.lowRisk}
                    </span>
                </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="text-gray-400 border-b border-white/10">
                        <tr>
                            <th className="text-left py-2">
                                Resident
                            </th>
                            <th className="text-center py-2">
                                Score
                            </th>
                            <th className="text-center py-2">
                                Risk
                            </th>
                            <th className="text-left py-2">
                                Reasons
                            </th>
                            <th className="text-left py-2">
                                Suggested Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {data.residents.map((r) => (
                            <tr key={r.residentId}>
                                <td className="py-3">
                                    <div className="font-medium">
                                        {r.name}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {r.email}
                                    </div>
                                </td>

                                <td className="text-center font-semibold">
                                    {r.score}
                                </td>

                                <td className="text-center">
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-semibold ${badgeColor(
                                            r.riskLevel
                                        )}`}
                                    >
                                        {r.riskLevel}
                                    </span>
                                </td>

                                <td className="py-3 text-gray-300">
                                    {r.reasons.length > 0
                                        ? r.reasons.join(", ")
                                        : "No major risk factors"}
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
