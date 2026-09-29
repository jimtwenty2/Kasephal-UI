"use client";

import { useActionState, useEffect, useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createOfficialDocumentAction } from "@/action/official-document/create-official-document.action";
import { useRouter } from "next/navigation";
import { pushToast } from "@/lib/toastStore";
import { useMarketPriceText } from "../marketPriceText";

const initialState = {
  success: false,
  error: "",
};

interface DocumentUploadFormProps {
  onCancel?: () => void;
  existingTitles?: string[];
}

function getFriendlyError(error: string) {
  return error;
}

function normalizeText(value: string) {
  return value.replace(/\s{2,}/g, " ").trimStart();
}

const TITLE_MIN_LENGTH = 3;
const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MIN_LENGTH = 3;
const DESCRIPTION_MAX_LENGTH = 500;

const ALLOWED_FILE_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
];

function getFileExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot === -1) return "";
  return fileName.slice(lastDot).toLowerCase();
}

function isAllowedFile(file: File) {
  return ALLOWED_FILE_EXTENSIONS.includes(getFileExtension(file.name));
}

const UNSUPPORTED_FILE_MESSAGE =
  "Unsupported file type. Please upload PNG, JPG, PDF, DOC, or XLS files only.";

function createUploadSchema(existingTitles: string[]) {
  const normalizedExisting = existingTitles.map((t) => t.trim().toLowerCase());

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
        (v) => !normalizedExisting.includes(v.toLowerCase()),
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

type UploadFormValues = z.infer<ReturnType<typeof createUploadSchema>>;

export default function DocumentUploadForm({
  onCancel,
  existingTitles = [],
}: DocumentUploadFormProps) {
  const { t, fontClass } = useMarketPriceText();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [state, formAction, pending] = useActionState(
    createOfficialDocumentAction,
    initialState,
  );
  const router = useRouter();

  const schema = createUploadSchema(existingTitles);

  const {
    register,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<UploadFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { title: "", description: "" },
  });

  useEffect(() => {
    if (state.success) {
      pushToast({
        title: t("market.toast.documentUploaded.title"),
        message: `${fileName} ${t("market.toast.documentUploaded.message")}`,
        variant: "success",
      });

      reset();
      setSelectedFile(null);
      setFileName("");

      onCancel?.();

      router.refresh();
    }
  }, [state.success, fileName, onCancel, router, t, reset]);

  useEffect(() => {
    if (!state.error) return;

    pushToast({
      title: t("market.toast.uploadFailed.title"),
      message: getFriendlyError(state.error),
      variant: "error",
    });
  }, [state.error]);

  const isFormValid = isValid && !!selectedFile;

  const titleLength = watch("title")?.length ?? 0;
  const descriptionLength = watch("description")?.length ?? 0;

  const handleFileSelect = (file: File | null) => {
    if (file && !isAllowedFile(file)) {
      pushToast({
        title: t("market.toast.uploadFailed.title"),
        message: UNSUPPORTED_FILE_MESSAGE,
        variant: "error",
      });
      return;
    }

    setSelectedFile(file);
    setFileName(file?.name ?? "");

    if (fileInputRef.current && file) {
      const dataTransfer = new DataTransfer();

      dataTransfer.items.add(file);

      fileInputRef.current.files = dataTransfer.files;
    }
  };

  const registerText = (name: "title" | "description") => {
    const field = register(name);
    return {
      ...field,
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        event.target.value = normalizeText(event.target.value);
        return field.onChange(event);
      },
    };
  };

  return (
    <form
      action={formAction}
      className={`w-full rounded-3xl bg-white px-5 py-5 ${fontClass}`}
      noValidate
    >
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();

          setIsDragging(false);

          const file = e.dataTransfer.files?.[0] ?? null;

          handleFileSelect(file);
        }}
        className={`mb-6 flex h-55 cursor-pointer flex-col items-center justify-center rounded-4xl border-2 border-dashed px-5 text-center transition-all
    ${isDragging ? "border-primary bg-primary/5" : "border-[#CBD2E1]"}
  `}
      >
        <input
          ref={fileInputRef}
          name="file"
          type="file"
          accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.xls,.xlsx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;

            if (file && !isAllowedFile(file)) {
              pushToast({
                title: t("market.toast.uploadFailed.title"),
                message: UNSUPPORTED_FILE_MESSAGE,
                variant: "error",
              });

              e.target.value = "";
              setSelectedFile(null);
              setFileName("");
              return;
            }

            setSelectedFile(file);
            setFileName(file?.name ?? "");
          }}
        />

        <svg
          width="36"
          height="36"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_3905_51451)">
            <path
              d="M16.0029 32.0009L24.0029 24.0009L32.0029 32.0009M24.0029 24.0009V42.0009M40.7828 36.7809C42.7335 35.7175 44.2745 34.0347 45.1626 31.9982C46.0507 29.9617 46.2353 27.6874 45.6873 25.5343C45.1392 23.3812 43.8898 21.472 42.1362 20.1078C40.3826 18.7437 38.2246 18.0024 36.0028 18.0009H33.4829C32.8775 15.6594 31.7492 13.4856 30.1827 11.6429C28.6163 9.80025 26.6525 8.33664 24.439 7.36216C22.2256 6.38767 19.82 5.92766 17.4031 6.01671C14.9862 6.10576 12.621 6.74154 10.4852 7.87628C8.34942 9.01101 6.49867 10.6152 5.07209 12.5681C3.64552 14.5211 2.68023 16.772 2.24881 19.1517C1.81739 21.5314 1.93106 23.978 2.58128 26.3075C3.23149 28.6369 4.40133 30.7887 6.00285 32.6009"
              stroke="#1E1E1E"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_3905_51451">
              <rect width="48" height="48" fill="white" />
            </clipPath>
          </defs>
        </svg>

        <p className="text-[18px] font-bold">{t("market.form.chooseFile")}</p>

        <p className="mt-3 text-[13px] font-semibold leading-none text-[#A7ADB8]">
          {t("market.form.supportedFiles")}
        </p>

        <button
          type="button"
          className="mt-4 h-9 rounded-xl border border-[#CBD2E1] px-5 text-sm font-medium text-muted cursor-pointer"
        >
          {t("market.form.browse")}
        </button>

        {fileName && (
          <div className="mt-3 w-full px-4">
            <p
              className="overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-medium text-primary"
              title={fileName}
            >
              {fileName}
            </p>
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-[16px] font-semibold leading-none text-primary">
          <span className="text-red-500">*</span> {t("market.form.title")}
        </label>

        <input
          {...registerText("title")}
          type="text"
          placeholder={t("market.form.documentTitle.placeholder")}
          maxLength={TITLE_MAX_LENGTH}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
          className={`h-10 w-full rounded-2xl border px-4 text-[14px] font-medium leading-none text-primary placeholder:text-[#5F6B7A] transition focus:ring-2 ${
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

      <div className="mb-8">
        <label className="mb-2 block text-[16px] font-semibold leading-none text-primary">
          <span className="text-red-500">* </span>
          {t("market.form.description")}
        </label>

        <input
          {...registerText("description")}
          type="text"
          placeholder={t("market.form.documentDescription.placeholder")}
          maxLength={DESCRIPTION_MAX_LENGTH}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? "description-error" : undefined}
          className={`h-10 w-full rounded-2xl border px-4 text-[14px] font-medium leading-none text-primary placeholder:text-[#5F6B7A] transition focus:ring-2 ${
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

      <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
        <button
          type="button"
          onClick={onCancel}
          className=" h-10 rounded-xl bg-muted px-6 text-md font-medium text-white"
        >
          {t("market.action.cancel")}
        </button>

        <button
          type="submit"
          disabled={pending || !isFormValid}
          className={`h-10 rounded-xl px-6 text-md font-medium text-white transition
    ${
      pending || !isFormValid
        ? "cursor-not-allowed bg-gray-300"
        : "bg-primary hover:opacity-90"
    }
  `}
        >
          {pending ? t("market.action.saving") : t("market.action.save")}
        </button>
      </div>
    </form>
  );
}