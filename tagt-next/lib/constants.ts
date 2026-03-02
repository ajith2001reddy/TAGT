import type { Role } from "@/types/user";

export const STORAGE_KEYS = {
  user: "tagt.user",
} as const;

export const APP_ROUTES = {
  home: "/",
  login: "/login",
  resident: "/resident",
  dashboard: "/dashboard",
} as const;

export const ROLE_HOME_ROUTE: Record<Role, string> = {
  super_admin: APP_ROUTES.dashboard,
  owner: APP_ROUTES.dashboard,
  resident: APP_ROUTES.resident,
};
