import "next-auth";
import "next-auth/jwt";
import { UserRole } from "../user-role";

declare module "next-auth" {
  interface Session {
    user: {
      userId: string;
      email: string;
      role: UserRole;
      accessToken: string;
      requiresProfileSetup: boolean;
      tokenExpiry: number;
    } & DefaultSession["user"];
    error?: "TokenExpired";
  }

  interface User {
    id: string;
    email: string;
    role: UserRole;
    accessToken: string;
    requiresProfileSetup: boolean;
    tokenExpiry: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    userId: string;
    role: UserRole;
    accessToken: string;
    requiresProfileSetup: boolean;
    tokenExpiry: number;
    error?: "TokenExpired";
  }
}
