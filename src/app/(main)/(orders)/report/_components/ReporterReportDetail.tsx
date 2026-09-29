"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, useRef, useState } from "react";
import { ImagePlus, Loader2, ShieldCheck, Clock, X } from "lucide-react";
import { uploadAttachmentAction } from "@/action/upload.action";
import { addReportProofAction } from "@/action/Report.action";
import { showApiError, showApiSuccess } from "@/lib/apiToast";
import { getAttachmentUrl } from "@/utils/getAttachmentUrl";
import { useI18n } from "@/lib/i18n/I18nContext";
import type { IssueType, ReportDetail, ReportStatus } from "@/types/report";

type Lang = "en" | "kh";

const MAX_PROOF_IMAGES = 5;

const formatOrderCode = (orderId: string) =>
  `#ORD-${orderId?.trim().slice(-4).toUpperCase() || "----"}`;

const STATUS_META: Record<
  ReportStatus,
  { label: { en: string; kh: string }; badge: string }
> = {
  PENDING: {
    label: { en: "Pending Review", kh: "កំពុងរង់ចាំការពិនិត្យ" },
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  WAITING_PROOF: {
    label: { en: "Waiting for Proof", kh: "កំពុងរង់ចាំភស្តុតាង" },
    badge: "bg-[#FEF3DC] text-[#9a6a06] border-[#f0d08a]",
  },
  APPROVED: {
    label: { en: "Approved", kh: "បានអនុម័ត" },
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  REJECTED: {
    label: { en: "Rejected", kh: "បានបដិសេធ" },
    badge: "bg-red-50 text-red-700 border-red-200",
  },
};

const ISSUE_TYPE_LABEL: Record<IssueType, { en: string; kh: string }> = {
  VIOLATION_TERMS: { en: "Term & Condition Violation", kh: "ការបំពានលក្ខខណ្ឌ" },
  ESCROW_PAYMENT: { en: "Escrow / Payment", kh: "Escrow / ការបង់ប្រាក់" },
  CONTRACT: { en: "Contract", kh: "កិច្ចសន្យា" },
  DELIVERY: { en: "Delivery", kh: "ការដឹកជញ្ជូន" },
  OTHER: { en: "Other", kh: "ផ្សេងទៀត" },
};

const TEXT = {
  title: { en: "Report Details", kh: "ព័ត៌មានលម្អិតរបាយការណ៍" },
  reportedUser: { en: "Reported User", kh: "អ្នកដែលត្រូវរាយការណ៍" },
  order: { en: "Order", kh: "ការបញ្ជាទិញ" },
  issueType: { en: "Issue Type", kh: "ប្រភេទបញ្ហា" },
  submittedOn: { en: "Submitted On", kh: "បានដាក់បញ្ជូននៅ" },
  description: { en: "Description", kh: "សេចក្តីអធិប្បាយ" },
  evidence: { en: "Submitted Evidence", kh: "ភស្តុតាងដែលបានដាក់បញ្ជូន" },
  noEvidence: { en: "No evidence attached.", kh: "មិនមានភស្តុតាងភ្ជាប់ទេ។" },
  proofRequestedTitle: {
    en: "More proof requested",
    kh: "បានស្នើសុំភស្តុតាងបន្ថែម",
  },
  proofRequestedBody: {
    en: "Our oversight team asked for more evidence on this report. Please upload additional images below.",
    kh: "ក្រុមការងាររបស់យើងបានស្នើសុំភស្តុតាងបន្ថែមលើរបាយការណ៍នេះ។ សូមបង្ហោះរូបភាពបន្ថែមខាងក្រោម។",
  },
  addProof: { en: "Add Proof Images", kh: "បន្ថែមរូបភាពភស្តុតាង" },
  uploadHint: {
    en: "Click to upload clear images (max 5).",
    kh: "ចុចដើម្បីបង្ហោះរូបភាពច្បាស់ (អតិបរមា ៥)។",
  },
  submitProof: { en: "SUBMIT PROOF", kh: "ដាក់បញ្ជូនភស្តុតាង" },
  submitting: { en: "SUBMITTING...", kh: "កំពុងដាក់បញ្ជូន..." },
  uploading: { en: "Uploading…", kh: "កំពុងបង្ហោះ…" },
  imagesOnly: {
    en: "Please upload image files only.",
    kh: "សូមបង្ហោះតែឯកសាររូបភាព។",
  },
  maxImages: {
    en: `You can upload up to ${MAX_PROOF_IMAGES} images.`,
    kh: `អ្នកអាចបង្ហោះរូបភាពបានច្រើនបំផុត ${MAX_PROOF_IMAGES}។`,
  },
  proofSubmitted: {
    en: "Proof submitted successfully.",
    kh: "បានដាក់បញ្ជូនភស្តុតាងដោយជោគជ័យ។",
  },
  pendingNote: {
    en: "This report is awaiting review by our oversight team.",
    kh: "របាយការណ៍នេះកំពុងរង់ចាំការពិនិត្យពីក្រុមការងាររបស់យើង។",
  },
  closedNote: {
    en: "This report has been resolved and is now closed.",
    kh: "របាយការណ៍នេះត្រូវបានដោះស្រាយ ហើយត្រូវបានបិទ។",
  },
} as const;

export default function ReporterReportDetail({
  report,
}: {
  report: ReportDetail;
}) {
  const router = useRouter();
  const { language } = useI18n();
  const lang: Lang = language === "kh" ? "kh" : "en";
  const t = (key: keyof typeof TEXT) => TEXT[key][lang];

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingFiles, setPendingFiles] = useState<
    { fileName: string; previewUrl: string }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const status = report.status;
  const statusMeta = STATUS_META[status];
  const isWaitingProof = status === "WAITING_PROOF";
  const isClosed = status === "APPROVED" || status === "REJECTED";

  const handleSelectFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length !== files.length) {
      showApiError(new Error(TEXT.imagesOnly[lang]));
    }

    const remaining = MAX_PROOF_IMAGES - pendingFiles.length;
    if (remaining <= 0) {
      showApiError(new Error(TEXT.maxImages[lang]));
      return;
    }

    const toUpload = imageFiles.slice(0, remaining);
    if (!toUpload.length) return;

    setIsUploading(true);
    try {
      for (const file of toUpload) {
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadAttachmentAction(formData);

        if (!result.success || !result.fileName) {
          showApiError(new Error(result.error ?? "Image upload failed."));
          continue;
        }

        setPendingFiles((prev) => [
          ...prev,
          {
            fileName: result.fileName!,
            previewUrl: URL.createObjectURL(file),
          },
        ]);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const removePending = (fileName: string) => {
    setPendingFiles((prev) => prev.filter((f) => f.fileName !== fileName));
  };

  const handleSubmitProof = async () => {
    if (!pendingFiles.length || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await addReportProofAction(
        report.reportIssueId,
        pendingFiles.map((f) => f.fileName),
      );

      if (!result.success) {
        showApiError(new Error(result.error ?? "Failed to upload proof."));
        return;
      }

      showApiSuccess(t("proofRequestedTitle"), t("proofSubmitted"));
      setPendingFiles([]);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const createdDate = new Date(report.createdAt);
  const createdLabel = Number.isNaN(createdDate.getTime())
    ? report.createdAt
    : `${String(createdDate.getDate()).padStart(2, "0")} ${createdDate.toLocaleString(
        "en-US",
        { month: "short" },
      )}, ${createdDate.getFullYear()}`;

  return (
    <div className={`mx-auto w-full max-w-3xl ${lang === "kh" ? "font-khmer" : ""}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-[#1f2933] sm:text-2xl">
          {report.title || t("title")}
        </h1>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.badge}`}
        >
          {statusMeta.label[lang]}
        </span>
      </div>

      {/* Meta */}
      <div className="mt-4 grid gap-3 rounded-2xl border border-[#d9e2ec] bg-white p-5 shadow-sm sm:grid-cols-2">
        <Meta label={t("reportedUser")} value={report.reportedUserName || "—"} />
        <Meta label={t("order")} value={formatOrderCode(report.orderId)} accent />
        <Meta
          label={t("issueType")}
          value={ISSUE_TYPE_LABEL[report.issueType]?.[lang] ?? report.issueType}
        />
        <Meta label={t("submittedOn")} value={createdLabel} />
      </div>

      {/* Description */}
      {report.description && (
        <div className="mt-4 rounded-2xl border border-[#d9e2ec] bg-white p-5 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-[#08743f]">
            {t("description")}
          </p>
          <p className="whitespace-pre-line text-sm leading-6 text-[#374151]">
            {report.description}
          </p>
        </div>
      )}

      {/* Existing evidence */}
      <div className="mt-4 rounded-2xl border border-[#d9e2ec] bg-white p-5 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-[#08743f]">
          {t("evidence")}
        </p>
        {report.attachments?.length ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {report.attachments.map((file, index) => (
              <a
                key={`${file}-${index}`}
                href={getAttachmentUrl(file)}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square overflow-hidden rounded-lg border border-[#d9e2ec] bg-[#f4f7f9]"
              >
                <Image
                  src={getAttachmentUrl(file)}
                  alt={`Evidence ${index + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#6b7280]">{t("noEvidence")}</p>
        )}
      </div>

      {/* Waiting-proof: upload section */}
      {isWaitingProof && (
        <div className="mt-4 rounded-2xl border border-[#f0d08a] bg-[#FEF8EC] p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#E8A020]" />
            <div>
              <p className="text-sm font-bold text-[#8a5a06]">
                {t("proofRequestedTitle")}
              </p>
              <p className="mt-1 text-sm leading-6 text-[#a07a30]">
                {t("proofRequestedBody")}
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleSelectFiles}
            className="hidden"
          />

          {/* Pending previews */}
          {pendingFiles.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {pendingFiles.map((file) => (
                <div
                  key={file.fileName}
                  className="relative aspect-square overflow-hidden rounded-lg border border-[#f0d08a] bg-white"
                >
                  <Image
                    src={file.previewUrl}
                    alt="Proof preview"
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePending(file.fileName)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || pendingFiles.length >= MAX_PROOF_IMAGES}
            className="mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E8A020]/50 bg-white py-6 text-[#b8860b] transition hover:bg-[#FEF3DC] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium">{t("uploading")}</span>
              </>
            ) : (
              <>
                <ImagePlus className="h-6 w-6" />
                <span className="text-sm font-semibold">{t("addProof")}</span>
                <span className="text-xs text-[#b8860b]/70">
                  {t("uploadHint")}
                </span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSubmitProof}
            disabled={isSubmitting || isUploading || pendingFiles.length === 0}
            className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-[#f8bd4d] px-6 text-xs font-bold text-[#1f2933] transition hover:bg-[#f5b437] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? t("submitting") : t("submitProof")}
          </button>
        </div>
      )}

      {/* Pending / closed notes */}
      {status === "PENDING" && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {t("pendingNote")}
        </p>
      )}
      {isClosed && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          {t("closedNote")}
        </div>
      )}
    </div>
  );
}

function Meta({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-[#6b7280]">{label}</p>
      <p
        className={`mt-0.5 text-sm font-semibold ${
          accent ? "text-[#08743f]" : "text-[#1f2933]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
