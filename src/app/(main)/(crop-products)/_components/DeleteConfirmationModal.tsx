"use client";

import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

type DeleteConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName?: string;
  isDeleting?: boolean;
};

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
  isDeleting = false,
}: DeleteConfirmationModalProps) {
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      {/* Backdrop - blocks interaction with everything behind */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative z-[100000] w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
          disabled={isDeleting}
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>

        {/* Title */}
        <h2 className="mb-2 text-xl font-bold text-slate-900">
          Delete Product
        </h2>

        {/* Message */}
        <p className="mb-6 text-sm text-slate-600">
          Are you sure you want to delete {productName ? `"${productName}"` : "this product"}? This action cannot be undone.
        </p>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
