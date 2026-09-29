import { auth } from "@/auth";
import { UserRole } from "@/types/user-role";

export function hasAnyRole(role: unknown, roles: string[]) {
  const normalizedRole = String(role ?? "")
    .trim()
    .toLowerCase();

  return roles.some(
    (allowedRole) => allowedRole.toLowerCase() === normalizedRole,
  );
}

export async function canManageGovernmentContent(): Promise<boolean> {
  const session = await auth();

  return hasAnyRole(session?.user?.role, [
    UserRole.GOVERNMENT,
    UserRole.ADMIN,
  ]);
}

export async function requireGovernmentContentManager() {
  if (!(await canManageGovernmentContent())) {
    throw new Error("You do not have permission to manage this content.");
  }
}
