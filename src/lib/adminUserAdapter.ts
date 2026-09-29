import type { User as ApiUser, UserStatus } from "@/types/admin/userAll";
import type {
  IdentityVerification,
  User as AdminUser,
} from "@/types/adminType";
import { formatCambodiaPhone } from "@/utils/formatCambodiaPhone";

const DEFAULT_PROFILE_IMAGE = "/assets/nav-bar/profile.png";
const ALLOWED_PROFILE_HOSTS = new Set([
  "s3-dev.detronic11.win",
  "kasephal-api-dev.detronic11.win",
  "images.unsplash.com",
]);

function normalizeProfileUrl(value?: string | null) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === "string") return undefined;
  
  // Allow blob and data URLs
  if (/^(blob:|data:)/i.test(trimmed)) return trimmed;
  
  // Allow relative paths
  if (trimmed.startsWith("/")) return trimmed;
  
  // Allow full URLs from allowed hosts
  try {
    const url = new URL(trimmed);
    if (ALLOWED_PROFILE_HOSTS.has(url.hostname)) return trimmed;
  } catch {
    // Not a valid URL, treat as filename and let getAttachmentUrl handle it
  }
  
  // Return bare filenames/paths so getAttachmentUrl can process them
  return trimmed;
}

function formatRole(role: ApiUser["role"]) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function formatStatus(status: ApiUser["status"]) {
  if (status === "SUSPENDED") return "Suspended";

  return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function cleanName(value?: string | null) {
  const name = value?.trim();

  return name || null;
}

function cleanString(value: unknown): string | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    return firstCleanString([
      record.nameEn,
      record.nameKh,
      record.name,
      record.value,
      record.label,
    ]);
  }
  if (typeof value !== "string") return undefined;

  const text = value.trim();
  if (!text || text.toLowerCase() === "string" || text.toUpperCase() === "N/A") {
    return undefined;
  }

  return text;
}

function firstCleanString(values: unknown[]): string | undefined {
  for (const value of values) {
    const cleanValue = cleanString(value);
    if (cleanValue) return cleanValue;
  }

  return undefined;
}

function formatLocationParts(values: unknown[]) {
  const parts = values
    .map(cleanString)
    .filter((value): value is string => Boolean(value));

  return parts.length > 0 ? parts.join(", ") : undefined;
}

function getDisplayName(user: ApiUser) {
  const firstLastName = [user.firstName, user.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
  const profileName =
    user.personalInfo?.fullName ??
    user.farmerProfile?.fullName ??
    user.farmerProfile?.name ??
    user.buyerProfile?.fullName ??
    user.buyerProfile?.name ??
    user.governmentProfile?.fullName ??
    user.governmentProfile?.name ??
    user.governmentProfile?.ministryName;

  return (
    cleanName(user.fullName) ??
    cleanName(user.full_name) ??
    cleanName(user.name) ??
    cleanName(firstLastName) ??
    cleanName(profileName) ??
    user.email?.split("@")[0] ??
    formatCambodiaPhone(user.phoneNumber) ??
    user.userId
  );
}

export function toAdminUser(user: ApiUser): AdminUser {
  const personalInfo = user.personalInfo;
  const adminProfile = user.profile;
  const address = firstCleanString([
    user.address,
    user.fullAddress,
    user.location,
    user.governmentAddress,
    user.ministryAddress,
    adminProfile?.address,
    user.governmentProfile?.address,
    user.governmentProfile?.governmentAddress,
    user.governmentProfile?.ministryAddress,
    user.governmentProfile?.location,
    personalInfo?.address,
    personalInfo?.fullAddress,
    personalInfo?.ministryAddress,
    personalInfo?.location,
  ]) ?? formatLocationParts([
    personalInfo?.addressVillage,
    personalInfo?.addressCommune,
    personalInfo?.addressDistrict,
    personalInfo?.addressProvince,
  ]);
  const farmLocation = firstCleanString([
    user.farmLocation,
    adminProfile?.farmLocation,
    user.farmerProfile?.farmLocation,
    user.farmerProfile?.location,
    user.farmerProfile?.address,
    personalInfo?.farmLocation,
    personalInfo?.location,
    user.bio,
  ]) ?? formatLocationParts([
    personalInfo?.farmVillage,
    personalInfo?.farmCommune,
    personalInfo?.farmDistrict,
    personalInfo?.farmProvince,
  ]);
  const businessLocation = firstCleanString([
    user.businessLocation,
    adminProfile?.businessAddress,
    user.buyerProfile?.businessLocation,
    user.buyerProfile?.location,
    user.buyerProfile?.address,
    personalInfo?.businessLocation,
    personalInfo?.location,
  ]) ?? formatLocationParts([
    personalInfo?.businessVillage,
    personalInfo?.businessCommune,
    personalInfo?.businessDistrict,
    personalInfo?.businessProvince,
  ]);

  return {
    user_id: user.userId,
    name: getDisplayName(user),
    profile: normalizeProfileUrl(user.profileUrl),
    email: user.email ?? "N/A",
    regDate: formatDate(user.createdAt),
    role: formatRole(user.role),
    status: formatStatus(user.status),
    phone: formatCambodiaPhone(user.phoneNumber) ?? undefined,
    dateOfBirth: cleanString(personalInfo?.dateOfBirth ?? adminProfile?.dateOfBirth),
    placeOfBirth:
      cleanString(personalInfo?.placeOfBirth ?? adminProfile?.placeOfBirth) ??
      formatLocationParts([
        personalInfo?.placeOfBirthVillage,
        personalInfo?.placeOfBirthCommune,
        personalInfo?.placeOfBirthDistrict,
        personalInfo?.placeOfBirthProvince,
      ]),
    organizationName:
      user.role === "GOVERNMENT"
        ? firstCleanString([
            user.organizationName,
            user.ministryName,
            adminProfile?.ministryName,
            user.governmentProfile?.organizationName,
            user.governmentProfile?.ministryName,
            personalInfo?.organizationName,
            personalInfo?.ministryName,
            user.bio,
          ])
        : undefined,
    address: user.role === "GOVERNMENT" ? address : undefined,
    companyName:
      user.role === "BUYER"
        ? firstCleanString([
            user.businessName,
            adminProfile?.businessName,
            user.buyerProfile?.businessName,
            personalInfo?.businessName,
          ])
        : undefined,
    businessType:
      user.role === "BUYER"
        ? firstCleanString([
            user.businessType,
            adminProfile?.businessType,
            user.buyerProfile?.businessType,
            personalInfo?.businessType,
            user.bio,
          ])
        : undefined,
    location: user.role === "BUYER" ? businessLocation : undefined,
    farmLocation: user.role === "FARMER" ? farmLocation : undefined,
    farmSize:
      user.role === "FARMER"
        ? firstCleanString([
            user.farmSize,
            adminProfile?.farmSize,
            user.farmerProfile?.farmSize,
            personalInfo?.farmSize,
          ])
        : undefined,
  };
}

export function toIdentityVerification(user: ApiUser): IdentityVerification {
  return {
    user_id: user.userId,
    name: getDisplayName(user),
    profile: normalizeProfileUrl(user.profileUrl),
    email: user.email ?? formatCambodiaPhone(user.phoneNumber) ?? "N/A",
    dob: "N/A",
    address: user.bio ?? "N/A",
    document: user.isOtpVerified ? "Verified Account" : "Identity Review",
    role: formatRole(user.role),
    submissionDate: formatDate(user.createdAt),
    document_front: normalizeProfileUrl(user.profileUrl) ?? DEFAULT_PROFILE_IMAGE,
    document_back: "",
  };
}

export function toApiUserStatus(status: string): UserStatus {
  const normalized = status.trim().toUpperCase();

  if (normalized === "SUSPEND" || normalized === "SUSPENDED") {
    return "SUSPENDED";
  }

  if (normalized === "BANNED" || normalized === "BAN") return "BANNED";
  if (normalized === "INACTIVE") return "INACTIVE";

  return "ACTIVE";
}
