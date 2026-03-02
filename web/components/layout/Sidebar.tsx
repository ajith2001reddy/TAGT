"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function Sidebar() {
    const { role } = useAuth();

    const links = {
        super_admin: [
            { href: "/provider", label: "Platform Overview" },
            { href: "/provider/properties", label: "Properties" },
        ],
        owner: [
            { href: "/owner", label: "Dashboard" },
            { href: "/owner/rooms", label: "Rooms" },
            { href: "/owner/payments", label: "Payments" },
            { href: "/owner/analytics", label: "Analytics" },
        ],
        resident: [
            { href: "/resident", label: "Dashboard" },
            { href: "/resident/payments", label: "My Payments" },
            { href: "/resident/requests", label: "My Requests" },
        ],
    };

    const roleLinks = role ? links[role as keyof typeof links] : [];

    return (
        <aside className="w-64 border-r border-white/10 bg-neutral-900 p-5">
            <h2 className="mb-6 text-lg font-bold">TAGT</h2>
            <nav className="space-y-3">
                {roleLinks?.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="block rounded-lg px-3 py-2 hover:bg-neutral-800"
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}