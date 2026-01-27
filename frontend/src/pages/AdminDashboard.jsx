import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";
import RequestTable from "../components/RequestTable";
import RequestsChart from "../components/RequestsChart";

import useAdminStats from "../hooks/useAdminStats";
import { getRequests, updateRequestStatus } from "../services/adminService";
import api from "../api/axios";

/**
 * AdminDashboard – Phase 3 (Revenue)
 * - Total Revenue
 * - Outstanding Balance
 * - Monthly Revenue Chart
 */

export default function AdminDashboard() {
    const { stats, loading } = useAdminStats();

    const [requests, setRequests] = useState([]);
    const [reqLoading, setReqLoading] = useState(true);

    /* ===== PHASE 3: PAYMENTS ===== */
    const [payments, setPayments] = useState([]);
    const [revenueLoading, setRevenueLoading] = useState(true);

    /* ================= FETCH REQUESTS ================= */
    const fetchRequests = useCallback(async () => {
        try {
            setReqLoading(true);
            const data = await getRequests();
            setRequests(Array.isArray(data) ? data : []);
        } catch {
            toast.error("Failed to load requests");
            setRequests([]);
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

    /* ================= REQUEST CHART ================= */
    const chartData = [
        {
            status: "pending",
            count: requests.filter((r) => r.status === "pending").length
        },
        {
            status: "in-progress",
            count: requests.filter((r) => r.status === "in-progress").length
        },
        {
            status: "resolved",
            count: requests.filter((r) => r.status === "resolved").length
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
            const month = new Date(p.createdAt).toLocaleString("default", {
                month: "short",
                year: "numeric"
            });

            acc[month] = (acc[month] || 0) + p.amount;
            return acc;
        }, {});

    const revenueChartData = Object.entries(monthlyRevenue).map(
        ([month, amount]) => ({
            month,
            amount
        })
    );

    /* ================= BULK RESOLVE ================= */
    const bulkResolve = async () => {
        const toResolve = requests.filter(
            (r) => r.status !== "resolved"
        );

        if (toResolve.length === 0) {
            toast("Nothing to resolve");
            return;
        }

        if (!window.confirm(`Resolve ${toResolve.length} request(s)?`)) {
            return;
        }

        try {
            for (const r of toResolve) {
                await updateRequestStatus(r._id, "resolved");
            }
            toast.success("Bulk resolve completed");
            fetchRequests();
        } catch {
            toast.error("Bulk action failed");
        }
    };

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

                {/* ================= REVENUE CHART ================= */}
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

                {/* ================= REQUESTS ================= */}
                <h3 className="text-xl font-semibold mt-8 mb-4">
                    Maintenance Requests
                </h3>

                {reqLoading ? (
                    <Loader />
                ) : requests.length === 0 ? (
                    <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
                        No maintenance requests yet.
                    </div>
                ) : (
                    <RequestTable
                        requests={requests}
                        refresh={fetchRequests}
                    />
                )}

                {/* ================= REQUESTS CHART ================= */}
                {!reqLoading && requests.length > 0 && (
                    <RequestsChart data={chartData} />
                )}

                {/* ================= ACTION ================= */}
                <div className="mt-6">
                    <button
                        onClick={bulkResolve}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Resolve All Requests
                    </button>
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
