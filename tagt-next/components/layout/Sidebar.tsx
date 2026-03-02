"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { getNavItems } from "@/components/navigation/nav.config";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { APP_ROUTES } from "@/lib/constants";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isAdmin } = useRole();

  const links = useMemo(() => getNavItems(user?.role), [user?.role]);

  const handleLogout = async () => {
    await logout();
    router.push(APP_ROUTES.login);
  };

  return (
    <aside className="h-full w-64 flex-col border-r border-white/5 bg-[#0a0a0f] md:flex">
      <div className="border-b border-white/5 px-6 py-7">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-black text-white">
            T
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-white">TAGT</p>
            <p className="text-[10px] uppercase tracking-widest text-white/30">Property Mgmt</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/20">
          {isAdmin ? "Management" : "My Space"}
        </p>

        {links.map((item) => {
          const isActive = pathname === item.to;
          return (
            <Link
              key={item.to}
              href={item.to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 ${
                isActive
                  ? "border border-violet-500/20 bg-violet-500/15 text-violet-300"
                  : "text-white/40 hover:bg-white/5 hover:text-white/70"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 p-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-violet-500/30 to-indigo-600/30 text-xs font-bold text-white/60">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white/70">{user?.name}</p>
            <p className="text-[10px] capitalize text-white/25">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="text-xs text-white/20 transition hover:text-red-400" title="Sign out">
            ⏻
          </button>
        </div>
      </div>
    </aside>
  );
}
