import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 ${className}`}>{children}</div>;
}
