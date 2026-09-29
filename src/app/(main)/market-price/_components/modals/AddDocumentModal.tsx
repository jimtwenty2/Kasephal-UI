"use client";
import Modal from "../shared/Modal";
import DocumentUploadForm from "../forms/DocumentUploadForm";
import { useMarketPriceText } from "../marketPriceText";
import { OfficialDocument } from "@/types/official-document";
interface AddDocumentModalProps {
  open: boolean;
  onClose: () => void;
  officialDocuments: OfficialDocument[];
}
export default function AddDocumentModal({
  open,
  onClose,
  officialDocuments,
}: AddDocumentModalProps) {
  const { t } = useMarketPriceText();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("market.modal.uploadDocument")}
    >
     <DocumentUploadForm
        onCancel={onClose}
        existingTitles={officialDocuments.map((doc) =>
          doc.title.toLowerCase().trim(),
        )}
      />
    </Modal>
  );
}
