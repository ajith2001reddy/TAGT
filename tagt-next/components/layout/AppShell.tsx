import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#070910]">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
