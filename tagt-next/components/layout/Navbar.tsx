"use client";

import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070910]/80 px-5 py-3.5 backdrop-blur-xl lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/30">TAGT Workspace</p>
          <p className="text-sm font-medium text-white/60">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs capitalize text-white/60 sm:inline-flex">
            {user?.role}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-violet-500/40 to-indigo-600/40 text-xs font-bold text-white/80">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
        </div>
      </div>
    </header>
  );
}
