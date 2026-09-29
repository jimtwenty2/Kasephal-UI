"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import type { AdminReportAttachment } from "@/types/admin/report";
import { getAttachmentImageUrl } from "@/utils/getAttachmentUrl";

interface EvidenceSectionProps {
  files: AdminReportAttachment[];
}

const FALLBACK_IMAGE = "/assets/image/no-product.jpg";
const S3_BASE_URL = "https://s3.detronic11.win";
const IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? `${S3_BASE_URL}/uploads`;

const IMAGE_EXTENSIONS = new Set([
  "avif",
  "gif",
  "jpg",
  "jpeg",
  "png",
  "svg",
  "webp",
]);

export default function EvidenceSection({ files }: EvidenceSectionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (files.length === 0) {
    return (
      <section className="mt-8">
        <h3 className="text-base font-bold text-stone-900">
          Evidence Provided
        </h3>
        <p className="mt-2 text-sm text-stone-400">
          No evidence files submitted.
        </p>
      </section>
    );
  }

  const selected = files.find((f) => f.report_attachment_id === selectedId);
  const selectedUrl = selected ? getEvidenceDirectUrl(selected.image_url) : "";

  return (
    <section className="mt-8">
      <h3 className="text-base font-bold text-stone-900">Evidence Provided</h3>

      <div className="mt-3 flex flex-wrap gap-3">
        {files.map((file) => {
          const isSelected = file.report_attachment_id === selectedId;
          const previewSources = getEvidencePreviewSources(file.image_url);

          return (
            <button
              key={file.report_attachment_id}
              type="button"
              onClick={() => setSelectedId(file.report_attachment_id)}
              aria-pressed={isSelected}
              className={`group relative h-24 w-24 overflow-hidden rounded-xl border bg-stone-100 transition-all sm:h-28 sm:w-28 ${
                isSelected
                  ? "border-emerald-600 ring-2 ring-emerald-200"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <EvidenceImage
                key={previewSources.join("|")}
                sources={previewSources}
                alt="Evidence"
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-4 overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
          <div className="flex max-h-[520px] items-center justify-center">
            <a
              href={selectedUrl || undefined}
              target="_blank"
              rel="noreferrer"
              className="block w-full"
            >
              <EvidenceImage
                key={selected.report_attachment_id}
                sources={getEvidencePreviewSources(selected.image_url)}
                alt="Selected evidence"
                className="max-h-[520px] w-full object-contain"
              />
            </a>
          </div>
        </div>
      )}
    </section>
  );
}

function EvidenceImage({
  sources,
  alt,
  className,
}: {
  sources: string[];
  alt: string;
  className?: string;
}) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const imgSrc = sources[sourceIndex] ?? FALLBACK_IMAGE;

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (sourceIndex < sources.length) {
          setSourceIndex((index) => index + 1);
        }
      }}
    />
  );
}

function getEvidencePreviewSources(value?: string | null) {
  const file = value?.trim();

  if (!file || file.toLowerCase() === "string") return [FALLBACK_IMAGE];

  const extension = getFileExtension(file);

  if (extension && !IMAGE_EXTENSIONS.has(extension)) {
    return [FALLBACK_IMAGE];
  }

  return uniqueStrings([
    getEvidenceDirectUrl(file),
    getAttachmentImageUrl(file),
    FALLBACK_IMAGE,
  ]);
}

function getEvidenceDirectUrl(value?: string | null) {
  const file = value?.trim();

  if (!file || file.toLowerCase() === "string") return "";
  if (file.startsWith("//")) return `https:${file}`;
  if (file.startsWith("/")) return file;

  const nestedAbsoluteUrlIndex = file.search(/https?:\/\//i);
  if (nestedAbsoluteUrlIndex > 0) {
    return file.slice(nestedAbsoluteUrlIndex);
  }

  if (/^(blob:|data:)/i.test(file)) {
    return file;
  }

  if (/^https?:\/\//i.test(file)) {
    return normalizeAbsoluteAttachmentUrl(file);
  }

  if (file.startsWith("s3.detronic11.win/")) {
    return `https://${file}`;
  }

  if (file.startsWith("uploads/")) {
    return `${S3_BASE_URL}/${file.replace(/^\/+/, "")}`;
  }

  if (file.includes("/uploads/view/")) {
    return toImageBaseUrl(file.split("/uploads/view/").pop() ?? "");
  }

  if (file.includes("/")) {
    return toImageBaseUrl(file);
  }

  return toImageBaseUrl(encodeURIComponent(file));
}

function normalizeAbsoluteAttachmentUrl(value: string) {
  try {
    const url = new URL(value);
    const viewPrefix = "/uploads/view/";
    const viewIndex = url.pathname.indexOf(viewPrefix);

    if (viewIndex >= 0) {
      const filePath = decodeURIComponent(
        url.pathname.slice(viewIndex + viewPrefix.length),
      );

      return toImageBaseUrl(filePath);
    }
  } catch {
    return value;
  }

  return value;
}

function getFileExtension(url: string) {
  const withoutQuery = url.split(/[?#]/)[0] ?? "";
  const fileName = withoutQuery.split("/").pop() ?? "";
  const dotIndex = fileName.lastIndexOf(".");

  return dotIndex >= 0 ? fileName.slice(dotIndex + 1).toLowerCase() : "";
}

function toImageBaseUrl(filePath: string) {
  const normalizedPath = filePath.replace(/^\/+/, "");

  if (!normalizedPath) return "";
  if (normalizedPath.startsWith("uploads/")) {
    return `${S3_BASE_URL}/${normalizedPath}`;
  }

  return `${IMAGE_BASE_URL.replace(/\/+$/, "")}/${normalizedPath}`;
}

function uniqueStrings(values: string[]) {
  return values.filter(
    (value, index, all) => value && all.indexOf(value) === index,
  );
}
