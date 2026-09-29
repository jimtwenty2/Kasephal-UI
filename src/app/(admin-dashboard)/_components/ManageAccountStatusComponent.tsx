"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  NoSymbolIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AccountStatus } from "../report-management/_components/ShareComponent";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import AdminAvatar from "./AdminAvatar";
interface UserSummary {
  full_name: string;
  avatar_url?: string;
}

interface ManageAccountStatusModalProps {
  open: boolean;
  user: UserSummary;
  /** The status preselected when the modal opens. Defaults to "WARNING". */
  initialStatus?: AccountStatus;
  onClose: () => void;
  onSubmit: (data: {
    status: AccountStatus;
    reason: string;
  }) => void | Promise<void>;
}

// ─── Status option metadata ─────────────────────────────────────────────────

interface StatusOptionMeta {
  value: AccountStatus;
  title: string;
  description: string;
  icon: typeof CheckCircleIcon;
  iconColor: string;
  selectedRing: string;
  indicatorColor: string;
  submitButtonClass: string;
  submitLabel: string;
  reasonLabel: string;
  reasonPlaceholder: string;
  reasonRequired: boolean;
}

const STATUS_OPTIONS: StatusOptionMeta[] = [
  {
    value: "ACTIVE",
    title: "Active",
    description: "Restore full access to all features.",
    icon: CheckCircleIcon,
    iconColor: "text-emerald-600",
    selectedRing: "border-emerald-300 ring-1 ring-emerald-200",
    indicatorColor: "bg-emerald-600",
    submitButtonClass: "bg-emerald-600 text-white hover:bg-emerald-700",
    submitLabel: "Activate Account",
    reasonLabel: "Activation Note",
    reasonPlaceholder: "Optional note about restoring this account…",
    reasonRequired: false,
  },
  {
    value: "WARNING",
    title: "Warning",
    description: "Send a formal notice without blocking.",
    icon: ExclamationTriangleIcon,
    iconColor: "text-amber-500",
    selectedRing: "border-amber-300 ring-1 ring-amber-200",
    indicatorColor: "bg-amber-500",
    submitButtonClass: "bg-amber-400 text-stone-900 hover:bg-amber-500",
    submitLabel: "Warning Account",
    reasonLabel: "Warning Reason",
    reasonPlaceholder: "Explain the reason for issuing this warning…",
    reasonRequired: true,
  },
  {
    value: "BANNED",
    title: "Banned",
    description: "Restrict access temporarily or permanently.",
    icon: NoSymbolIcon,
    iconColor: "text-red-500",
    selectedRing: "border-red-300 ring-1 ring-red-200",
    indicatorColor: "bg-red-500",
    submitButtonClass: "bg-red-500 text-white hover:bg-red-600",
    submitLabel: "Ban Account",
    reasonLabel: "Ban Reason",
    reasonPlaceholder: "Explain the reason for banning this account…",
    reasonRequired: true,
  },
];

// ─── Sub-components ─────────────────────────────────────────────────────────

interface StatusOptionCardProps {
  option: StatusOptionMeta;
  selected: boolean;
  onSelect: () => void;
}

function StatusOptionCard({
  option,
  selected,
  onSelect,
}: StatusOptionCardProps) {
  const Icon = option.icon;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`relative flex flex-col items-start rounded-xl border bg-white p-4 text-left transition-all ${
        selected
          ? `${option.selectedRing} shadow-md`
          : "border-stone-200 opacity-70 hover:opacity-100"
      }`}
    >
      <span className="absolute right-3 top-3">
        {selected ? (
          <span
            className={`flex h-4 w-4 items-center justify-center rounded-full ${option.indicatorColor}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          </span>
        ) : (
          <span className="block h-4 w-4 rounded-full border-2 border-stone-300" />
        )}
      </span>

      <Icon className={`h-6 w-6 ${option.iconColor}`} />
      <p className="mt-2 text-base font-bold text-stone-900">{option.title}</p>
      <p className="mt-1 text-xs leading-relaxed text-stone-500">
        {option.description}
      </p>
    </button>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export default function ManageAccountStatusModal(
  props: ManageAccountStatusModalProps,
) {
  if (!props.open) return null;
  return <ManageAccountStatusModalContent {...props} />;
}

type ModalContentProps = Omit<ManageAccountStatusModalProps, "open">;

function ManageAccountStatusModalContent({
  user,
  initialStatus = "WARNING",
  onClose,
  onSubmit,
}: ModalContentProps) {
  const [status, setStatus] = useState<AccountStatus>(initialStatus);
  const [reason, setReason] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeOption = useMemo(
    () => STATUS_OPTIONS.find((o) => o.value === status) ?? STATUS_OPTIONS[1],
    [status],
  );

  useBodyScrollLock(true);

  // Handle Escape while open.
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [submitting, onClose]);

  const reasonInvalid =
    activeOption.reasonRequired && reason.trim().length === 0;
  const submitDisabled = submitting || reasonInvalid;

  const handleSubmit = async () => {
    if (submitDisabled) return;
    try {
      setSubmitting(true);
      await onSubmit({ status, reason: reason.trim() });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="manage-status-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        onClick={() => !submitting && onClose()}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pb-4 pt-6">
          <div>
            <h2
              id="manage-status-title"
              className="text-xl font-bold text-stone-900"
            >
              Manage Account Status
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Update the standing of this user account.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 disabled:cursor-not-allowed"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* User card */}
        <div className="border-y border-stone-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <AdminAvatar
              src={user.avatar_url}
              name={user.full_name}
              sizeClassName="h-10 w-10"
              textClassName="text-sm"
              imageSizes="40px"
            />
            <p className="text-base font-semibold text-stone-900">
              {user.full_name}
            </p>
          </div>
        </div>

        {/* Status options */}
        <div className="px-6 pt-5">
          <p className="text-sm font-bold text-stone-900">Select New Status</p>
          <div
            role="radiogroup"
            aria-label="Account status"
            className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3"
          >
            {STATUS_OPTIONS.map((opt) => (
              <StatusOptionCard
                key={opt.value}
                option={opt}
                selected={status === opt.value}
                onSelect={() => {
                  setStatus(opt.value);
                  // Focus the textarea right after switching so the admin can type.
                  requestAnimationFrame(() => textareaRef.current?.focus());
                }}
              />
            ))}
          </div>
        </div>

        {/* Reason */}
        <div className="px-6 pt-5">
          <label
            htmlFor="status-reason"
            className="block text-sm font-bold text-stone-900"
          >
            {activeOption.reasonLabel}
            {activeOption.reasonRequired && (
              <span className="ml-1 text-red-500">*</span>
            )}
          </label>
          <textarea
            id="status-reason"
            ref={textareaRef}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={activeOption.reasonPlaceholder}
            rows={4}
            className="mt-2 w-full resize-none rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 placeholder:text-stone-400 focus:border-emerald-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-200"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-full border border-stone-200 bg-white px-6 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitDisabled}
            className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400 ${activeOption.submitButtonClass}`}
          >
            {submitting ? "Submitting…" : activeOption.submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
