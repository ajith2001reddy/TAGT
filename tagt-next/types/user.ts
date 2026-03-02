export type Role = "super_admin" | "owner" | "resident";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  propertyId?: string | null;
  roomId?: string | null;
};

export type RoleFlags = {
  isAdmin: boolean;
  isOwner: boolean;
  isResident: boolean;
  isSuperAdmin: boolean;
};
