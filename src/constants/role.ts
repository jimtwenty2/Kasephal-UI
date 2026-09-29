export const ROLES = {
  FARMER: "FARMER",
  BUYER: "BUYER",
  GOVERNMENT: "GOVERNMENT",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_VALUES = Object.values(ROLES) as UserRole[];

export function isUserRole(role: unknown): role is UserRole {
  return typeof role === "string" && ROLE_VALUES.includes(role as UserRole);
}

export function normalizeUserRole(role: unknown): UserRole | null {
  if (typeof role !== "string") return null;

  const normalizedRole = role.trim().toUpperCase();

  return isUserRole(normalizedRole) ? normalizedRole : null;
}