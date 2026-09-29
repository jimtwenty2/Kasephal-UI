"use client";

import { useEffect, useMemo, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "../shared/Modal";
import { useMarketPriceText } from "../marketPriceText";
import { DocumentItem } from "@/types/document";

interface EditDocumentModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  onSave: (title: string, description: string) => void;
  isPending?: boolean;

  documents: DocumentItem[];
  currentDocumentId: string;
}

function normalizeText(value: string) {
  return value.replace(/\s{2,}/g, " ").trimStart();
}

const TITLE_MIN_LENGTH = 3;
const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MIN_LENGTH = 3;
const DESCRIPTION_MAX_LENGTH = 500;

function createDocumentSchema(documents: DocumentItem[], currentDocumentId: string) {
  return z.object({
    title: z
      .string()
      .transform((v) => normalizeText(v).trim())
      .refine((v) => v.length > 0, "Title is required")
      .refine(
        (v) => v.length >= TITLE_MIN_LENGTH,
        `Title must be at least ${TITLE_MIN_LENGTH} characters`,
      )
      .refine(
        (v) => v.length <= TITLE_MAX_LENGTH,
        `Title cannot exceed ${TITLE_MAX_LENGTH} characters`,
      )
      .refine(
        (v) =>
          !documents.some(
            (doc) =>
              doc.officialDocumentId !== currentDocumentId &&
              doc.title.trim().toLowerCase() === v.toLowerCase(),
          ),
        "A document with this title already exists",
      ),
    description: z
      .string()
      .transform((v) => normalizeText(v).trim())
      .refine((v) => v.length > 0, "Description is required")
      .refine(
        (v) => v.length >= DESCRIPTION_MIN_LENGTH,
        `Description must be at least ${DESCRIPTION_MIN_LENGTH} characters`,
      )
      .refine(
        (v) => v.length <= DESCRIPTION_MAX_LENGTH,
        `Description cannot exceed ${DESCRIPTION_MAX_LENGTH} characters`,
      ),
  });
}

type DocumentFormValues = z.infer<ReturnType<typeof createDocumentSchema>>;

export default function EditDocumentModal({
  open,
  onClose,
  title,
  description,
  onSave,
  isPending,
  documents,
  currentDocumentId,
}: EditDocumentModalProps) {
  const { t, fontClass } = useMarketPriceText();

  const schema = useMemo(
    () => createDocumentSchema(documents, currentDocumentId),
    [documents, currentDocumentId],
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { title: "", description: "" },
  });

  useEffect(() => {
    if (!open) return;

    reset({ title, description });
  }, [open, title, description, reset]);

  const registerText = (name: "title" | "description") => {
    const field = register(name);
    return {
      ...field,
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        event.target.value = normalizeText(event.target.value);
        return field.onChange(event);
      },
    };
  };

  const onSubmit = (values: DocumentFormValues) => {
    onSave(values.title, values.description);
  };

  const titleLength = watch("title")?.length ?? 0;
  const descriptionLength = watch("description")?.length ?? 0;

  const busy = isPending || isSubmitting;

  return (
    <Modal open={open} onClose={onClose} title={t("market.modal.editDocument")}>
      <form
        className={`space-y-5 ${fontClass}`}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {/* Title */}
        <div>
          <label className="mb-2 block text-[16px] font-semibold leading-none text-primary">
            <span className="text-red-500">*</span> {t("market.form.title")}
          </label>

          <input
            {...registerText("title")}
            placeholder={t("market.form.documentTitle.placeholder")}
            maxLength={TITLE_MAX_LENGTH}
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "title-error" : undefined}
            className={`h-10 w-full rounded-xl border px-4 text-[16px] font-medium outline-none transition focus:ring-2 ${
              errors.title
                ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                : "border-[#CBD2E1] focus:border-primary focus:ring-primary/10"
            }`}
          />
          {errors.title && (
            <p id="title-error" className="mt-1 text-sm text-red-500">
              {errors.title.message}
            </p>
          )}

          <p
            className={`mt-1 text-right text-xs font-medium ${
              titleLength >= TITLE_MAX_LENGTH ? "text-red-500" : "text-[#A7ADB8]"
            }`}
          >
            {titleLength >= TITLE_MAX_LENGTH
              ? `Maximum length reached (${TITLE_MAX_LENGTH} characters)`
              : `${titleLength}/${TITLE_MAX_LENGTH}`}
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-[16px] font-semibold leading-none text-primary">
            <span className="text-red-500">*</span> {t("market.form.description")}
          </label>

          <textarea
            {...registerText("description")}
            maxLength={DESCRIPTION_MAX_LENGTH}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? "description-error" : undefined}
            className={`w-full rounded-xl border px-4 py-3 text-[16px] font-medium outline-none transition focus:ring-2 ${
              errors.description
                ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                : "border-[#CBD2E1] focus:border-primary focus:ring-primary/10"
            }`}
          />
          {errors.description && (
            <p id="description-error" className="mt-1 text-sm text-red-500">
              {errors.description.message}
            </p>
          )}

          <p
            className={`mt-1 text-right text-xs font-medium ${
              descriptionLength >= DESCRIPTION_MAX_LENGTH ? "text-red-500" : "text-[#A7ADB8]"
            }`}
          >
            {descriptionLength >= DESCRIPTION_MAX_LENGTH
              ? `Maximum length reached (${DESCRIPTION_MAX_LENGTH} characters)`
              : `${descriptionLength}/${DESCRIPTION_MAX_LENGTH}`}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl bg-muted px-6 text-md font-medium text-white"
          >
            {t("market.action.cancel")}
          </button>

          <button
            type="submit"
            disabled={busy}
            className={`h-10 rounded-xl px-6 text-md font-medium text-white transition ${
              busy
                ? "cursor-not-allowed bg-gray-300"
                : "bg-primary hover:opacity-90"
            }`}
          >
            {busy ? t("market.action.saving") : t("market.action.save")}
          </button>
        </div>
      </form>
    </Modal>
  );
}