"use client";

import { useEffect, useRef, useState } from "react";
import {
  DocumentMagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface RequestMoreProofModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void | Promise<void>;
}

export default function RequestMoreProofModal(props: RequestMoreProofModalProps) {
  if (!props.open) return null;
  return <RequestMoreProofModalContent {...props} />;
}

type ContentProps = Omit<RequestMoreProofModalProps, "open">;

function RequestMoreProofModalContent({ onClose, onSubmit }: ContentProps) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useBodyScrollLock(true);

  useEffect(() => {
    requestAnimationFrame(() => textareaRef.current?.focus());

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [submitting, onClose]);

  const messageInvalid = message.trim().length === 0;
  const submitDisabled = submitting || messageInvalid;

  const handleSubmit = async () => {
    if (submitDisabled) return;
    try {
      setSubmitting(true);
      await onSubmit(message.trim());
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-proof-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close modal"
        onClick={() => !submitting && onClose()}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between px-6 pb-3 pt-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <DocumentMagnifyingGlassIcon className="h-6 w-6 text-emerald-700" />
            </span>
            <div>
              <h2
                id="request-proof-title"
                className="text-lg font-bold text-stone-900"
              >
                Request More Proof
              </h2>
              <p className="mt-0.5 text-sm text-stone-500">
                Ask the reporter to submit additional evidence.
              </p>
            </div>
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

        <div className="px-6 pt-3">
          <label
            htmlFor="request-proof-message"
            className="block text-sm font-bold text-stone-900"
          >
            What additional proof do you need?
            <span className="ml-1 text-red-500">*</span>
          </label>
          <textarea
            id="request-proof-message"
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe what additional images or evidence the reporter should provide…"
            rows={5}
            className="mt-2 w-full resize-none rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 placeholder:text-stone-400 focus:border-emerald-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-200"
          />
        </div>

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
            className="rounded-full bg-emerald-700 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
          >
            {submitting ? "Submitting…" : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
