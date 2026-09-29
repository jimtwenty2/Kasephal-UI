"use client";

import { useEffect } from "react";
import { CheckBadgeIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import type { AdminRequestPaymentRequester } from "@/types/admin/requestPayment";
import AdminAvatar from "../../_components/AdminAvatar";

interface RequestByDetailModalProps {
  open: boolean;
  user: AdminRequestPaymentRequester;
  onClose: () => void;
}

export default function RequestByDetailModal({
  open,
  user,
  onClose,
}: RequestByDetailModalProps) {
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const roleLabel = user.role.charAt(0) + user.role.slice(1).toLowerCase();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-by-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-stone-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <AdminAvatar
              src={user.profileUrl}
              name={user.name}
              sizeClassName="h-12 w-12"
              textClassName="text-base"
              imageSizes="48px"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h2
                  id="request-by-detail-title"
                  className="truncate text-lg font-bold text-stone-900"
                >
                  {user.name}
                </h2>
                <CheckBadgeIcon className="h-5 w-5 flex-shrink-0 text-emerald-600" />
              </div>
              <p className="text-xs text-stone-500">{roleLabel}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <InfoItem label="User ID" value={user.userId} />
            <InfoItem label="Full Name" value={user.name} />
            <InfoItem label="Role" value={roleLabel} />
            <InfoItem label="Bakong Account" value={user.bakongAccountId} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
        {label}
      </p>
      <p className="break-words text-sm font-medium text-stone-800">
        {value ?? "N/A"}
      </p>
    </div>
  );
}
