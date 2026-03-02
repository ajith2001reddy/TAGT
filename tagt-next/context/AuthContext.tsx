"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import api from "../services/api";

type Role = "super_admin" | "owner" | "resident";

type AppUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  propertyId?: string | null;
  roomId?: string | null;
};

type AuthContextType = {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AppUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchProfile(firebaseUser: FirebaseUser): Promise<AppUser> {
  await firebaseUser.getIdToken(true);
  const response = await api.get("/auth/me");
  return response.data.data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        localStorage.removeItem("user");
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await fetchProfile(firebaseUser);
        setUser(profile);
        localStorage.setItem("user", JSON.stringify({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
        }));
      } catch {
        await signOut(auth);
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const login = async (email: string, password: string) => {
    const credentials = await signInWithEmailAndPassword(auth, email, password);
    const profile = await fetchProfile(credentials.user);
    setUser(profile);
    localStorage.setItem("user", JSON.stringify({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
    }));
    return profile;
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
