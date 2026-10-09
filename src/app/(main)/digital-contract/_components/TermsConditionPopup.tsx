"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useEffect } from "react";
import { createPortal } from "react-dom";

import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

type Props = {
  open: boolean;
  onClose: () => void;
};

const TERMS = [
  {
    title: "Delivery Condition",
    description:
      "The farmer must prepare and deliver the crop according to the agreed delivery date, quantity, and location. If delivery may be delayed because of weather, transport, or stock issues, the farmer should inform the buyer as early as possible through chat.",
  },
  {
    title: "Quality Standard",
    description:
      "The crop should match the agreed crop type, unit, quantity, and expected market quality. The farmer should not mix damaged, spoiled, or unrelated produce with the agreed crop. The buyer should inspect the crop fairly based on the contract terms.",
  },
  {
    title: "Payment Condition",
    description:
      "The buyer must pay the agreed deposit before the order proceeds. The remaining balance should be paid after the agreed delivery or confirmation stage. Both parties should keep payment proof, transaction references, and chat records until the trade is completed.",
  },
  {
    title: "Cancellation Policy",
    description:
      "Either party may request cancellation before major preparation, payment, or delivery work has started. If cancellation happens after one party has already spent time, money, or transport cost, both parties should discuss a fair solution before closing the trade.",
  },
  {
    title: "Penalty / Compensation",
    description:
      "If one party fails to follow the agreed terms without a valid reason, the affected party may request fair compensation. Compensation should be based on actual loss, such as transport cost, rejected crop quantity, late delivery impact, or payment delay.",
  },
  {
    title: "Dispute Handling",
    description:
      "If a problem happens, both parties should first discuss it politely in chat and share clear evidence such as photos, receipts, delivery records, and payment proof. If they cannot agree, the saved contract and chat history can be used for further review.",
  },
];

export default function TermsConditionPopup({ open, onClose }: Props) {
  useBodyScrollLock(open);

  // Close on Escape while the popup is open.
  useEffect(() => {
    if (!open || typeof document === "undefined") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="scrollbar-hide max-h-[85vh] w-full max-w-[760px] overscroll-contain overflow-y-auto rounded-[28px] bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-primary/10 bg-primary/5">
              <Image
                src="/assets/logo-green.png"
                alt="Kasephal"
                fill
                sizes="48px"
                className="object-contain p-2"
                priority={false}
              />
            </div>

            <h2 className="text-[30px] font-medium text-primary-heading">
              Terms &amp; Conditions
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-description-text transition hover:bg-gray-100"
          >
            <XMarkIcon className="h-7 w-7" />
          </button>
        </div>

        <p className="mt-2 text-[15px] font-medium text-description-text">
          Please review all agreement terms carefully before accepting this
          digital contract.
        </p>

        {/* Terms */}
        <div className="mt-6 space-y-3">
          {TERMS.map((term, index) => (
            <div
              key={term.title}
              className="flex gap-3 rounded-2xl border border-light-grey bg-[#FAFAF7] p-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[16px] font-medium text-primary">
                {index + 1}
              </div>

              <div>
                <p className="text-[16px] font-semibold text-primary-heading">
                  {term.title}
                </p>

                <p className="mt-1 text-[15px] font-medium leading-relaxed text-description-text">
                  {term.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-7 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-[56px] rounded-2xl bg-primary px-10 text-[18px] font-medium text-white transition hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
