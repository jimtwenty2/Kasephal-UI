"use client";

import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, AlertCircle } from "lucide-react";

import { Policy } from "@/types/admin/policy";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

const MAX_TITLE_LENGTH = 50;
const MAX_CONTENT_LENGTH = 255;

const policySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Policy Title is required")
    .max(
      MAX_TITLE_LENGTH,
      `Policy Title cannot exceed ${MAX_TITLE_LENGTH} characters.`,
    ),
  content: z
    .string()
    .min(1, "Policy Content is required")
    .max(
      MAX_CONTENT_LENGTH,
      `Policy Title cannot exceed ${MAX_CONTENT_LENGTH} characters.`,
    ),
});

type PolicyFormValues = z.infer<typeof policySchema>;

interface PolicyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (policyData: {
    title: string;
    content: string;
    status: "DRAFT" | "PUBLISHED";
  }) => void;
  initialData?: Policy | null;
  saving?: boolean;
  error?: string | null;
}

const PolicyFormModal: React.FC<PolicyFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  saving = false,
  error = null,
}) => {
  useBodyScrollLock(isOpen);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    reset({
      title: initialData?.title ?? "",
      content: initialData?.content ?? "",
    });
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const onSubmit = (status: "DRAFT" | "PUBLISHED") => {
    return (data: PolicyFormValues) => {
      onSave({
        title: data.title.trim(),
        content: data.content ?? "",
        status,
      });
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="absolute top-6 right-6 cursor-pointer rounded-full p-2 text-description-text transition-all hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
        >
          <X size={22} />
        </button>

        <h2 className="mb-8 text-2xl font-bold text-primary-heading">
          {initialData ? "Update Policy" : "Create New Policy"}
        </h2>

        {/* Server Error */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit(initialData ? "PUBLISHED" : "DRAFT"))}
          noValidate
        >
          {/* Title */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <label className="font-semibold text-primary-heading">
                Policy Title <span className="text-red-500">*</span>
              </label>

              <span className="text-[11px] font-medium text-slate-400">
                {watch("title")?.length ?? 0} / {MAX_TITLE_LENGTH}
              </span>
            </div>

            <input
              type="text"
              placeholder="e.g., Contract policy"
              maxLength={MAX_TITLE_LENGTH}
              disabled={saving}
              {...register("title")}
              className={`w-full rounded-xl border px-4 py-3 transition-all focus:outline-none focus:ring-2 disabled:opacity-50 ${
                errors.title
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-200 focus:border-transparent focus:ring-emerald-600"
              }`}
            />

            {errors.title && (
              <p className="mt-2 text-sm text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="mb-8">
            <label className="mb-2 block font-semibold text-primary-heading">
              Policy Content
            </label>

            <p className="mb-3 text-sm text-description-text">
              Draft the full policy content below.
            </p>

            <textarea
              rows={6}
              placeholder="Start writing policy content here..."
              disabled={saving}
              {...register("content")}
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:opacity-50"
            />
            {errors.content && (
              <p className="mt-2 text-sm text-red-600">
                {errors.content.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="cursor-pointer rounded-full border border-slate-200 px-6 py-2.5 font-medium text-primary-heading transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-medium text-white transition-colors hover:bg-emerald-900 disabled:opacity-70"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}

              {saving ? "Saving..." : initialData ? "Update" : "Save as Draft"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PolicyFormModal;
