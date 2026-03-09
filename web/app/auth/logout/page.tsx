"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
    const { logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const handleLogout = async () => {
            try {
                await logout();
            } finally {
                router.push("/login?logout=success");
            }
        };
        handleLogout();
    }, [logout, router]);

    return (
        <div style={{
            minHeight: "100vh", background: "#04070c", display: "flex",
            alignItems: "center", justifyContent: "center", color: "#fff"
        }}>
            <div style={{ textAlign: "center" }}>
                <div style={{
                    width: "48px", height: "48px", border: "3px solid rgba(0,212,255,0.1)",
                    borderTopColor: "#00d4ff", borderRadius: "50%",
                    animation: "spin 1s linear infinite", margin: "0 auto 20px"
                }} />
                <h2 style={{ fontSize: "18px", fontWeight: 600 }}>Signing you out...</h2>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );
}
