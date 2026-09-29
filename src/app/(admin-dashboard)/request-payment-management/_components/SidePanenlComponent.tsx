"use client";

import { useEffect, type ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  /** Panel content. Empty for now — a real component slots in here later. */
  children?: ReactNode;
  /** Panel width. Defaults to a comfortable detail-panel width. */
  widthClass?: string;
}

export default function SidePanel({
  open,
  onClose,
  children,
  widthClass = "w-full max-w-md",
}: SidePanelProps) {
  useBodyScrollLock(open);

  // Close on Escape while open.
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Blurred backdrop */}
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
      />

      {/* Panel — white, empty, ready for content */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 flex h-full flex-col bg-white shadow-xl ${widthClass}`}
      >
        {/* Close control — kept so the empty panel is still dismissible */}
        <div className="flex justify-end p-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content slot — empty for now */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
