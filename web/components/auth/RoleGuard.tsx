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

    if (loading || !role || !allowed.includes(role)) return null;

    return <>{children}</>;
}