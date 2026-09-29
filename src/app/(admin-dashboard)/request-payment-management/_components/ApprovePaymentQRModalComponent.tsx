"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import KhqrModal from "@/app/(main)/(orders)/(payment)/_component/KhqrModal";
import { checkPaymentRequestTransactionAction } from "@/action/requestPayment.action";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

const REQUEST_PAYMENT_LIST_PATH = "/request-payment-management";

const EXPIRY_SECONDS = 5 * 60; // QR valid for 5 minutes
const POLL_INTERVAL_MS = 5000; // poll Bakong every 5s while scanning
const AUTO_CLOSE_MS = 2_000; // redirect shortly after success

type Phase = "scanning" | "success" | "expired";

interface ApprovePaymentQRModalProps {
  amount: number;
  currencyCode?: string | null;
  // Real KHQR data issued by the review (approve) response.
  qrString: string;
  md5: string;
  onSuccess: () => void;
  onClose: () => void;
}

function formatAmount(amount: number, currencyCode?: string | null): string {
  const isKhr = (currencyCode || "USD").toUpperCase() === "KHR";
  // Prepend the symbol manually so server/client render identically (the
  // locale-based currency formatter differs across ICU builds → hydration
  // mismatch). KHR has no minor unit; USD keeps 2 decimals.
  const formatted = (Number.isFinite(amount) ? amount : 0).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: isKhr ? 0 : 2,
      maximumFractionDigits: isKhr ? 0 : 2,
    },
  );
  return isKhr ? `៛${formatted}` : `$${formatted}`;
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function ApprovePaymentQRModal({
  amount,
  currencyCode,
  qrString,
  md5,
  onSuccess,
  onClose,
}: ApprovePaymentQRModalProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("scanning");
  const [remaining, setRemaining] = useState(EXPIRY_SECONDS);
  // The success view isn't a KhqrModal, so keep the scroll lock here too.
  // useBodyScrollLock is reentrant (lockCount), so KhqrModal also locking is ok.
  useBodyScrollLock(true);

  const settledRef = useRef(false);
  const onSuccessRef = useRef(onSuccess);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onCloseRef.current = onClose;
  });

  // Reconcile the admin's payout against Bakong by its md5. The request flips to
  // SUCCESS (payout PAID) once the transaction settles.
  const verifyPayment = useCallback(async () => {
    if (settledRef.current) return;

    const verify = md5 ? await checkPaymentRequestTransactionAction(md5) : null;

    if (verify?.success && verify.settled) {
      settledRef.current = true;
      setPhase("success");
      onSuccessRef.current();
    }
  }, [md5]);

  // While the QR is live, run the countdown and poll for settlement.
  useEffect(() => {
    if (phase !== "scanning") return;

    const countdown = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setPhase("expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const poll = setInterval(() => void verifyPayment(), POLL_INTERVAL_MS);

    return () => {
      clearInterval(countdown);
      clearInterval(poll);
    };
  }, [phase, verifyPayment]);

  // After settlement, briefly show the confirmation, then return to the list.
  useEffect(() => {
    if (phase !== "success") return;
    const t = setTimeout(() => {
      router.push(REQUEST_PAYMENT_LIST_PATH);
    }, AUTO_CLOSE_MS);
    return () => clearTimeout(t);
  }, [phase, router]);

  // Escape closes while mounted.
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  // Success confirmation. The shared KhqrModal has no success state (the buyer
  // flow shows its own popup), so mirror that with a small branded confirmation.
  if (phase === "success") {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="approve-qr-title"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      >
        <div className="relative w-full max-w-[380px] overflow-hidden rounded-[24px] bg-white pb-8 shadow-2xl">
          <div className="bg-[#E11D2A] py-3.5 text-center">
            <span className="font-sans text-xl font-black tracking-wider text-white">
              KHQR
            </span>
          </div>

          <div className="flex flex-col items-center px-6 pt-8 text-center">
            <p className="title font-bold text-primary-heading">Kasephal</p>
            <h2
              id="approve-qr-title"
              className="heading mt-1 font-black tracking-tight text-black"
            >
              {formatAmount(amount, currencyCode)}
            </h2>

            <div className="my-5 w-full border-t border-dashed border-gray-300" />

            <svg
              className="h-20 w-20 text-emerald-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="M22 4 12 14.01l-3-3" />
            </svg>
            <p className="mt-3 text-base font-semibold text-black">
              Payment Successful
            </p>
            <p className="sub-title mt-1 text-description-text">
              The request has been paid out.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Scanning / expired — render the platform's shared KHQR modal.
  return (
    <KhqrModal
      isOpen
      amount={amount}
      currencyCode={
        (currencyCode || "USD").toUpperCase() === "KHR" ? "KHR" : "USD"
      }
      qrPayload={qrString}
      expiresIn={formatCountdown(remaining)}
      isExpired={phase === "expired"}
      onClose={onClose}
    />
  );
}
