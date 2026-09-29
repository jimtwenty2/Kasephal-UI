import { ArrowPathIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

type Props = {
  isLoading?: boolean;
  // Blocks submit regardless of loading (e.g. escrow has no funds to request).
  disabled?: boolean;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
};

export default function WithdrawalActions({
  isLoading = false,
  disabled = false,
  submitText = "SUBMIT REQUEST",
  cancelText = "CANCEL",
  onCancel,
}: Props) {
  return (
    <div className="mt-8 flex items-center justify-end gap-4">
      {/* Cancel */}
      <button
        type="button"
        onClick={onCancel}
        className="flex h-[50px] items-center justify-center rounded-[12px] border border-light-grey px-6 text-[14px] font-bold text-secondary-body transition hover:bg-[#F7F9FB]"
      >
        {cancelText}
      </button>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || disabled}
        className="flex h-[50px] items-center justify-center gap-2 rounded-[12px] bg-secondary px-6 text-[14px] font-bold text-primary-heading transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <ArrowPathIcon className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CheckCircleIcon className="h-5 w-5" />
            {submitText}
          </>
        )}
      </button>
    </div>
  );
}
