import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import DashboardLayout from "../layouts/DashboardLayout";
import Loader from "../components/Loader";
import { getResidents } from "../services/adminService";

export default function AdminResidents() {
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchResidents = async () => {
        try {
            setLoading(true);
            const data = await getResidents();
            setResidents(data);
        } catch (err) {
            toast.error("Failed to load residents");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResidents();
    }, []);

    return (
        <DashboardLayout>
            <h2 className="text-2xl font-bold mb-6">Residents</h2>

            {loading ? (
                <Loader />
            ) : residents.length === 0 ? (
                <p className="text-gray-500">No residents found</p>
            ) : (
                <div className="bg-white rounded-xl shadow overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3">Name</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Room</th>
                                <th className="p-3">Rent</th>
                            </tr>
                        </thead>
                        <tbody>
                            {residents.map((r) => (
                                <tr key={r._id} className="border-t">
                                    <td className="p-3">{r.name}</td>
                                    <td className="p-3">
                                        {r.userId?.email}
                                    </td>
                                    <td className="p-3">{r.roomNumber}</td>
                                    <td className="p-3">
                                        ${r.monthlyRent}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardLayout>
    );
}
