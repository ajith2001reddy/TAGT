"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
    const { role, loading } = useAuth();
    const router = useRouter();
    console.log("ROLE:", role);
    console.log("LOADING:", loading);

    useEffect(() => {
        if (loading) return;

        if (!role) {
            router.replace("/login");
            return;
        }

        if (role === "owner") router.replace("/owner");
        else if (role === "resident") router.replace("/resident");
        else if (role === "super_admin") router.replace("/provider");
    }, [role, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                Loading...
            </div>
        );
    }

    return null;
}