"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Clock3 } from "lucide-react";
import { useSession } from "next-auth/react";
import { getMyIdentityDocumentStatusAction } from "@/components/action-components/uploadIdentityDocumentAction";
import IdentityDocumentModal from "@/components/layout/Identitydocumentmodal";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import {
  createIdentityVerificationSocket,
  type IdentityVerificationSocketMessage,
} from "@/lib/identity-verification-socket";

type VerificationStatus =
  | "LOADING"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SKIPPED"
  | "NOT_SUBMITTED"
  | "UNKNOWN";

type StatusPayload = {
  status?: string;
  identityDocumentId?: string;
  hasDocument?: boolean;
  isVerifiedIdentity?: boolean;
  rejectionReason?: string | null;
};

function normalizeStatus(
  payload: StatusPayload | IdentityVerificationSocketMessage | null | undefined,
): VerificationStatus {
  if (!payload) return "UNKNOWN";
  if (payload.isVerifiedIdentity === true) return "APPROVED";

  const status = String(payload.status ?? "").toUpperCase();
  if (status.includes("APPROVED") || status.includes("VERIFIED")) {
    return "APPROVED";
  }
  if (status.includes("PENDING") || status.includes("REVIEW")) {
    return "PENDING";
  }
  if (status.includes("REJECTED")) return "REJECTED";
  if (status.includes("SKIPPED")) return "SKIPPED";
  if (status.includes("NOT_SUBMITTED") || status.includes("NOT SUBMITTED")) {
    return "NOT_SUBMITTED";
  }
  if (payload.hasDocument === false || !payload.identityDocumentId) {
    return "NOT_SUBMITTED";
  }

  return "UNKNOWN";
}

export default function IdentityVerificationBanner() {
  const router = useRouter();
  const { status, data: session } = useSession();
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>("LOADING");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const lastStatusRef = useRef<VerificationStatus>("LOADING");

  const isAuthenticated = status === "authenticated";
  const isAdmin = String(session?.user?.role ?? "").toUpperCase() === "ADMIN";
  useBodyScrollLock(modalOpen);

  const applyStatusPayload = useCallback(
    (payload: StatusPayload | IdentityVerificationSocketMessage | null | undefined) => {
      const nextStatus = normalizeStatus(payload);

      setVerificationStatus(nextStatus);
      setRejectionReason(
        nextStatus === "REJECTED" ? payload?.rejectionReason ?? null : null,
      );

      if (nextStatus === "APPROVED") {
        setModalOpen(false);
      }

      if (nextStatus !== lastStatusRef.current && lastStatusRef.current !== "LOADING") {
        router.refresh();
      }

      lastStatusRef.current = nextStatus;
    },
    [router],
  );

  const loadStatus = useCallback(async () => {
    if (!isAuthenticated || isAdmin) return;

    const result = await getMyIdentityDocumentStatusAction();
    if (result.success) {
      applyStatusPayload(result.data);
      return;
    }

    setVerificationStatus("UNKNOWN");
  }, [applyStatusPayload, isAuthenticated, isAdmin]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadStatus();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadStatus]);

  useEffect(() => {
    const token = session?.user?.accessToken;
    if (!isAuthenticated || isAdmin || !token) return;

    const client = createIdentityVerificationSocket({
      token,
      onVerificationUpdate: applyStatusPayload,
    });

    if (!client) return;

    client.activate();

    return () => {
      void client.deactivate();
    };
  }, [
    applyStatusPayload,
    isAdmin,
    isAuthenticated,
    session?.user?.accessToken,
  ]);

  const banner = useMemo(() => {
    if (
      !isAuthenticated ||
      isAdmin ||
      verificationStatus === "LOADING" ||
      verificationStatus === "APPROVED" ||
      verificationStatus === "UNKNOWN"
    ) {
      return null;
    }

    if (verificationStatus === "PENDING") {
      return {
        icon: <Clock3 className="h-4 w-4 shrink-0" />,
        message:
          "Your identity document is under review. Please wait for admin approval.",
        actionLabel: null,
      };
    }

    if (verificationStatus === "REJECTED") {
      return {
        icon: <AlertTriangle className="h-4 w-4 shrink-0" />,
        message: rejectionReason
          ? `Your identity document was rejected: ${rejectionReason}. Please upload again.`
          : "Your identity document was rejected. Please upload again.",
        actionLabel: "Upload again",
      };
    }

    return {
      icon: <AlertTriangle className="h-4 w-4 shrink-0" />,
      message:
        "Identity verification is required. Please upload your document to access all features.",
      actionLabel: "Upload document",
    };
  }, [isAuthenticated, isAdmin, verificationStatus, rejectionReason]);

  if (!banner && !modalOpen) return null;

  return (
    <>
      {!modalOpen && (
        <div className="sticky top-0 z-[60] w-full border-b border-yellow-300/80 bg-secondary/95 px-4 py-3 text-primary-heading shadow-sm backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-center gap-2 text-center text-sm font-semibold">
            {banner?.icon}
            <span>{banner?.message}</span>
            {banner?.actionLabel && (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="rounded-full border border-primary-heading/15 bg-white/45 px-3 py-1 text-sm font-bold text-primary-heading underline-offset-2 transition hover:bg-white/75 hover:underline"
              >
                {banner.actionLabel}
              </button>
            )}
          </div>
        </div>
      )}

      <IdentityDocumentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          applyStatusPayload({ status: "PENDING", hasDocument: true });
        }}
      />
    </>
  );
}
