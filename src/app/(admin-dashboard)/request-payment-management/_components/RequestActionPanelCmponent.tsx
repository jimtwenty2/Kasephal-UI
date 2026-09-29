"use client";

import { useState, type ReactNode } from "react";
import { CheckBadgeIcon, XCircleIcon } from "@heroicons/react/24/outline";
import type { AdminPaymentRequestStatus } from "@/types/admin/requestPayment";
import { reviewPaymentRequestAction } from "@/action/requestPayment.action";
import { showApiError } from "@/lib/apiToast";
import ConfirmActionDialog from "./ConfirmActionDialogComponent";
import ApprovePaymentQRModal from "./ApprovePaymentQRModalComponent";

// The KHQR data the admin scans, issued by the review (approve) response.
type ActivePaymentQR = {
  qrString: string;
  md5: string;
  paymentId: string;
};

type ActionVariant = "success" | "danger";

interface ActionButtonProps {
  variant: ActionVariant;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}

const VARIANT_STYLES: Record<ActionVariant, string> = {
  success:
    "bg-green-600 text-dark-grey hover:bg-green-700 disabled:bg-stone-200 disabled:text-stone-400",
  danger:
    "bg-red-500 text-white hover:bg-red-600 disabled:bg-stone-200 disabled:text-stone-400",
};

function ActionButton({
  variant,
  icon,
  onClick,
  disabled,
  children,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${VARIANT_STYLES[variant]}`}
    >
      {icon}
      {children}
    </button>
  );
}

interface RequestActionPanelProps {
  requestId: string;
  status: AdminPaymentRequestStatus;
  amount: number;
  currencyCode?: string | null;
  onStatusChange?: (status: AdminPaymentRequestStatus) => void;
}

export default function RequestActionPanel({
  requestId,
  status,
  amount,
  currencyCode,
  onStatusChange,
}: RequestActionPanelProps) {
  const [confirm, setConfirm] = useState<"approve" | "reject" | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [activePayment, setActivePayment] = useState<ActivePaymentQR | null>(
    null,
  );

  const isClosed = status === "SUCCESS" || status === "FAILED";

  // Approve → review the request as APPROVED. The response carries the freshly
  // issued payment whose KHQR the admin scans; we open the QR modal with it.
  const handleApproveConfirmed = async () => {
    setConfirm(null);
    setIsReviewing(true);

    const res = await reviewPaymentRequestAction({
      requestId,
      status: "APPROVED",
      note: "Approved by admin.",
    });

    setIsReviewing(false);

    if (!res.success || !res.data) {
      showApiError(new Error(res.error ?? "Failed to approve the request."));
      return;
    }

    // Approving only issues the payout QR — the request stays Pending until the
    // admin actually completes the payment (handlePaymentSuccess → SUCCESS), so
    // we intentionally don't surface the intermediate APPROVED status here.

    const payment = res.data.activePayment;
    if (!payment?.qrString || !payment.paymentId) {
      showApiError(
        new Error("Approved, but no payment QR was returned for this request."),
      );
      return;
    }

    setActivePayment({
      qrString: payment.qrString,
      md5: payment.md5 ?? "",
      paymentId: payment.paymentId,
    });
  };

  // Bakong confirmed the admin's payout payment settled.
  const handlePaymentSuccess = () => {
    onStatusChange?.("SUCCESS");
  };

  const handleRejectConfirmed = async () => {
    setConfirm(null);
    setIsReviewing(true);

    const res = await reviewPaymentRequestAction({
      requestId,
      status: "FAILED",
      note: "Rejected by admin.",
    });

    setIsReviewing(false);

    if (!res.success || !res.data) {
      showApiError(new Error(res.error ?? "Failed to reject the request."));
      return;
    }

    onStatusChange?.(res.data.status);
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
        Request Action
      </p>
      <div className="mt-3 flex flex-col gap-2">
        <ActionButton
          variant="success"
          icon={<CheckBadgeIcon className="h-4 w-4" />}
          onClick={() => setConfirm("approve")}
          disabled={isClosed || isReviewing}
        >
          {isReviewing ? "Processing…" : "Approve Payment"}
        </ActionButton>

        <ActionButton
          variant="danger"
          icon={<XCircleIcon className="h-4 w-4" />}
          onClick={() => setConfirm("reject")}
          disabled={isClosed || isReviewing}
        >
          Reject Payment
        </ActionButton>
      </div>

      <ConfirmActionDialog
        open={confirm === "approve"}
        title="Approve Payment Request?"
        message="Approving will generate a QR code to collect the payment. Do you want to continue?"
        confirmLabel="Yes, Approve"
        tone="default"
        onConfirm={handleApproveConfirmed}
        onCancel={() => setConfirm(null)}
      />

      <ConfirmActionDialog
        open={confirm === "reject"}
        title="Reject Payment Request?"
        message="This will mark the request as rejected. Do you want to continue?"
        confirmLabel="Yes, Reject"
        tone="danger"
        onConfirm={handleRejectConfirmed}
        onCancel={() => setConfirm(null)}
      />

      {activePayment && (
        <ApprovePaymentQRModal
          amount={amount}
          currencyCode={currencyCode}
          qrString={activePayment.qrString}
          md5={activePayment.md5}
          onSuccess={handlePaymentSuccess}
          onClose={() => setActivePayment(null)}
        />
      )}
    </div>
  );
}
