"use client";

import React, { useEffect, useState } from "react";
import { fetchPendingVerifications, updateVerificationStatus, PendingVerification } from "../../../lib/api/adminVerificationsApi";
import { CheckCircle, XCircle, ShieldAlert } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminVerificationsPage() {
    const [pending, setPending] = useState<PendingVerification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadVerifications();
    }, []);

    const loadVerifications = async () => {
        setLoading(true);
        try {
            const data = await fetchPendingVerifications();
            setPending(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load pending verifications");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: "approved" | "rejected") => {
        try {
            await updateVerificationStatus(id, action);
            toast.success(`Verification ${action} successfully`);
            setPending((prev) => prev.filter((v) => v._id !== id));
        } catch (error) {
            toast.error(`Failed to ${action} verification. Please try again.`);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading verifications...</div>;
    }

    if (pending.length === 0) {
        return (
            <div className="p-8">
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <ShieldAlert className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-medium text-gray-900">No Pending Verifications</h2>
                    <p className="text-gray-500 mt-2">All users have been reviewed.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pending Identity Verifications</h1>
                    <p className="text-gray-500 text-sm mt-1">Review user uploaded documents to approve or deny access to the platform.</p>
                </div>
                <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-medium text-sm">
                    {pending.length} Pending
                </div>
            </div>

            <div className="grid gap-6">
                {pending.map((user) => (
                    <div key={user._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                                <p className="text-sm text-gray-500">{user.email} &bull; <span className="capitalize">{user.role}</span></p>
                            </div>
                            <div className="flex gap-4 items-center">
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${user.verification.fraudRisk === "high" ? "bg-red-100 text-red-700" :
                                        user.verification.fraudRisk === "medium" ? "bg-yellow-100 text-yellow-700" :
                                            "bg-green-100 text-green-700"
                                    }`}>
                                    Risk: {user.verification.fraudRisk.toUpperCase()}
                                </div>
                                <div className="text-sm font-medium text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
                                    AI Score: {user.verification.aiScore}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="col-span-1 space-y-2">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Selfie</p>
                                <img src={user.verification.selfiePhoto} alt="Selfie" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
                            </div>

                            <div className="col-span-1 space-y-2">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">ID Front</p>
                                <img src={user.verification.idFront} alt="ID Front" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
                            </div>

                            <div className="col-span-1 space-y-2">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">ID Back</p>
                                <img src={user.verification.idBack} alt="ID Back" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
                            </div>

                            {user.role === "owner" && user.verification.propertyDocument && (
                                <div className="col-span-1 space-y-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Property Proof</p>
                                    {user.verification.propertyDocument.endsWith(".pdf") ? (
                                        <a href={user.verification.propertyDocument} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full h-48 bg-gray-100 rounded-lg border border-gray-200 hover:bg-gray-200 transition-colors">
                                            View PDF
                                        </a>
                                    ) : (
                                        <img src={user.verification.propertyDocument} alt="Property Doc" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex gap-4 justify-end border-t border-gray-200">
                            <button
                                onClick={() => handleAction(user._id, "rejected")}
                                className="px-6 py-2 bg-white border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 flex items-center gap-2 transition-colors"
                            >
                                <XCircle className="w-5 h-5" /> Reject
                            </button>
                            <button
                                onClick={() => handleAction(user._id, "approved")}
                                className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors shadow-md shadow-green-500/20"
                            >
                                <CheckCircle className="w-5 h-5" /> Approve
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
