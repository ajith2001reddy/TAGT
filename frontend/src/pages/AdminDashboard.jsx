import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";
import RequestsChart from "../components/RequestsChart";

import useAdminStats from "../hooks/useAdminStats";
import { getRequests } from "../services/adminService";
import api from "../api/axios";

/**
 * AdminDashboard – Phase 4 FINAL
 * - Active requests preview
 * - Full requests chart restored
 * - Clean separation of concerns
 */

export default function AdminDashboard() {
    const { stats, loading } = useAdminStats();

    const [allRequests, setAllRequests] = useState([]);
    const [activeRequests, setActiveRequests] = useState([]);
    const [reqLoading, setReqLoading] = useState(true);

    const [payments, setPayments] = useState([]);
    const [revenueLoading, setRevenueLoading] = useState(true);

    /* ================= FETCH REQUESTS ================= */
    const fetchRequests = useCallback(async () => {
        try {
            setReqLoading(true);
            const data = await getRequests();
            const safeData = Array.isArray(data) ? data : [];

            setAllRequests(safeData);

            const active = safeData.filter(
                (r) =>
                    r.status !== "resolved" &&
                    r.workflowStatus !== "Done"
            );

            setActiveRequests(active.slice(0, 5));
        } catch {
            toast.error("Failed to load requests");
            setAllRequests([]);
            setActiveRequests([]);
        } finally {
            setReqLoading(false);
        }
    }, []);

    /* ================= FETCH PAYMENTS ================= */
    const fetchPayments = async () => {
        try {
            setRevenueLoading(true);
            const res = await api.get("/payments");
            setPayments(Array.isArray(res.data) ? res.data : []);
        } catch {
            toast.error("Failed to load revenue data");
            setPayments([]);
        } finally {
            setRevenueLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        fetchPayments();
    }, [fetchRequests]);

    /* ================= REQUESTS CHART (ALL DATA) ================= */
    const chartData = [
        {
            status: "pending",
            count: allRequests.filter(
                (r) => r.status === "pending"
            ).length
        },
        {
            status: "in-progress",
            count: allRequests.filter(
                (r) => r.status === "in-progress"
            ).length
        },
        {
            status: "resolved",
            count: allRequests.filter(
                (r) => r.status === "resolved"
            ).length
        }
    ];

    /* ================= REVENUE METRICS ================= */
    const totalRevenue = payments
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + p.amount, 0);

    const outstandingBalance = payments
        .filter((p) => p.status === "unpaid")
        .reduce((sum, p) => sum + p.amount, 0);

    /* ================= MONTHLY REVENUE ================= */
    const monthlyRevenue = payments
        .filter((p) => p.status === "paid")
        .reduce((acc, p) => {
            const month = new Date(p.createdAt).toLocaleString(
                "default",
                { month: "short", year: "numeric" }
            );
            acc[month] = (acc[month] || 0) + p.amount;
            return acc;
        }, {});

    const revenueChartData = Object.entries(monthlyRevenue).map(
        ([month, amount]) => ({ month, amount })
    );

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    Admin Dashboard
                </h2>

                {/* ================= STATS ================= */}
                {loading || revenueLoading ? (
                    <Loader />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Residents"
                            value={stats.totalResidents}
                        />
                        <StatCard
                            title="Pending Requests"
                            value={stats.pendingRequests}
                        />
                        <StatCard
                            title="Total Revenue"
                            value={`$${totalRevenue}`}
                        />
                        <StatCard
                            title="Outstanding Balance"
                            value={`$${outstandingBalance}`}
                        />
                    </div>
                )}

                {/* ================= REVENUE SUMMARY ================= */}
                {revenueChartData.length > 0 && (
                    <div className="bg-white rounded-xl shadow p-6 mt-8">
                        <h3 className="text-lg font-semibold mb-4">
                            Monthly Revenue
                        </h3>

                        <div className="space-y-2">
                            {revenueChartData.map((r) => (
                                <div
                                    key={r.month}
                                    className="flex justify-between border-b pb-1"
                                >
                                    <span>{r.month}</span>
                                    <span className="font-semibold">
                                        ${r.amount}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ================= ACTIVE REQUESTS PREVIEW ================= */}
                <h3 className="text-xl font-semibold mt-8 mb-4">
                    Active Maintenance Requests
                </h3>

                {reqLoading ? (
                    <Loader />
                ) : activeRequests.length === 0 ? (
                    <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
                        No active requests 🎉
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow p-4">
                        <ul className="space-y-3">
                            {activeRequests.map((r) => (
                                <li
                                    key={r._id}
                                    className="flex justify-between items-center border-b pb-2"
                                >
                                    <span>{r.message}</span>
                                    <span className="text-sm capitalize font-medium text-blue-600">
                                        {r.status}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <div className="text-right mt-4">
                            <a
                                href="/admin/requests"
                                className="text-blue-600 hover:underline"
                            >
                                View all requests →
                            </a>
                        </div>
                    </div>
                )}

                {/* ================= REQUESTS CHART ================= */}
                {!reqLoading && chartData.some((d) => d.count > 0) && (
                    <RequestsChart data={chartData} />
                )}
            </motion.div>
        </DashboardLayout>
    );
}
