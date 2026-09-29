import { DecodedAccessToken } from "@/types/auth/login.type";
import { UserRole } from "@/types/user-role";
/**
 * Decodes the payload of a JWT without verifying the signature.
 * Verification is handled server-side by your backend.
 */
export function decodeJwt(token: string): DecodedAccessToken | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Base64url → Base64 → JSON
    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decoded = JSON.parse(
      typeof window !== "undefined"
        ? atob(payload)
        : Buffer.from(payload, "base64").toString("utf-8")
    );

    return decoded as DecodedAccessToken;
  } catch {
    return null;
  }
}

/**
 * Maps the backend role string (uppercase) to the UserRole enum (lowercase).
 *
 * Backend returns: "BUYER" | "FARMER" | "GOVERNMENT" | "ADMIN"
 * System uses:     UserRole.BUYER | UserRole.FARMER | ...
 */
export function mapRoleToEnum(rawRole: string): UserRole {
  const normalised = rawRole.toLowerCase() as Lowercase<string>;

  const roleMap: Record<string, UserRole> = {
    buyer: UserRole.BUYER,
    farmer: UserRole.FARMER,
    government: UserRole.GOVERNMENT,
    admin: UserRole.ADMIN,
  };

  const role = roleMap[normalised];

  if (!role) {
    console.warn(`[auth] Unknown role received from token: "${rawRole}". Defaulting to BUYER.`);
    return UserRole.BUYER;
  }

  return role;
}

/**
 * Returns true if the JWT has already expired.
 */
export function isTokenExpired(expUnixSeconds: number): boolean {
  return Date.now() >= expUnixSeconds * 1000;
}
