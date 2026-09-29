"use client";

import Modal from "../shared/Modal";
import MarketPriceForm from "../forms/MarketPriceForm";
import { Crop, CropType } from "@/types/cropType";
import { AdministrativeLocation } from "@/services/locationFilter.service";
import { useMarketPriceText } from "../marketPriceText";

interface Props {
  open: boolean;
  onClose: () => void;

  cropTypes: CropType[];
  crops: Crop[];
  provinces: AdministrativeLocation[];
}

export default function AddMarketPriceModal({
  open,
  onClose,
  cropTypes,
  crops,
  provinces,
}: Props) {
  const { t } = useMarketPriceText();

  return (
    <Modal open={open} title={t("market.modal.addMarketPrice")} onClose={onClose}>
      {/* <MarketPriceForm onCancel={onClose} /> */}
      <MarketPriceForm
        cropTypes={cropTypes}
        crops={crops}
        provinces={provinces}
        onCancel={onClose}
      />
    </Modal>
  );
}
