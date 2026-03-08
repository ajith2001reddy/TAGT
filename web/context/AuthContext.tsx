"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { api } from "@/lib/api";

export interface DbUser {
    _id: string;
    name: string;
    email: string;
    role: "resident" | "owner" | "super_admin";
    verification?: {
        status: "pending" | "approved" | "rejected";
        selfiePhoto?: string;
        idFront?: string;
        idBack?: string;
        propertyDocument?: string;
        aiScore?: number;
        fraudRisk?: "low" | "medium" | "high" | "unknown";
    };
    propertyIds?: string[];
    propertyId?: string;
    createdAt: string;
}

type AuthContextType = {
    user: User | null;
    dbUser: DbUser | null;
    role: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [dbUser, setDbUser] = useState<DbUser | null>(null);
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
                    const userData = data.data as DbUser;
                    setRole(userData.role || null);
                    setDbUser(userData || null);
                } catch (err: unknown) {
                    if (err instanceof Error && (err as any).response?.status !== 401) {
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
        <AuthContext.Provider value={{ user, dbUser, role, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}