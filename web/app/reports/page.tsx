"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

export default function ReportsGateway() {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/auth/login");
            } else if (role === "owner" || role === "super_admin") {
                router.push("/owner/reports");
            } else {
                toast.error("You do not have permission to access reports.");
                router.push("/dashboard");
            }
        }
    }, [user, role, loading, router]);

    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
            <div style={{ textAlign: "center" }}>
                <div style={{ width: "40px", height: "40px", border: "3px solid var(--accent-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px" }}>Accessing Reports...</h2>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
