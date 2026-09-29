"use client";

import { useEffect } from "react";
import { QuestionMarkCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

type ConfirmTone = "default" | "danger";

interface ConfirmActionModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  onConfirm: () => void;
  onCancel: () => void;
}

const CONFIRM_BUTTON_TONE: Record<ConfirmTone, string> = {
  default: "bg-emerald-700 text-white hover:bg-emerald-800",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

export default function ConfirmActionModal({
  open,
  title,
  message,
  confirmLabel = "Yes, Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  onConfirm,
  onCancel,
}: ConfirmActionModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-action-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onCancel}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between px-6 pb-3 pt-6">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                tone === "danger" ? "bg-red-100" : "bg-emerald-100"
              }`}
            >
              <QuestionMarkCircleIcon
                className={`h-6 w-6 ${
                  tone === "danger" ? "text-red-600" : "text-emerald-700"
                }`}
              />
            </span>
            <h2
              id="confirm-action-title"
              className="text-lg font-bold text-stone-900"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <p className="px-6 pb-6 text-sm text-stone-600">{message}</p>

        <div className="flex justify-end gap-3 border-t border-stone-100 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-stone-200 bg-white px-6 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${CONFIRM_BUTTON_TONE[tone]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
