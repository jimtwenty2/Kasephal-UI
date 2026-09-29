// IdentityModal.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDaysIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import {
  approveVerificationService,
  getIdentityVerificationDetailClientService,
  getIdentityVerificationUserProfileClientService,
  IdentityVerification,
  IdentityVerificationDetail,
  normalizeIdentityAddress,
  rejectVerificationService,
} from "@/services/admin/identityVerification.service";
import { showApiError, showApiSuccess } from "@/lib/apiToast";

const IMAGE_BASE_URL =  process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='300' viewBox='0 0 500 300'%3E%3Crect width='500' height='300' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E";

/**
 * Resolves any image path/filename to a full URL.
 *
 * Two formats come from the API:
 *   "uploads/id/panha_front.jpg"        → already has path prefix → join with base
 *   "634e92ac-7985-47f6-9c3d-...jpg"    → bare UUID filename (profile) → needs "uploads/" prefix
 *
 * IMAGE_BASE_URL has no trailing slash.
 */
function getImageSrc(filename: string | null | undefined): string {
  if (!filename) return FALLBACK_IMAGE;
  if (filename.startsWith("http") || filename.startsWith("data:"))
    return filename;
  const clean = filename.replace(/^\//, "");
  // Bare UUID filename — no slash means no path prefix, add uploads/
  const path = clean.includes("/") ? clean : `/${clean}`;
  return `${IMAGE_BASE_URL}/${path}`;
}

function formatDocumentType(documentType: string): string {
  switch (documentType.toUpperCase()) {
    case "PASSPORT":
      return "Passport";
    case "ID_CARD":
    default:
      return "ID Card";
  }
}

function getContactInfo(
  email?: string,
  phoneNumber?: string,
  userProfile?: unknown,
): { label: string; value: string } {
  // Try to get phone/email from userProfile if not in detail
  let profilePhone: string | undefined = undefined;
  let profileEmail: string | undefined = undefined;

  if (userProfile && typeof userProfile === 'object' && userProfile !== null) {
    const profile = userProfile as Record<string, unknown>;
    const basicInfo = profile.basicInfo;
    if (basicInfo && typeof basicInfo === 'object' && basicInfo !== null) {
      const basicInfoRecord = basicInfo as Record<string, unknown>;
      profilePhone = typeof basicInfoRecord.phoneNumber === 'string' ? basicInfoRecord.phoneNumber : undefined;
      profileEmail = typeof basicInfoRecord.email === 'string' ? basicInfoRecord.email : undefined;
    }
  }

  // Prefer phone number if available (from detail or profile)
  const phone = phoneNumber || profilePhone;
  if (phone && phone.trim()) {
    return { label: "PHONE NUMBER", value: phone };
  }

  // Otherwise use email (from detail or profile)
  const emailToUse = email || profileEmail;
  if (emailToUse && emailToUse.trim()) {
    return { label: "EMAIL", value: emailToUse };
  }

  return { label: "CONTACT", value: "N/A" };
}

type SubmitState = "idle" | "approving" | "rejecting";

type Props = {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  verificationData: IdentityVerification;
};

export default function IdentityVerificationPopup({
  open,
  onClose,
  onUpdated,
  verificationData,
}: Props) {
  const [adminNotes, setAdminNotes] = useState("");
  const [viewSide, setViewSide] = useState<"front" | "back">("front");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const [detail, setDetail] = useState<IdentityVerificationDetail | null>(null);
  const [userProfile, setUserProfile] = useState<unknown | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Tracks which image source failed to load.
  const [erroredImageSrc, setErroredImageSrc] = useState<string | null>(null);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Fetch full detail whenever the modal opens
  useEffect(() => {
    if (!open || !verificationData.document) return;

    let cancelled = false;

    async function fetchDetail() {
      setDetail(null);
      setUserProfile(null);
      setViewSide("front");
      setAdminNotes("");
      setErroredImageSrc(null);
      setIsLoadingDetail(true);

      try {
        const [detailData, profileData] = await Promise.all([
          getIdentityVerificationDetailClientService(verificationData.document),
          getIdentityVerificationUserProfileClientService(verificationData.user_id),
        ]);

        if (!cancelled) {
          setDetail(detailData);
          setUserProfile(profileData);
        }
      } catch (error) {
        console.error("Failed to fetch verification detail:", error);
        showApiError(error, "Unable to load identity verification details.");
      } finally {
        if (!cancelled) setIsLoadingDetail(false);
      }
    }

    fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [open, verificationData.document, verificationData.user_id]);

  // Prefer detail documentType, then the value already mapped from the list
  const rawDocumentType =
    detail?.documentType ?? verificationData.documentType ?? "ID_CARD";
  const isPassport = rawDocumentType.toUpperCase().includes("PASSPORT");
  const documentLabel = formatDocumentType(rawDocumentType);

  // Images come exclusively from the detail fetch
  const frontImage = getImageSrc(
    detail?.frontImageUrl ?? verificationData.profile,
  );
  const backImage = getImageSrc(detail?.backImageUrl ?? null);

  const intendedImageSrc =
    isPassport || viewSide === "front" ? frontImage : backImage;
  const currentImageSrc =
    erroredImageSrc === intendedImageSrc ? FALLBACK_IMAGE : intendedImageSrc;

  const isSubmitting = submitState !== "idle";
  const currentStatus = detail?.status ?? verificationData.status;
  const isPendingReview = currentStatus === "PENDING";

  const handleApprove = async () => {
    if (!verificationData.document || isSubmitting || !isPendingReview) return;
    setSubmitState("approving");
    try {
      const success = await approveVerificationService(
        verificationData.document,
      );
      if (success) {
        showApiSuccess(
          "Verification approved",
          "The identity verification request has been approved.",
        );
        onUpdated();
      } else {
        console.error(
          "Approve returned false for id:",
          verificationData.document,
        );
        showApiError(
          new Error("Approval was not completed."),
          "Unable to approve verification.",
        );
      }
    } catch (error) {
      console.error("Approve failed:", error);
      showApiError(error, "Unable to approve verification.");
    } finally {
      setSubmitState("idle");
    }
  };

  const handleReject = async () => {
    if (
      !verificationData.document ||
      !adminNotes.trim() ||
      isSubmitting ||
      !isPendingReview
    )
      return;
    setSubmitState("rejecting");
    try {
      const success = await rejectVerificationService(
        verificationData.document,
        adminNotes,
      );
      if (success) {
        showApiSuccess(
          "Verification rejected",
          "The identity verification request has been rejected.",
        );
        onUpdated();
      } else {
        console.error(
          "Reject returned false for id:",
          verificationData.document,
        );
        showApiError(
          new Error("Rejection was not completed."),
          "Unable to reject verification.",
        );
      }
    } catch (error) {
      console.error("Reject failed:", error);
      showApiError(error, "Unable to reject verification.");
    } finally {
      setSubmitState("idle");
    }
  };

  const displayAddress =
    normalizeIdentityAddress(detail) ??
    normalizeIdentityAddress(userProfile) ??
    normalizeIdentityAddress(verificationData) ??
    "N/A";

  const contactInfo = getContactInfo(
    detail?.email ?? verificationData.email,
    detail?.phoneNumber ?? verificationData.phoneNumber,
    userProfile,
  );

  const statusBadge = {
    PENDING: {
      label: "• PENDING REVIEW",
      className: "bg-[#FFFBEB] text-[#BB4D00] border border-[#FEE685]",
    },
    APPROVED: {
      label: "• APPROVED",
      className: "bg-green-50 text-green-700 border border-green-200",
    },
    REJECTED: {
      label: "• REJECTED",
      className: "bg-red-50 text-red-600 border border-red-200",
    },
  }[currentStatus] ?? {
    label: "• PENDING REVIEW",
    className: "bg-[#FFFBEB] text-[#BB4D00] border border-[#FEE685]",
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-[820px] rounded-[18px] bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-secondary-body transition-colors hover:text-primary-heading"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="border-b border-light-grey px-6 py-5">
          <div className="flex items-center gap-2 text-[12px] text-secondary-body">
            <Link href="/user-management">Verifications</Link>
            <span>›</span>
            <span className="font-medium text-primary-heading">
              {verificationData.name}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <h1 className="heading font-bold leading-none text-primary">
              Identity Verification
            </h1>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold ${statusBadge.className}`}
            >
              {statusBadge.label}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2 text-[13px] text-secondary-body">
            <CalendarDaysIcon className="h-4 w-4" />
            <span>
              Submitted: {verificationData.submissionDate || "No date"}
            </span>
          </div>
        </div>

        <div className="grid gap-5 px-6 py-5 lg:grid-cols-[0.95fr_1fr]">
          {/* ── Document image panel ── */}
          <div>
            <div className="flex h-[42px] items-center justify-between rounded-full border border-light-grey bg-primary/5 p-1 px-4">
              <h2 className="text-[14px] font-bold text-primary-heading">
                {isPassport
                  ? documentLabel
                  : `${documentLabel} (${viewSide === "front" ? "Front" : "Back"})`}
              </h2>

              {!isPassport && (
                <div className="flex rounded-full border border-light-grey bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewSide("front")}
                    className={`rounded-full px-3 py-0.5 text-[11px] font-semibold transition-all ${
                      viewSide === "front"
                        ? "bg-slate-100 text-primary-heading shadow-sm"
                        : "text-secondary-body hover:text-primary-heading"
                    }`}
                  >
                    Front
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewSide("back")}
                    className={`rounded-full px-3 py-0.5 text-[11px] font-semibold transition-all ${
                      viewSide === "back"
                        ? "bg-slate-100 text-primary-heading shadow-sm"
                        : "text-secondary-body hover:text-primary-heading"
                    }`}
                  >
                    Back
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4 rounded-[20px] border border-light-grey bg-primary/5 p-2">
              <div className="rounded-[16px] bg-white p-3 shadow-sm">
                {isLoadingDetail ? (
                  <div className="h-45 w-full rounded-xl bg-slate-100 animate-pulse" />
                ) : (
                  <Image
                    src={currentImageSrc}
                    alt={`${documentLabel} Viewer`}
                    width={500}
                    height={300}
                    className="h-45 w-full rounded-xl object-cover transition-all duration-300"
                    onError={() => setErroredImageSrc(intendedImageSrc)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* ── Document info panel ── */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5 text-primary" />
              <h2 className="text-[18px] font-bold text-primary-heading">
                Document Info
              </h2>
            </div>

            <div className="overflow-hidden rounded-[20px] border border-light-grey">
              <div className="grid grid-cols-[0.8fr_1.2fr] border-b border-[#E1EDE4] bg-slate-50/80 px-4 py-2">
                <span className="text-[11px] font-bold text-[#6A8272]">
                  FIELD
                </span>
                <span className="text-[11px] font-bold text-[#6A8272]">
                  USER INPUT
                </span>
              </div>

              {[
                ["FULL NAME", verificationData.name],
                [contactInfo.label, contactInfo.value],
                ["ROLE", verificationData.role],
                ["ADDRESS", displayAddress],
                ["DOCUMENT TYPE", documentLabel],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-[0.8fr_1.2fr] border-b border-light-grey px-4 py-3 last:border-b-0"
                >
                  <p className="whitespace-pre-line text-[12px] font-bold text-[#6A8272]">
                    {label}
                  </p>
                  <p className="whitespace-pre-line text-[12px] font-semibold text-primary-heading">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {currentStatus === "REJECTED" && detail?.rejectionReason && (
              <div className="mt-3 rounded-[12px] border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-[11px] font-bold uppercase text-red-400">
                  Rejection Reason
                </p>
                <p className="mt-1 text-[12px] font-medium text-red-700">
                  {detail.rejectionReason}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mx-6 border-t border-light-grey py-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold uppercase text-primary-heading">
              Administrative Decision
            </h2>
            {isPendingReview && (
            <div className="flex gap-2">
              {["Blurry Image", "Name Mismatch", "Expired Doc"].map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() =>
                    setAdminNotes((prev) => (prev ? `${prev}, ${item}` : item))
                  }
                  className="rounded-md bg-[#F5F8F5] px-2 py-1 text-[10px] font-semibold text-[#6A8272] transition-colors hover:bg-primary/10"
                >
                  {item}
                </button>
              ))}
            </div>
            )}
          </div>

          {isPendingReview ? (
            <textarea
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              placeholder="Enter reason for rejection or approval notes here."
              className="mt-4 h-[85px] w-full resize-none rounded-[18px] border border-light-grey px-4 py-3 text-[13px] font-medium outline-none transition-all placeholder:text-muted focus:border-slate-300"
            />
          ) : (
            <div className="mt-4 rounded-[14px] border border-light-grey bg-slate-50 px-4 py-3 text-[13px] font-semibold text-secondary-body">
              This verification has already been {currentStatus.toLowerCase()}.
              No further admin decision is required.
            </div>
          )}
        </div>

        <div className="mx-6 flex justify-end gap-3 border-t border-light-grey py-5">
          {isPendingReview ? (
            <>
          <button
            type="button"
            onClick={handleReject}
            disabled={!adminNotes.trim() || isSubmitting}
            className="flex h-[38px] items-center gap-2 rounded-full border border-red-300 bg-red-50 px-6 text-[12px] font-bold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-red-50"
          >
            <XMarkIcon className="h-4 w-4" />
            {submitState === "rejecting" ? "Rejecting…" : "Reject Verification"}
          </button>

          <button
            type="button"
            onClick={handleApprove}
            disabled={isSubmitting || !verificationData.document}
            className="flex h-[38px] items-center gap-2 rounded-full bg-primary px-6 text-[12px] font-bold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircleIcon className="h-4 w-4" />
            {submitState === "approving"
              ? "Approving…"
              : "Approve Verification"}
          </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="flex h-[38px] items-center rounded-full bg-primary px-6 text-[12px] font-bold text-white transition-colors hover:bg-emerald-800"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
