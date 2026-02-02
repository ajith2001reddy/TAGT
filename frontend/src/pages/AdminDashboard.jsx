import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";
import RequestsChart from "../components/RequestsChart";

import useAdminStats from "../hooks/useAdminStats";
import { getRequests } from "../services/adminService";
import api from "../api/axios";

/**
 * ADMIN DASHBOARD (DARK THEME FIXED)
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
    const fetchPayments = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        fetchRequests();
        fetchPayments();
    }, [fetchRequests, fetchPayments]);


    /* ================= REQUEST STATUS METRICS ================= */
    const chartData = [
        {
            status: "Pending",
            count: allRequests.filter(
                (r) => r.status === "pending"
            ).length
        },
        {
            status: "In Progress",
            count: allRequests.filter(
                (r) => r.status === "in-progress"
            ).length
        },
        {
            status: "Resolved",
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

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-10"
            >
                {/* HEADER */}
                <div>
                    <h1 className="text-3xl font-bold">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Overview of operations, requests, and revenue
                    </p>
                </div>

                {/* METRICS */}
                {loading || revenueLoading ? (
                    <Loader />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Residents"
                            value={stats.totalResidents}
                            subtitle="Currently active"
                            accent="blue"
                        />

                        <StatCard
                            title="Pending Requests"
                            value={stats.pendingRequests}
                            subtitle="Needs attention"
                            accent="yellow"
                        />

                        <StatCard
                            title="Total Revenue"
                            value={`$${totalRevenue}`}
                            subtitle="Collected"
                            accent="green"
                        />

                        <StatCard
                            title="Outstanding Balance"
                            value={`$${outstandingBalance}`}
                            subtitle="Yet to be paid"
                            accent="red"
                        />
                    </div>
                )}

                {/* REQUESTS OVERVIEW */}
                {!reqLoading && chartData.some((d) => d.count > 0) && (
                    <div className="bg-white/10 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold mb-4">
                            Requests Overview
                        </h2>
                        <RequestsChart data={chartData} />
                    </div>
                )}

                {/* ACTIVE REQUESTS */}
                <div className="bg-white/10 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">
                            Active Maintenance Requests
                        </h2>

                        <Link
                            to="/admin/requests"
                            className="text-sm text-blue-400 hover:underline"
                        >
                            View all
                        </Link>
                    </div>

                    {reqLoading ? (
                        <Loader />
                    ) : activeRequests.length === 0 ? (
                        <p className="text-gray-400 text-center py-6">
                            No active requests 🎉
                        </p>
                    ) : (
                        <ul className="divide-y divide-white/10">
                            {activeRequests.map((r) => (
                                <li
                                    key={r._id}
                                    className="py-3 flex items-center justify-between"
                                >
                                    <p className="text-gray-200">
                                        {r.message}
                                    </p>
                                    <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-600/20 text-blue-400 capitalize">
                                        {r.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </motion.div>
        </DashboardLayout>
    );
}