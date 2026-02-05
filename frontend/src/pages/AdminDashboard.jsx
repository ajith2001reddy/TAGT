import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import StatCard from "../components/StatCard";
import Loader from "../components/Loader";
import RequestsChart from "../components/RequestsChart";
import KpiCards from "../components/KpiCards";
import OccupancyForecast from "../components/OccupancyForecast";
import MaintenanceCostForecast from "../components/MaintenanceCostForecast";
import ChurnRiskTable from "../components/ChurnRiskTable";

import { getRequests } from "../services/adminService";
import api from "../api/axios";

export default function AdminDashboard() {
    const [kpis, setKpis] = useState(null);
    const [loading, setLoading] = useState(true);

    const [allRequests, setAllRequests] = useState([]);
    const [activeRequests, setActiveRequests] = useState([]);
    const [reqLoading, setReqLoading] = useState(true);

    /* ================= FETCH KPIs ================= */
    const fetchKPIs = async () => {
        try {
            setLoading(true);

            // ✅ REAL analytics endpoint
            const res = await api.get("/analytics/kpis");

            setKpis(res.data?.data || null);
        } catch {
            toast.error("Failed to load analytics");
        } finally {
            setLoading(false);
        }
    };

    /* ================= FETCH REQUESTS ================= */
    const fetchRequests = async () => {
        try {
            setReqLoading(true);

            const data = await getRequests();
            const safeData = Array.isArray(data) ? data : [];

            setAllRequests(safeData);

            // ✅ correct active status logic
            const active = safeData.filter((r) => r.status !== "done");
            setActiveRequests(active.slice(0, 5));
        } catch {
            toast.error("Failed to load requests");
            setAllRequests([]);
            setActiveRequests([]);
        } finally {
            setReqLoading(false);
        }
    };

    useEffect(() => {
        fetchKPIs();
        fetchRequests();
    }, []);

    /* ================= REQUEST CHART DATA ================= */
    const chartData = [
        { status: "Pending", count: allRequests.filter((r) => r.status === "pending").length },
        { status: "In Progress", count: allRequests.filter((r) => r.status === "in-progress").length },
        { status: "Resolved", count: allRequests.filter((r) => r.status === "done").length },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-10"
        >
            {/* HEADER */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-gray-400 mt-1">
                    AI-powered analytics & operational insights
                </p>
            </div>

            {/* AI ANALYTICS */}
            <div className="space-y-8">
                <KpiCards kpis={kpis} loading={loading} />
                <OccupancyForecast />
                <MaintenanceCostForecast />
                <ChurnRiskTable />
            </div>

            {/* CORE METRICS */}
            {loading ? (
                <Loader />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <StatCard
                        title="Occupancy Rate"
                        value={`${kpis?.occupancy?.rate || 0}%`}
                        accent="blue"
                    />
                    <StatCard
                        title="Total Revenue"
                        value={`$${kpis?.payments?.totalCollected || 0}`}
                        accent="green"
                    />
                    <StatCard
                        title="Outstanding Balance"
                        value={`$${(kpis?.payments?.totalBilled || 0) - (kpis?.payments?.totalCollected || 0)}`}
                        accent="red"
                    />
                    <StatCard
                        title="Resolved Requests"
                        value={kpis?.maintenance?.resolvedCount || 0}
                        accent="yellow"
                    />
                </div>
            )}

            {/* REQUESTS OVERVIEW */}
            {!reqLoading && chartData.some((d) => d.count > 0) && (
                <div className="glass rounded-2xl p-4 sm:p-6">
                    <RequestsChart data={chartData} />
                </div>
            )}

            {/* ACTIVE REQUESTS */}
            <div className="glass rounded-2xl p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Active Maintenance Requests</h2>
                    <Link to="/admin/requests" className="text-sm text-blue-400">
                        View all
                    </Link>
                </div>

                {reqLoading ? (
                    <Loader />
                ) : activeRequests.length === 0 ? (
                    <p className="text-gray-400 text-center">No active requests 🎉</p>
                ) : (
                    <ul className="divide-y divide-white/10">
                        {activeRequests.map((r) => (
                            <li key={r._id} className="py-3 flex justify-between">
                                <p>{r.description}</p>
                                <span className="text-xs px-2 py-1 rounded bg-blue-600/20 text-blue-400">
                                    {r.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </motion.div>
    );
}
