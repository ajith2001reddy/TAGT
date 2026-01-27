import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";
import RequestTable from "../components/RequestTable";
import RequestsChart from "../components/RequestsChart";

import useAdminStats from "../hooks/useAdminStats";
import { getRequests, updateRequestStatus } from "../services/adminService";

export default function AdminDashboard() {
    const { stats, loading } = useAdminStats();

    const [requests, setRequests] = useState([]);
    const [reqLoading, setReqLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");

    const fetchRequests = async () => {
        setReqLoading(true);
        const data = await getRequests();
        setRequests(data);
        setReqLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // ---- FILTER + SORT ----
    const filteredRequests = requests
        .filter((r) =>
            statusFilter === "all" ? true : r.status === statusFilter
        )
        .filter((r) =>
            r.message.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) =>
            sortOrder === "newest"
                ? new Date(b.createdAt) - new Date(a.createdAt)
                : new Date(a.createdAt) - new Date(b.createdAt)
        );

    // ---- CHART DATA ----
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

    // ---- EXPORT CSV ----
    const exportCSV = () => {
        if (filteredRequests.length === 0) {
            toast.error("No data to export");
            return;
        }

        const header = ["Message", "Status", "Created At"];
        const rows = filteredRequests.map((r) => [
            `"${r.message.replace(/"/g, '""')}"`,
            r.status,
            new Date(r.createdAt).toLocaleString()
        ]);

        const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "maintenance_requests.csv";
        link.click();
        URL.revokeObjectURL(url);

        toast.success("CSV exported");
    };

    // ---- BULK RESOLVE ----
    const bulkResolve = async () => {
        const toResolve = filteredRequests.filter(
            (r) => r.status !== "resolved"
        );

        if (toResolve.length === 0) {
            toast("Nothing to resolve");
            return;
        }

        if (
            !window.confirm(
                `Resolve ${toResolve.length} request(s)?`
            )
        ) {
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

                {/* STATS */}
                {loading ? (
                    <Loader />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            title="Total Residents"
                            value={stats.totalResidents}
                        />
                        <StatCard
                            title="Pending Requests"
                            value={stats.pendingRequests}
                        />
                        <StatCard
                            title="Unpaid Payments"
                            value={stats.unpaidPayments}
                        />
                    </div>
                )}
                <div className="mt-6">
                    <button
                        onClick={() => (window.location.href = "/admin/residents")}
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Manage Residents
                    </button>
                </div>

                {/* FILTERS */}
                <div className="bg-white rounded-xl shadow p-4 mt-8 flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Search requests..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border rounded px-3 py-2 w-full md:w-1/3"
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border rounded px-3 py-2 w-full md:w-1/4"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                    </select>

                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="border rounded px-3 py-2 w-full md:w-1/4"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>

                {/* ACTION BAR */}
                <div className="flex flex-wrap gap-3 mt-4">
                    <button
                        onClick={exportCSV}
                        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
                    >
                        Export CSV
                    </button>

                    <button
                        onClick={bulkResolve}
                        disabled={
                            filteredRequests.filter(
                                (r) => r.status !== "resolved"
                            ).length === 0
                        }
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Resolve All Filtered
                    </button>
                </div>

                {/* REQUESTS */}
                <h3 className="text-xl font-semibold mt-8 mb-4">
                    Maintenance Requests
                </h3>

                {reqLoading ? (
                    <Loader />
                ) : filteredRequests.length === 0 ? (
                    <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
                        No maintenance requests yet.
                    </div>
                ) : (
                    <RequestTable
                        requests={filteredRequests}
                        refresh={fetchRequests}
                    />
                )}

                {/* CHART */}
                {!reqLoading && requests.length > 0 && (
                    <RequestsChart data={chartData} />
                )}
            </motion.div>
        </DashboardLayout>
    );
}
