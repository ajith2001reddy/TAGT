import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { predictChurn } from "../services/analyticsService";

/* =====================================================
   CHURN RISK TABLE – MOBILE SAFE
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
            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 sm:p-6 animate-pulse h-48" />
        );
    }

    if (!data || !data.residents || data.residents.length === 0) {
        return (
            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 sm:p-6">
                <p className="text-gray-400 text-center">
                    No churn risk data available
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white/10 border border-white/10 rounded-2xl p-4 sm:p-6">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-semibold">
                        Resident Churn Risk
                    </h2>
                    <p className="text-sm text-gray-400">
                        Residents likely to leave soon
                    </p>
                </div>

                {/* SUMMARY */}
                <div className="flex gap-3 text-xs sm:text-sm">
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

            {/* ================= MOBILE VIEW ================= */}
            <div className="space-y-4 sm:hidden">
                {data.residents.map((r) => (
                    <div
                        key={r.residentId}
                        className="bg-black/40 border border-white/10 rounded-xl p-4"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-medium">
                                    {r.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {r.email}
                                </p>
                            </div>

                            <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${badgeColor(
                                    r.riskLevel
                                )}`}
                            >
                                {r.riskLevel}
                            </span>
                        </div>

                        <p className="text-sm text-gray-300 mb-1">
                            <strong>Score:</strong> {r.score}
                        </p>

                        <p className="text-sm text-gray-300 mb-1">
                            <strong>Reasons:</strong>{" "}
                            {r.reasons.length > 0
                                ? r.reasons.join(", ")
                                : "No major risk factors"}
                        </p>

                        <p className="text-sm text-gray-300">
                            <strong>Action:</strong>{" "}
                            {r.riskLevel === "HIGH"
                                ? "Immediate follow-up"
                                : r.riskLevel === "MEDIUM"
                                    ? "Check-in & support"
                                    : "No action needed"}
                        </p>
                    </div>
                ))}
            </div>

            {/* ================= DESKTOP TABLE ================= */}
            <div className="hidden sm:block overflow-x-auto">
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
        </div>
    );
}
