"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loading } from "@/components/shared/Loading";
import { useAuth } from "@/hooks/useAuth";
import { APP_ROUTES, ROLE_HOME_ROUTE } from "@/lib/constants";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(APP_ROUTES.login);
      return;
    }

    router.replace(ROLE_HOME_ROUTE[user.role]);
  }, [loading, router, user]);

  return <Loading label="Preparing workspace..." />;
}
