import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";
import RequestTable from "../components/RequestTable";
import useAdminStats from "../hooks/useAdminStats";
import { getRequests } from "../services/adminService";
import RequestsChart from "../components/RequestsChart";


export default function AdminDashboard() {
    const { stats, loading } = useAdminStats();
    const [requests, setRequests] = useState([]);
    const [reqLoading, setReqLoading] = useState(true);
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
    {
        !reqLoading && requests.length > 0 && (
            <RequestsChart data={chartData} />
        )
    }



    const fetchRequests = async () => {
        setReqLoading(true);
        const data = await getRequests();
        setRequests(data);
        setReqLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

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

                <h3 className="text-xl font-semibold mt-10 mb-4">
                    Maintenance Requests
                </h3>

                {reqLoading ? (
                    <Loader />
                ) : (
                    <RequestTable
                        requests={requests}
                        refresh={fetchRequests}
                    />
                )}
            </motion.div>
        </DashboardLayout>
    );
}
