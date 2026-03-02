"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getRoleFlags } from "@/lib/roles";

export function useRole() {
  const { user } = useAuth();
  return useMemo(() => getRoleFlags(user), [user]);
}
