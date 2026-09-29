import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

type RequestChangePopupProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { suggestedPrice: string; comment: string }) => void;
};

export default function RequestChangePopup({
  open,
  onClose,
  onSubmit,
}: RequestChangePopupProps) {
  const [mounted, setMounted] = useState(false);

  useBodyScrollLock(open);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative z-[100000] w-full max-w-[760px] rounded-[28px] bg-white p-8 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-[30px] font-medium text-primary-heading">
            Submit Change Request
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-description-text"
          >
            <XMarkIcon className="h-7 w-7" />
          </button>
        </div>

        {/* Form */}
        <form
          className="mt-8"
          onSubmit={(e) => {
            e.preventDefault();

            const formData = new FormData(e.currentTarget);

            onSubmit({
              suggestedPrice: String(formData.get("suggestedPrice") || ""),
              comment: String(formData.get("comment") || ""),
            });
          }}
        >
          <label className="mb-4 block text-[24px] font-medium leading-snug text-primary">
            <span className="text-red-500">*</span> Please specify your
            requested change or comments for the contract
          </label>

          <input
            name="suggestedPrice"
            placeholder="Suggested price"
            className="h-[64px] w-full rounded-2xl border border-light-grey px-6 text-[22px] font-medium text-primary-heading outline-none focus:border-primary"
          />

          <textarea
            name="comment"
            placeholder="Write your requested change here..."
            className="mt-5 min-h-[190px] w-full resize-none rounded-2xl border border-light-grey p-6 text-[18px] font-medium text-primary-heading outline-none focus:border-primary"
          />

          <div className="mt-7 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="h-[60px] rounded-2xl border border-primary px-10 text-[20px] font-medium text-primary"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="h-[60px] rounded-2xl bg-secondary px-10 text-[20px] font-medium text-primary-heading"
            >
              Submit Change Request
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
