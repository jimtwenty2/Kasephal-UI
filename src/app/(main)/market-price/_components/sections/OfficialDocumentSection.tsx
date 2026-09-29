"use client";

import { useState, useMemo, useEffect } from "react";
import DateRangePicker from "../../../../../components/filters/DateRangePicker";
import { DocumentItem } from "@/types/document";
import Pagination from "../Pagination";
import DocumentCard from "../DocumentCard";
import { OfficialDocument } from "@/types/official-document";
import SearchInput from "@/components/filters/SearchInput";
import ActionButton from "@/components/common/ActionButton";
import AddDocumentModal from "../modals/AddDocumentModal";
import { mapOfficialDocumentsToCards } from "@/utils/official-document.mapper";
import RefreshButton from "../RefreshButton";
import { useTransition } from "react";

import EditDocumentModal from "../modals/EditDocumentModal";

import { pushToast } from "@/lib/toastStore";

import { updateOfficialDocumentAction } from "../../actions/update-official-document.action";
import { deleteOfficialDocumentAction } from "../../actions/delete-official-document.action";
import { useRouter } from "next/navigation";
import { useMarketPriceText } from "../marketPriceText";
import DeleteConfirmModal from "../modals/DeleteDocumentConfirmModal";


const DOCS_PER_PAGE = 12;

interface DocumentsSectionProps {
  officialDocuments: OfficialDocument[];
  isGovernment: boolean;
}

export default function DocumentsSection({
  officialDocuments,
  isGovernment,
}: DocumentsSectionProps) {
  const { t, fontClass } = useMarketPriceText();
  const [documents, setDocuments] = useState(
    mapOfficialDocumentsToCards(officialDocuments),
  );
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(
    null,
  );

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  useEffect(() => {
    setDocuments(mapOfficialDocumentsToCards(officialDocuments));
  }, [officialDocuments]);

  // ── Filter ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return documents.filter((d) => {
      const matchesSearch = q === "" || d.title.toLowerCase().includes(q);

      const docDate = new Date(d.uploadDate);

      const matchesDate =
        (!startDate || docDate >= new Date(startDate)) &&
        (!endDate || docDate <= new Date(`${endDate}T23:59:59`));

      return matchesSearch && matchesDate;
    });
  }, [documents, search, startDate, endDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, startDate, endDate]);

  // ── Paginate ─────────────────────────────────────────────────────────────
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * DOCS_PER_PAGE;

    return filtered.slice(start, start + DOCS_PER_PAGE);
  }, [filtered, currentPage]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const router = useRouter();
  const handleRefresh = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    router.refresh();
  };

  const handleEdit = (doc: DocumentItem) => {
    setSelectedDocument(doc);
    setIsEditModalOpen(true);
  };

  const handleDelete = (doc: DocumentItem) => {
    setSelectedDocument(doc);
    setIsDeleteModalOpen(true);
  };

  const handleSaveDocument = (title: string, description: string) => {
    if (!selectedDocument) return;

    if (!title.trim()) {
      pushToast({
        title: t("market.toast.validationError.title"),
        message: t("market.toast.titleRequired.message"),
        variant: "error",
      });
      return;
    }
    if (!description.trim()) {
      pushToast({
        title: t("market.toast.validationError.title"),
        message: t("market.toast.descriptionRequired.message"),
        variant: "error",
      });

      return;
    }

    startTransition(async () => {
      const result = await updateOfficialDocumentAction(
        selectedDocument.officialDocumentId,
        title.trim(),
        description.trim(),
        selectedDocument.attachmentFileName,
      );

      if (!result.success) {
        pushToast({
          title: t("market.toast.updateFailed.title"),
          message: result.error,
          variant: "error",
        });

        return;
      }

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.officialDocumentId === selectedDocument.officialDocumentId
            ? {
                ...doc,
                title,
                description,
              }
            : doc,
        ),
      );

      pushToast({
        title: t("market.toast.documentUpdated.title"),
        message: t("market.toast.documentUpdated.message"),
        variant: "success",
      });

      setIsEditModalOpen(false);
      setSelectedDocument(null);
    });
  };

  const handleConfirmDelete = () => {
    if (!selectedDocument) return;

    startTransition(async () => {
      const result = await deleteOfficialDocumentAction(
        selectedDocument.officialDocumentId,
      );

      if (!result.success) {
        pushToast({
          title: t("market.toast.deleteFailed.title"),
          message: result.error,
          variant: "error",
        });

        return;
      }

      setDocuments((prev) =>
        prev.filter(
          (doc) =>
            doc.officialDocumentId !== selectedDocument.officialDocumentId,
        ),
      );

      pushToast({
        title: t("market.toast.documentDeleted.title"),
        message: t("market.toast.documentDeleted.message"),
        variant: "success",
      });

      setIsDeleteModalOpen(false);
      setSelectedDocument(null);
      router.refresh();
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    document.getElementById("docs-anchor")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className={`mx-auto w-full max-w-[1300px] flex flex-col gap-6 pt-6 ${fontClass}`}
    >
      {/* Heading */}
      <div className="mt-2 flex select-none flex-col items-center gap-1 text-center">
        <p className="mb-1 text-[20px] font-semibold uppercase leading-none text-primary">
          {t("market.section.resources")}
        </p>

        <h2 className="text-[32px] font-black leading-none text-primary-heading">
          {t("market.section.governmentAnnouncement")}
        </h2>
      </div>

      <div className="relative z-20 flex w-full flex-wrap items-end gap-3">
        <div className="w-full lg:w-[400px] lg:shrink-0">
          <SearchInput
            value={search}
            onChange={setSearch}
            label={t("market.search")}
            placeholder={t("market.search.crop.document-placeholder")}
          />
        </div>

        <div className="w-full sm:w-[245px] lg:shrink-0">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }}
          />
        </div>

        {isGovernment && (
          <div className="w-full sm:w-auto">
            <ActionButton onClick={() => setIsAddDocumentOpen(true)}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
              >
                <path
                  d="M9.9974 18.3327C14.5807 18.3327 18.3307 14.5827 18.3307 9.99935C18.3307 5.41602 14.5807 1.66602 9.9974 1.66602C5.41406 1.66602 1.66406 5.41602 1.66406 9.99935C1.66406 14.5827 5.41406 18.3327 9.9974 18.3327Z"
                  stroke="#2A2F33"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.66406 10H13.3307"
                  stroke="#2A2F33"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 13.3327V6.66602"
                  stroke="#292D32"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t("market.button.uploadDocument")}
            </ActionButton>
          </div>
        )}

        <RefreshButton onClick={handleRefresh} />
      </div>
      {/* Documents */}
      <div id="docs-anchor" className="scroll-mt-2 mt-6">
        {paginated.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginated.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                isGovernment={isGovernment}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-20 text-secondary-body/50">
            <svg
              className="h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>

            <p className="text-sm font-medium">{t("market.empty.documents")}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="pt-3">
        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          itemsPerPage={DOCS_PER_PAGE}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Modal */}
      <AddDocumentModal
        open={isAddDocumentOpen}
        onClose={() => setIsAddDocumentOpen(false)}
        officialDocuments={officialDocuments}
      />

      <EditDocumentModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={selectedDocument?.title ?? ""}
        description={selectedDocument?.description ?? ""}
        onSave={handleSaveDocument}
        isPending={isPending}
        documents={documents}
        currentDocumentId={selectedDocument?.officialDocumentId ?? ""}
      />

      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isPending={isPending}
        title={t("market.confirm.deleteThis")}
        message={t("market.confirm.deleteItem")}
      />
    </div>
  );
}
