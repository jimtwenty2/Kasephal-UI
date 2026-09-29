import { UpdateBakongRequest } from "@/types/updateBakong";

// ─── Enums / Literals ─────────────────────────────────────────────────────────

export type UserRole = "BUYER" | "FARMER" | "GOVERNMENT" | "ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "BANNED";

// ─── Basic & Personal Info ────────────────────────────────────────────────────

export interface BasicInfo {
  bio: string;
  createdAt: string;
  email: string;
  isOtpVerified: boolean;
  isVerifiedIdentity: boolean;
  phoneNumber: string;
  profileUrl: string | null;
  role: UserRole;
  status: UserStatus;
  userId: string;
}

export interface PersonalInfo {
  buyerProfileId?: string;
  farmerProfileId?: string;
  fullName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  businessName?: string;
  businessType?: string;
  farmLocation?: string;
  farmName?: string;
  farmSize?: number;
  bakongAccountId?: string | null;
  ministryName?: string;
  trustScore?: number | string;
  trustLevel?: string;
  medalType?: string;
}

export interface UserProfilePayload {
  basicInfo: BasicInfo;
  personalInfo: PersonalInfo;
}

export interface UserProfileResponse {
  status: number;
  message: string;
  payload: UserProfilePayload | null;
  success: boolean;
  timestamp: string;
}

// ─── Profile Service Types ────────────────────────────────────────────────────

export type UserBasicInfo = {
  bio: string;
  createdAt: string;
  email: string;
  isOtpVerified: boolean;
  isVerifiedIdentity: boolean;
  phoneNumber: string;
  profileUrl: string;
  role: UserRole;
  status: string;
  userId: string;
};

export type UserPersonalInfo = {
  buyerProfileId?: string;
  farmerProfileId?: string;
  fullName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  businessName: string;
  businessType: string;
  bakongAccountId: string;
};

export type UserProfile = {
  basicInfo: UserBasicInfo;
  personalInfo: UserPersonalInfo;
};

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  status?: number;
  message?: string;
  payload?: unknown;
  success?: boolean;
  timestamp?: string;
}

export type UpdateBakongPayload = UpdateBakongRequest;
