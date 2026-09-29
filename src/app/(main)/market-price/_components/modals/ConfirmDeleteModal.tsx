"use client";

import Modal from "../shared/Modal";
import { useMarketPriceText } from "../marketPriceText";

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  loading = false,
}: ConfirmDeleteModalProps) {
  const { t, fontClass } = useMarketPriceText();

  return (
    <Modal open={open} onClose={onClose} title="">
      <div className={`py-2 text-center ${fontClass}`}>
        <h2 className="mb-4 text-[32px] font-bold text-primary-heading">
          {t("market.confirm.deleteThis")}
        </h2>

        <p className="mb-10 text-[18px] text-secondary-body">
          {t("market.confirm.deleteItem")}
        </p>

        <div className="flex justify-center gap-5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-12 w-[118px] rounded-[12px] bg-[#8D8D8D] text-[18px] font-medium text-white"
          >
            {t("market.action.cancel")}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="h-12 w-[118px] rounded-[12px] bg-[#FF3131] text-[18px] font-medium text-white"
          >
            {loading ? t("market.action.deleting") : t("market.action.delete")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
