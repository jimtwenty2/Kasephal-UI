import { getMyIdentityDocumentStatusService } from "@/services/Identitydocument.service";

export const IDENTITY_VERIFICATION_REQUIRED_MESSAGE =
  "Please verify your identity document before using this feature.";

export type IdentityVerificationState = {
  isVerified: boolean;
  status: string;
  rejectionReason?: string | null;
};

export async function getIdentityVerificationState(): Promise<IdentityVerificationState> {
  try {
    const data = await getMyIdentityDocumentStatusService();
    const status = String(data?.status ?? "").toUpperCase();
    const isVerified =
      data?.isVerifiedIdentity === true ||
      status.includes("APPROVED") ||
      status.includes("VERIFIED");

    return {
      isVerified,
      status: status || "UNKNOWN",
      rejectionReason: data?.rejectionReason ?? null,
    };
  } catch {
    return {
      isVerified: false,
      status: "UNKNOWN",
      rejectionReason: null,
    };
  }
}

export async function isIdentityVerified() {
  const state = await getIdentityVerificationState();
  return state.isVerified;
}
