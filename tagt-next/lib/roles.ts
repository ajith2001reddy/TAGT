import type { AppUser, RoleFlags } from "@/types/user";

export function getRoleFlags(user: AppUser | null): RoleFlags {
  const role = user?.role;
  return {
    isAdmin: role === "super_admin" || role === "owner",
    isOwner: role === "owner",
    isResident: role === "resident",
    isSuperAdmin: role === "super_admin",
  };
}
