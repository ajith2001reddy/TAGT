"use client";

import React, { useState } from "react";
import FileUploader from "../../components/ui/FileUploader";
import { useRouter } from "next/navigation";
import { submitVerificationDocuments } from "../../lib/api/uploadApi";
import { useAuth } from "../../context/AuthContext";
import { ShieldAlert, ShieldCheck, UploadCloud, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";

export default function VerificationPage() {
    const { dbUser } = useAuth();
    const router = useRouter();

    const [selfie, setSelfie] = useState<File | null>(null);
    const [idFront, setIdFront] = useState<File | null>(null);
    const [idBack, setIdBack] = useState<File | null>(null);
    const [propertyDoc, setPropertyDoc] = useState<File | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const isOwner = dbUser?.role === "owner";

    // Check if user is already verified
    const verificationStatus = dbUser?.verification?.status;

    if (verificationStatus === "approved") {
        return (
            <div className="max-w-2xl mx-auto p-6 md:p-12 mt-12 mb-12 bg-white rounded-2xl shadow-sm border border-green-200">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Identity Verified</h1>
                    <p className="text-gray-600">
                        Thank you! Your identity has been successfully verified by our team. You have full access to the platform.
                    </p>
                </div>
            </div>
        );
    }

    if (verificationStatus === "pending") {
        return (
            <div className="max-w-2xl mx-auto p-6 md:p-12 mt-12 mb-12 bg-white rounded-2xl shadow-sm border border-yellow-200">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                        <ShieldAlert className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Verification Pending</h1>
                    <p className="text-gray-600">
                        Your documents have been submitted and are currently being reviewed by our administrators. We will notify you once your account is approved.
                    </p>
                    <button
                        onClick={() => router.push(dbUser?.role === "owner" ? "/owner" : "/resident")}
                        className="mt-4 px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selfie || !idFront || !idBack) {
            toast.error("Please provide your Selfie, ID Front, and ID Back.");
            return;
        }

        if (isOwner && !propertyDoc) {
            toast.error("Property Owners must provide a proof of property ownership document.");
            return;
        }

        setIsSubmitting(true);

        try {
            const data = await submitVerificationDocuments({
                selfie,
                idFront,
                idBack,
                ...(isOwner && propertyDoc ? { propertyDoc } : {})
            });

            if (data.success) {
                toast.success("Documents uploaded successfully!");
                setSuccessMessage("Your documents have been submitted for review.");
            } else {
                toast.error(data.message || "Failed to upload documents.");
            }
        } catch (error: unknown) {
            console.error(error);
            toast.error("An error occurred during upload. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (successMessage) {
        return (
            <div className="max-w-2xl mx-auto p-6 md:p-12 mt-12 mb-12 bg-white rounded-2xl shadow-sm border border-blue-200">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <UploadCloud className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Submission Successful</h1>
                    <p className="text-gray-600">{successMessage}</p>
                    <button
                        onClick={() => router.push(dbUser?.role === "owner" ? "/owner" : "/resident")}
                        className="mt-6 px-6 py-2 bg-[#FC6435] text-white font-medium rounded-lg hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/10"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6 lg:p-10 my-8 bg-white border border-gray-100 shadow-sm rounded-2xl">
            <div className="mb-8 border-b pb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Identity Verification</h1>
                <p className="text-gray-600">
                    Please upload the required documents to verify your identity. This helps prevent fraud and keeps our community safe.
                </p>

                {verificationStatus === "rejected" && (
                    <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg text-sm font-medium border border-red-100">
                        Your previous verification attempt was rejected. Please ensure the documents are clear, valid, and match your profile details.
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Visual Identity Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm">1</span>
                        Visual Identity
                    </h2>
                    <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                        <FileUploader
                            label="Recent Selfie Photo / Face Capture"
                            onFileSelect={setSelfie}
                            selectedFile={selfie}
                            accept="image/jpeg, image/png"
                        />
                        <p className="mt-3 text-sm text-gray-500">Ensure your face is clearly visible, without sunglasses or hats.</p>
                    </div>
                </div>

                {/* Government ID Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm">2</span>
                        Government Issued ID
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                        <FileUploader
                            label="ID Document (Front Side)"
                            onFileSelect={setIdFront}
                            selectedFile={idFront}
                        />
                        <FileUploader
                            label="ID Document (Back Side)"
                            onFileSelect={setIdBack}
                            selectedFile={idBack}
                        />
                    </div>
                    <p className="px-2 text-sm text-gray-500">Supported IDs: Driver&apos;s License, National ID Card, or Passport.</p>
                </div>

                {/* Conditional Owner Section */}
                {isOwner && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm">3</span>
                            Property Verification
                        </h2>
                        <div className="bg-orange-50/30 p-6 rounded-xl border border-orange-100">
                            <FileUploader
                                label="Proof of Property Ownership"
                                onFileSelect={setPropertyDoc}
                                selectedFile={propertyDoc}
                                accept="image/jpeg, image/png, application/pdf"
                            />
                            <p className="mt-3 text-sm text-gray-500">Please provide a property deed, utility bill, or official tax document linking your name to the property.</p>
                        </div>
                    </div>
                )}

                <div className="pt-6 border-t flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-3 bg-[#FC6435] text-white font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-orange-500/20"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing Upload...
                            </>
                        ) : (
                            <>
                                <ShieldCheck className="w-5 h-5" />
                                Submit Documents
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
