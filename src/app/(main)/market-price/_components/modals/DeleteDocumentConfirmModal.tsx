"use client";

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending?: boolean;
  title: string;
  message: string;
}

export default function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  isPending,
  title,
  message,
}: DeleteConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] rounded-[20px] bg-white p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-center text-[28px] font-bold text-primary-heading">
          {title}
        </h2>

        <p className="mb-8 text-center text-[18px] text-secondary-body">
          {message}
        </p>

        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="h-12 min-w-[120px] rounded-[14px] bg-[#9E9E9E] px-6 text-[18px] font-medium text-white"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="h-12 min-w-[120px] rounded-[14px] bg-[#FF3131] px-6 text-[18px] font-medium text-white"
          >
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
