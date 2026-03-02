"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/dashboard");
    }

    return (
        <>
            <h1 className="text-2xl font-bold mb-6">Login</h1>

            <form onSubmit={handleLogin} className="space-y-4">
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 bg-neutral-800 rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 bg-neutral-800 rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button className="bg-violet-600 w-full py-3 rounded font-semibold">
                    Sign In
                </button>
            </form>

            <div className="mt-6 text-sm text-neutral-400 flex justify-between">
                <Link href="/signup" className="hover:text-white">
                    Create account
                </Link>

                <Link href="/forgot-password" className="hover:text-white">
                    Forgot password?
                </Link>
            </div>
        </>
    );
}