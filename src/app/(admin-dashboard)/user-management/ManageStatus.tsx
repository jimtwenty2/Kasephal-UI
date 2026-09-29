"use client";

import { useEffect, useMemo, useState } from "react";
import { Ban, CheckCircle, TriangleAlert, X } from "lucide-react";
import type { User } from "../../../types/adminType";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import AdminAvatar from "../_components/AdminAvatar";

interface ManageAccountStatusModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSubmit?: (data: {
    userId: string;
    status: string;
    reason: string;
  }) => void;
}

const STATUS_OPTIONS = [
  {
    value: "Active",
    title: "Active",
    description: "Restore full access to all features.",
    icon: CheckCircle,
    iconColor: "text-emerald-600",
    selectedRing: "border-emerald-300 ring-1 ring-emerald-200",
    submitClass: "bg-emerald-600 text-white hover:bg-emerald-700",
    submitLabel: "Activate Account",
    reasonLabel: "Activation Note",
    reasonPlaceholder: "Optional note about restoring this account...",
    reasonRequired: false,
  },
  {
    value: "Suspended",
    title: "Suspended",
    description: "Temporarily block access while the account is under review.",
    icon: TriangleAlert,
    iconColor: "text-amber-500",
    selectedRing: "border-amber-300 ring-1 ring-amber-200",
    submitClass: "bg-amber-400 text-stone-900 hover:bg-amber-500",
    submitLabel: "Suspend Account",
    reasonLabel: "Suspension Reason",
    reasonPlaceholder:
      "Explain the reason for suspending this account...",
    reasonRequired: true,
  },
  {
    value: "Banned",
    title: "Banned",
    description: "Block account access permanently.",
    icon: Ban,
    iconColor: "text-red-500",
    selectedRing: "border-red-300 ring-1 ring-red-200",
    submitClass: "bg-red-500 text-white hover:bg-red-600",
    submitLabel: "Ban Account",
    reasonLabel: "Ban Reason",
    reasonPlaceholder:
      "Explain the reason for banning this account...",
    reasonRequired: true,
  },
] as const;

function normalizeStatus(value?: string | null) {
  if (value === "Suspend") return "Suspended";
  return value ?? "";
}

export default function Managetatus({
  isOpen,
  user,
  onClose,
  onSubmit,
}: ManageAccountStatusModalProps) {
  const [status, setStatus] = useState<string>("");
  const [reason, setReason] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  useBodyScrollLock(isOpen && !!user);

  useEffect(() => {
    if (!isOpen || !user) return;
    setStatus("");
    setReason("");
    setSubmitAttempted(false);
  }, [isOpen, user]);

  const activeOption = useMemo(() => {
    return (
      STATUS_OPTIONS.find(
        (option) => option.value === status
      ) ?? STATUS_OPTIONS[0]
    );
  }, [status]);

  if (!isOpen || !user) return null;

  const currentStatus = normalizeStatus(user.status);
  const isReasonInvalid =
    Boolean(status) && activeOption.reasonRequired && !reason.trim();
  const showReasonError = isReasonInvalid && submitAttempted;
  const isCurrentStatusSelected = status === currentStatus;
  const isSubmitDisabled = !status || isCurrentStatusSelected;

  const handleSubmit = () => {
    setSubmitAttempted(true);
    if (isSubmitDisabled || isReasonInvalid) return;

    onSubmit?.({
      userId: user.user_id,
      status,
      reason: reason.trim(),
    });

    setReason("");
    onClose();
  };

  const handleClose = () => {
    setReason("");
    setStatus("");
    setSubmitAttempted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between px-7 pb-5 pt-7">
          <div>
            <h2 className="text-[24px] font-bold leading-7 text-primary-heading">
              Manage Account Status
            </h2>

            <p className="mt-1.5 text-[15px] font-medium text-description-text">
              Update the standing of this user account.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-description hover:bg-slate-100 hover:text-primary-heading"
          >
            <X size={22} />
          </button>
        </div>

        <div className="border-y border-slate-100 px-7 py-5">
          <div className="flex items-center gap-4">
            <AdminAvatar
              src={user.profile}
              name={user.name}
              sizeClassName="h-13 w-13"
              textClassName="text-lg"
              imageSizes="52px"
            />

            <div>
              <p className="text-[18px] font-bold leading-6 text-primary-heading">
                {user.name}
              </p>

              <p className="mt-0.5 text-[15px] font-medium text-description-text">
                {user.email}
              </p>
              <p className="mt-1 text-[13px] font-semibold text-description-text">
                Current status:{" "}
                <span className="text-primary-heading">{user.status}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="px-7 pt-6">
          <p className="text-[15px] font-bold text-primary-heading">
            Select New Status
          </p>

          <div className="mt-3.5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STATUS_OPTIONS.map((option) => {
              const Icon = option.icon;
              const selected = status === option.value;
              const isCurrent = option.value === currentStatus;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    if (isCurrent) return;
                    setStatus(option.value);
                    setSubmitAttempted(false);
                  }}
                  disabled={isCurrent}
                  className={`relative min-h-[136px] rounded-xl border bg-white p-5 text-left transition-all ${
                    isCurrent
                      ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-50"
                      : selected
                      ? `${option.selectedRing} shadow-md`
                      : "border-slate-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Icon
                    className={`h-7 w-7 ${option.iconColor}`}
                  />

                  <p className="mt-3 text-[17px] font-bold leading-5 text-primary-heading">
                    {option.title}
                  </p>

                  <p className="mt-1.5 text-[13px] font-medium leading-5 text-description-text">
                    {isCurrent ? "This is the current account status." : option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-7 pt-6">
          <label className="block text-[15px] font-bold text-primary-heading">
            {status ? activeOption.reasonLabel : "Reason"}

            {activeOption.reasonRequired && (
              <span className="ml-1 text-red-500">*</span>
            )}
          </label>

          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (submitAttempted) setSubmitAttempted(false);
            }}
            placeholder={activeOption.reasonPlaceholder}
            rows={4}
            className="mt-2.5 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[15px] font-medium leading-6 outline-none placeholder:text-slate-400 focus:border-primary focus:bg-white"
          />

          {showReasonError && (
            <p className="mt-1.5 text-[13px] font-medium text-red-500">
              Reason is required.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 px-7 py-6">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full border border-slate-200 bg-white px-7 py-2.5 text-[15px] font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`rounded-full px-7 py-2.5 text-[15px] font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 ${activeOption.submitClass}`}
          >
            {activeOption.submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
