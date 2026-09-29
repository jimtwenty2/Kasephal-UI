"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  NoSymbolIcon,
  StopCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import type { AdminReportIssueStatus } from "@/types/admin/report";
import {
  approveReportAction,
  banUserAndApproveAction,
  rejectReportAction,
  requestReportProofAction,
  warnUserAndApproveAction,
} from "@/action/admin/report-workflow.action";
import { pushToast } from "@/lib/toastStore";
import ManageAccountStatusModal from "../../_components/ManageAccountStatusComponent";
import ConfirmActionModal from "./ConfirmActionModalComponent";
import RequestMoreProofModal from "./RequestMoreProofComponent";
import type { AccountStatus } from "./ShareComponent";

type ConfirmActionKind = "APPROVE" | "REJECT";

interface ConfirmConfig {
  kind: ConfirmActionKind;
  title: string;
  message: string;
  confirmLabel: string;
  tone: "default" | "danger";
  toastTitle: string;
  toastMessage: string;
}

type ActionVariant = "primary" | "warning" | "danger" | "outline";

interface ActionButtonProps {
  variant: ActionVariant;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}

const VARIANT_STYLES: Record<ActionVariant, string> = {
  primary:
    "bg-emerald-700 text-white hover:bg-emerald-800 disabled:bg-stone-200 disabled:text-stone-400",
  warning:
    "bg-amber-400 text-stone-900 hover:bg-amber-500 disabled:bg-stone-200 disabled:text-stone-400",
  danger:
    "bg-red-500 text-white hover:bg-red-600 disabled:bg-stone-200 disabled:text-stone-400",
  outline:
    "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:text-stone-400",
};

function ActionButton({ variant, icon, onClick, disabled, children }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${VARIANT_STYLES[variant]}`}
    >
      {icon}
      {children}
    </button>
  );
}

interface ReportedUser {
  full_name: string;
  avatar_url?: string;
}

interface ReportActionPanelProps {
  reportId: string;
  status: AdminReportIssueStatus;
  reportedUserId: string;
  reportedUser: ReportedUser;
}

export default function ReportActionPanel({
  reportId,
  status,
  reportedUserId,
  reportedUser,
}: ReportActionPanelProps) {
  const router = useRouter();
  const isClosed =
    status === "APPROVED" ||
    status === "REJECTED";
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [initialStatus, setInitialStatus] = useState<AccountStatus>("WARNING");
  const [pendingConfirm, setPendingConfirm] = useState<ConfirmConfig | null>(null);
  const [requestProofOpen, setRequestProofOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Runs a workflow server action, then toasts the outcome and refreshes.
  // On success the admin is sent back to the list; on failure they stay put.
  const runAction = async (
    action: () => Promise<{ success: boolean; error?: string }>,
    success: { title: string; message: string },
    failureTitle: string,
  ) => {
    setIsPending(true);
    try {
      const result = await action();

      if (!result.success) {
        pushToast({
          title: failureTitle,
          message: result.error ?? "Something went wrong. Please try again.",
          variant: "error",
        });
        return;
      }

      pushToast({
        title: success.title,
        message: success.message,
        variant: "success",
      });
      router.push("/report-management");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  const handleRequestProofSubmit = (message: string) => {
    setRequestProofOpen(false);
    void runAction(
      () => requestReportProofAction(reportId, message),
      {
        title: "Proof Requested",
        message: `${reportedUser.full_name}'s report has been marked as Waiting Proof.`,
      },
      "Request Proof failed",
    );
  };

  const openApproveConfirm = () => {
    setPendingConfirm({
      kind: "APPROVE",
      title: "Approve this report?",
      message:
        "Marking this report as approved will close the dispute in the reporter's favor. This action cannot be undone.",
      confirmLabel: "Yes, Approve",
      tone: "default",
      toastTitle: "Report Approved",
      toastMessage: "The report has been approved and the dispute is now closed.",
    });
  };

  const openRejectConfirm = () => {
    setPendingConfirm({
      kind: "REJECT",
      title: "Reject this report?",
      message:
        "Marking this report as rejected will dismiss the dispute. This action cannot be undone.",
      confirmLabel: "Yes, Reject",
      tone: "danger",
      toastTitle: "Report Rejected",
      toastMessage: "The report has been rejected and dismissed.",
    });
  };

  const handleConfirm = () => {
    if (!pendingConfirm) return;
    const { kind, toastTitle, toastMessage } = pendingConfirm;
    setPendingConfirm(null);
    void runAction(
      () =>
        kind === "APPROVE"
          ? approveReportAction(reportId)
          : rejectReportAction(reportId),
      { title: toastTitle, message: toastMessage },
      kind === "APPROVE" ? "Approve failed" : "Reject failed",
    );
  };

  const openStatusModal = (preset: AccountStatus) => {
    setInitialStatus(preset);
    setStatusModalOpen(true);
  };

  const handleStatusSubmit = async ({
    status: newStatus,
    reason,
  }: {
    status: AccountStatus;
    reason: string;
  }) => {
    if (newStatus === "WARNING") {
      await runAction(
        () => warnUserAndApproveAction(reportId, reportedUserId, reason),
        {
          title: "Warning Issued",
          message: `${reportedUser.full_name} has been suspended and the report approved.`,
        },
        "Warning failed",
      );
    } else if (newStatus === "BANNED") {
      await runAction(
        () => banUserAndApproveAction(reportId, reportedUserId, reason),
        {
          title: "Account Banned",
          message: `${reportedUser.full_name} has been banned and the report approved.`,
        },
        "Ban failed",
      );
    }
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
        Report Action
      </p>
      <div className="mt-3 flex flex-col gap-2">
        <ActionButton
          variant="primary"
          icon={<ArrowPathIcon className="h-4 w-4" />}
          onClick={() => setRequestProofOpen(true)}
          disabled={isPending || isClosed || status === "WAITING_PROOF"}
        >
          Request Proof
        </ActionButton>
        <ActionButton
          variant="warning"
          icon={<ExclamationTriangleIcon className="h-4 w-4" />}
          onClick={() => openStatusModal("WARNING")}
          disabled={isPending || isClosed}
        >
          Warning Account
        </ActionButton>
        <ActionButton
          variant="danger"
          icon={<NoSymbolIcon className="h-4 w-4" />}
          onClick={() => openStatusModal("BANNED")}
          disabled={isPending || isClosed}
        >
          Banned Account
        </ActionButton>
        <ActionButton
          variant="outline"
          icon={<StopCircleIcon className="h-4 w-4" />}
          onClick={openApproveConfirm}
          disabled={isPending || isClosed}
        >
          Approve
        </ActionButton>
        <ActionButton
          variant="outline"
          icon={<XCircleIcon className="h-4 w-4" />}
          onClick={openRejectConfirm}
          disabled={isPending || isClosed}
        >
          Rejected
        </ActionButton>
      </div>

      <ManageAccountStatusModal
        open={statusModalOpen}
        user={reportedUser}
        initialStatus={initialStatus}
        onClose={() => setStatusModalOpen(false)}
        onSubmit={handleStatusSubmit}
      />

      <ConfirmActionModal
        open={pendingConfirm !== null}
        title={pendingConfirm?.title ?? ""}
        message={pendingConfirm?.message ?? ""}
        confirmLabel={pendingConfirm?.confirmLabel}
        tone={pendingConfirm?.tone}
        onConfirm={handleConfirm}
        onCancel={() => setPendingConfirm(null)}
      />

      <RequestMoreProofModal
        open={requestProofOpen}
        onClose={() => setRequestProofOpen(false)}
        onSubmit={handleRequestProofSubmit}
      />
    </div>
  );
}
