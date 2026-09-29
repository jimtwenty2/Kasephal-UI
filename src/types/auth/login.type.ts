import { UserRole } from "../user-role";
export interface LoginRequest {
  identifier: string;
  password: string;
}

// ─── Login Response ────────────────────────────────────────────────────────────

export interface LoginPayload {
  accessToken?: string;
  requiresProfileSetup: boolean;
  profileSetupToken?: string;
  nextStep?: number;
  role?: string;
}

export interface LoginResponse {
  status: number;
  message: string;
  payload: LoginPayload;
  success: boolean;
  timestamp: string;
}

// ─── Decoded JWT Token ─────────────────────────────────────────────────────────

export interface DecodedAccessToken {
  sub: string; // email
  userId: string;
  role: string; // e.g. "BUYER" | "FARMER" | "GOVERNMENT" | "ADMIN"
  tokenType: string; // "ACCESS"
  iat: number;
  exp: number;
}

// ─── Normalized Session User ───────────────────────────────────────────────────

export interface SessionUser {
  email: string;
  role: UserRole;
  userId:string;
  accessToken: string;
  requiresProfileSetup: boolean;
  tokenExpiry: number; // Unix timestamp (exp from JWT)
}
