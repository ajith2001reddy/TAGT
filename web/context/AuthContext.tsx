"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { api } from "@/lib/api";

type AuthContextType = {
    user: User | null;
    role: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [dbUser, setDbUser] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            // If we have a user, we must keep loading true while we fetch the role
            if (firebaseUser) {
                setLoading(true); // Ensure loading is true while we sync
                setUser(firebaseUser);
                try {
                    // 🔥 Force refresh token before calling backend
                    await firebaseUser.getIdToken(true);

                    const { data } = await api.get("/auth/me");
                    setRole(data.data?.role || null);
                    setDbUser(data.data || null);
                } catch (err: any) {
                    if (err.response?.status !== 401) {
                        console.error("Auth sync error:", err);
                    }
                    setRole(null);
                    setDbUser(null);
                }
            } else {
                setUser(null);
                setRole(null);
                setDbUser(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, dbUser, role, loading, login, logout } as any}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}