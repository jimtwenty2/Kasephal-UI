"use client";

import { LogOut } from "lucide-react";
import { createPortal } from "react-dom";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

type LogoutConfirmModalProps = {
  open: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function LogoutConfirmModal({
  open,
  isSubmitting = false,
  onClose,
  onConfirm,
}: LogoutConfirmModalProps) {
  useBodyScrollLock(open);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-confirm-title"
      aria-describedby="logout-confirm-description"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 px-4 backdrop-blur-[2px]"
    >
      <button
        type="button"
        aria-label="Close logout confirmation"
        className="absolute inset-0 cursor-default"
        onClick={isSubmitting ? undefined : onClose}
      />

      <div className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/20">
        <div className="px-6 pt-6">
          <div className="flex items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 ring-8 ring-red-50/60">
              <LogOut className="h-6 w-6" />
            </div>
          </div>

          <h2
            id="logout-confirm-title"
            className="mt-5 text-[22px] font-bold text-primary-heading"
          >
            Logout from Kasephal?
          </h2>
          <p
            id="logout-confirm-description"
            className="mt-2 text-[15px] leading-6 text-description-text"
          >
            You will need to login again to access your dashboard, orders, and
            account tools.
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-[14px] font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Stay logged in
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-red-500 px-5 text-[14px] font-semibold text-white transition hover:bg-red-600 disabled:cursor-wait disabled:opacity-70"
          >
            {isSubmitting ? "Logging out..." : "Yes, logout"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
