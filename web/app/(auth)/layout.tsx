"use client";

import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black text-white">

            {/* Top Header */}
            <div className="w-full flex justify-between items-center px-8 py-6 border-b border-neutral-800">
                <Link href="/" className="text-xl font-bold tracking-wide">
                    TAGT
                </Link>
                <span className="text-sm text-neutral-500">
                    Property Management Platform
                </span>
            </div>

            {/* Centered Content */}
            <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4">
                <div className="w-full max-w-md bg-neutral-900 p-8 rounded-2xl shadow-2xl border border-neutral-800">
                    {children}
                </div>
            </div>

            {/* Footer */}
            <div className="w-full text-center text-xs text-neutral-600 py-6 border-t border-neutral-800">
                © {new Date().getFullYear()} TAGT. All rights reserved.
            </div>
        </div>
    );
}