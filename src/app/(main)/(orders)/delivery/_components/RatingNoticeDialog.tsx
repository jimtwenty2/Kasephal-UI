"use client";

import { useEffect } from "react";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useI18n } from "@/lib/i18n/I18nContext";

const TEXT = {
  close: { en: "Close", kh: "បិទ" },
  ok: { en: "OK", kh: "យល់ព្រម" },
} as const;

type Language = keyof (typeof TEXT)[keyof typeof TEXT];
type TextKey = keyof typeof TEXT;

function getText(language: Language) {
  return (key: TextKey) => TEXT[key][language] ?? TEXT[key].en;
}

interface RatingNoticeDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function RatingNoticeDialog({
  open,
  title,
  message,
  onClose,
}: RatingNoticeDialogProps) {
  const { language } = useI18n();
  const t = getText(language as Language);

  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);

    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rating-notice-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label={t("close")}
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between px-6 pb-3 pt-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
            </span>

            <h2
              id="rating-notice-dialog-title"
              className="text-lg font-bold text-stone-900"
            >
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <p className="px-6 pb-6 text-sm text-stone-600">{message}</p>

        <div className="flex justify-end gap-3 border-t border-stone-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-emerald-700 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
          >
            {t("ok")}
          </button>
        </div>
      </div>
    </div>
  );
}