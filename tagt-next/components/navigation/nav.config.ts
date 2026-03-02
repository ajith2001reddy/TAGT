import type { Role } from "@/types/user";

export type NavItem = {
  to: string;
  label: string;
  icon: string;
};

const ADMIN_NAV: NavItem[] = [
  { to: "/dashboard", label: "Overview", icon: "⬡" },
  { to: "/residents", label: "Residents", icon: "◈" },
  { to: "/rooms", label: "Rooms", icon: "▣" },
  { to: "/payments", label: "Payments", icon: "◎" },
  { to: "/requests", label: "Requests", icon: "◇" },
];

const RESIDENT_NAV: NavItem[] = [{ to: "/resident", label: "My Dashboard", icon: "⬡" }];

export function getNavItems(role: Role | undefined): NavItem[] {
  if (role === "owner" || role === "super_admin") return ADMIN_NAV;
  return RESIDENT_NAV;
}
