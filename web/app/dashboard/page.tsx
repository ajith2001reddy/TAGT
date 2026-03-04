"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
    const { role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!role) {
            router.replace("/login");
            return;
        }

        const routes: Record<string, string> = {
            super_admin: "/provider",
            admin: "/provider",
            owner: "/owner",
            resident: "/resident",
        };

        const destination = routes[role];

        if (destination) {
            router.replace(destination);
        } else {
            console.warn("Unknown role:", role);
            router.replace("/login");
        }

    }, [role, loading, router]);

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