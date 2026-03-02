"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type RoleGuardProps = {
    allowed: string[];
    children: React.ReactNode;
};

export function RoleGuard({ allowed, children }: RoleGuardProps) {
    const { role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!role || !allowed.includes(role))) {
            router.replace("/login");
        }
    }, [role, loading, allowed, router]);

    if (loading) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--bg-base)",
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{
                        width: "40px", height: "40px",
                        border: "2px solid var(--border-default)",
                        borderTopColor: "var(--accent-primary)",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                        margin: "0 auto 16px",
                    }} />
                    <p className="label-text">Loading workspace...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!role || !allowed.includes(role)) return null;

    return <>{children}</>;
}