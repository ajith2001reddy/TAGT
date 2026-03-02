"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { STORAGE_KEYS } from "@/lib/constants";
import { fetchMyProfile, loginWithFirebase, logoutFirebase } from "@/services/auth.service";
import type { AppUser } from "@/types/user";

type AuthContextType = {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AppUser>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

function persistUser(user: AppUser | null) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.user);
    return;
  }

  localStorage.setItem(
    STORAGE_KEYS.user,
    JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role }),
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        persistUser(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await fetchMyProfile(firebaseUser);
        setUser(profile);
        persistUser(profile);
      } catch {
        setUser(null);
        persistUser(null);
        await logoutFirebase();
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const firebaseUser = await loginWithFirebase(email, password);
    const profile = await fetchMyProfile(firebaseUser);
    setUser(profile);
    persistUser(profile);
    return profile;
  }, []);

  const logout = useCallback(async () => {
    await logoutFirebase();
    setUser(null);
    persistUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({ user, loading, error, login, logout, clearError }),
    [user, loading, error, login, logout, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }
  return context;
}
