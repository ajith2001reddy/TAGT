"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";

export default function SignupPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            // 1️⃣ Create Firebase account
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            // 2️⃣ Get Firebase ID token
            const token = await userCredential.user.getIdToken();

            // 3️⃣ Register user in MongoDB
            await api.post(
                "/auth/register",
                { name },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            router.push("/dashboard");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <form onSubmit={handleSignup} className="space-y-4">
                <h1 className="text-2xl font-bold text-center">Create Account</h1>

                <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full p-3 bg-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 bg-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 bg-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button
                    disabled={loading}
                    className="bg-violet-600 hover:bg-violet-700 transition w-full py-3 rounded-lg font-semibold disabled:opacity-50"
                >
                    {loading ? "Creating Account..." : "Sign Up"}
                </button>
            </form>

            <div className="mt-6 text-sm text-neutral-400 text-center">
                Already have an account?{" "}
                <Link href="/login" className="text-violet-500 hover:text-violet-400">
                    Login
                </Link>
            </div>
        </>
    );
}