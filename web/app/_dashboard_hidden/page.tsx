"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
    const { role, loading, dbUser } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!role) {
            router.replace("/login");
            return;
        }

        // 🚀 Smart Redirection Logic
        if (role === "owner") {
            const hasProperties = dbUser?.propertyIds && dbUser.propertyIds.length > 0;
            if (!hasProperties) {
                router.replace("/owner/setup");
                return;
            }
            router.replace("/owner");
        }
        else if (role === "resident") {
            const isAssigned = dbUser?.propertyId;
            if (!isAssigned) {
                router.replace("/resident/join");
                return;
            }
            router.replace("/resident");
        }
        else if (role === "super_admin" || role === "admin") {
            router.replace("/provider");
        }
        else {
            console.warn("Unknown role:", role);
            router.replace("/login");
        }

    }, [role, loading, dbUser, router]);

    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--bg-base)", flexDirection: "column", gap: "20px",
        }}>
            <div style={{
                width: "44px", height: "44px",
                border: "2px solid var(--border-default)",
                borderTopColor: "var(--accent-primary)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
            }} />
            <p className="label-text">Redirecting to your workspace...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}