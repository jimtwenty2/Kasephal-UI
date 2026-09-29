"use client";

import Image from "next/image";
import { ChangeEvent, DragEvent, MouseEvent, useRef, useState } from "react";
import { ImageIcon, Loader2, Plus, X } from "lucide-react";
import { showApiError } from "@/lib/apiToast";
import { uploadAttachmentAction } from "@/action/upload.action";
import { useI18n } from "@/lib/i18n/I18nContext";

type ReportMediaUploadProps = {
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
};

const MAX_IMAGES = 5;
const MAX_THUMBNAILS = 4;

// ✅ Translation map
const TEXT = {
  productMedia: { en: "Product Media", kh: "មេឌៀផលិតផល" },
  addPhotos: { en: "Add Photos", kh: "បន្ថែមរូបភាព" },
  uploadHint: {
    en: "Drag and drop or click to upload report proof images.",
    kh: "អូស និងទម្លាក់ ឬចុចដើម្បីបង្ហោះរូបភាពភស្តុតាងរបាយការណ៍។",
  },
  uploading: { en: "Uploading…", kh: "កំពុងបង្ហោះ…" },
  uploadFailed: { en: "Image upload failed.", kh: "ការបង្ហោះរូបភាពបានបរាជ័យ។" },
  imagesOnly: { en: "Please upload image files only.", kh: "សូមបង្ហោះតែឯកសាររូបភាពប៉ុណ្ណោះ។" },
  maxImages: {
    en: `You can upload up to ${MAX_IMAGES} images.`,
    kh: `អ្នកអាចបង្ហោះរូបភាពបានច្រើនបំផុត ${MAX_IMAGES}។`,
  },
  noUrlReturned: {
    en: "Upload succeeded but no URL was returned.",
    kh: "ការបង្ហោះបានជោគជ័យប៉ុន្តែមិនមាន URL ត្រូវបានត្រឡប់មក។",
  },
  proTipTitle: { en: "Pro Tip", kh: "គន្លឹះពីអ្នកជំនាញ" },
  proTipBody: {
    en: "Clear report images and detailed descriptions help the oversight team review your issue faster.",
    kh: "រូបភាពរបាយការណ៍ច្បាស់លាស់ និងការពិពណ៌នាលម្អិតជួយឱ្យក្រុមត្រួតពិនិត្យពិនិត្យបញ្ហារបស់អ្នកបានលឿនជាងមុន។",
  },
} as const;

export default function ReportMediaUpload({
  images,
  setImages,
}: ReportMediaUploadProps) {
  // ✅ Read language from context directly
  const { language } = useI18n();
  const lang = language === "kh" ? "kh" : "en";
  const t = (key: keyof typeof TEXT) => TEXT[key][lang];

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const selectedPreviewImage = previewImage ?? images[images.length - 1] ?? null;
  const thumbnailImages = images.slice(0, MAX_THUMBNAILS);
  const isMissingImage = images.length === 0;

  const handleChooseImage = () => {
    if (images.length >= MAX_IMAGES) return;
    fileInputRef.current?.click();
  };

  const uploadFiles = async (selectedFiles: File[]) => {
    const imageFiles = selectedFiles.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length !== selectedFiles.length) {
      showApiError(new Error(t("imagesOnly")));
    }

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      showApiError(new Error(t("maxImages")));
      return;
    }

    const filesToUpload = imageFiles.slice(0, remainingSlots);
    if (imageFiles.length > remainingSlots) {
      showApiError(new Error(t("maxImages")));
    }

    if (!filesToUpload.length) return;

    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadResult = await uploadAttachmentAction(formData);
        const remoteUrl = uploadResult.success
          ? (uploadResult.imageUrl ?? null)
          : null;

        if (!remoteUrl) {
          showApiError(
            new Error(uploadResult.error ?? t("noUrlReturned")),
          );
          continue;
        }

        uploadedUrls.push(remoteUrl);
      }

      if (uploadedUrls.length) {
        setImages((prev) => [...prev, ...uploadedUrls].slice(0, MAX_IMAGES));
        setPreviewImage(uploadedUrls[uploadedUrls.length - 1]);
      }
    } catch (err) {
      showApiError(err instanceof Error ? err : new Error(t("uploadFailed")));
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    event.target.value = "";
    await uploadFiles(files);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isUploading && images.length < MAX_IMAGES) setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (isUploading || images.length >= MAX_IMAGES) return;
    await uploadFiles(Array.from(event.dataTransfer.files));
  };

  const handleRemoveImage = (
    event: MouseEvent<HTMLButtonElement>,
    imageToRemove: string,
  ) => {
    event.stopPropagation();
    const nextImages = images.filter((img) => img !== imageToRemove);
    setImages(nextImages);
    if (selectedPreviewImage === imageToRemove) {
      setPreviewImage(nextImages[nextImages.length - 1] ?? null);
    }
  };

  return (
    <div className={`flex h-full flex-col overflow-hidden ${lang === "kh" ? "font-khmer" : ""}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
        className="hidden"
      />

      <div className="overflow-hidden rounded-xl border border-[#d9e2ec] bg-white p-2.5 shadow-sm sm:p-3">
        <div className="mb-2 flex items-center gap-2">
          <ImageIcon size={16} className="shrink-0 text-[#2f3a45]" />
          <h2 className="text-sm font-bold text-[#2f3a45]">
            <span className="mr-1 text-red-500">*</span>
            {t("productMedia")}
          </h2>
        </div>

        <div
          role="button"
          tabIndex={
            isUploading || images.length >= MAX_IMAGES
              ? -1
              : 0
          }
          onClick={() => {
            if (isUploading) return;
            handleChooseImage();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (isUploading) return;
              handleChooseImage();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          aria-disabled={
            isUploading || images.length >= MAX_IMAGES
          }
          className={`relative flex h-[150px] w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-[#f8fafc] transition sm:h-[200px] lg:h-[220px] ${
            isDragging ? "border-[#08743f] bg-[#ecf8f2]" : "border-[#a8d5c2]"
          } ${
            isUploading || images.length >= MAX_IMAGES
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer"
          }`}
        >
          {isUploading && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-white/80">
              <Loader2 size={24} className="animate-spin text-[#08743f]" />
              <p className="text-xs font-semibold text-[#08743f]">{t("uploading")}</p>
            </div>
          )}

          {selectedPreviewImage ? (
            <>
              <Image
                src={selectedPreviewImage}
                alt="Selected report image preview"
                fill
                sizes="(max-width: 768px) 100vw, 360px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={(e) => handleRemoveImage(e, selectedPreviewImage)}
                className="absolute right-2 top-2 z-20 rounded-full bg-black/70 p-1.5 text-white hover:bg-black"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <div className="px-3 text-center">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#e1eee9] sm:h-10 sm:w-10">
                <ImageIcon className="h-4 w-4 text-[#2f3a45] sm:h-[18px] sm:w-[18px]" />
              </div>
              <p className="text-sm font-bold text-[#2f3a45]">{t("addPhotos")}</p>
              <p className="mx-auto mt-1 max-w-[240px] text-xs leading-4 text-[#4b5563] sm:max-w-none">
                {t("uploadHint")}
              </p>
            </div>
          )}
        </div>

        <div className="mt-2 grid grid-cols-4 gap-1.5 sm:gap-2">
          {Array.from({ length: MAX_THUMBNAILS }).map((_, index) => {
            const image = thumbnailImages[index];

            return image ? (
              <div key={image} className="relative">
                <button
                  type="button"
                  onClick={() => setPreviewImage(image)}
                  className={`relative h-11 w-full overflow-hidden rounded-lg border bg-[#eef2f7] sm:h-[54px] ${
                    selectedPreviewImage === image
                      ? "border-[#08743f] ring-2 ring-[#08743f]/20"
                      : "border-[#d9e2ec]"
                  }`}
                >
                  <Image
                    src={image}
                    alt="Uploaded report image"
                    fill
                    sizes="90px"
                    className="object-cover"
                  />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleRemoveImage(e, image)}
                  className="absolute right-1 top-1 z-20 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                >
                  <X size={11} />
                </button>
              </div>
            ) : (
              <button
                key={index}
                type="button"
                onClick={() => handleChooseImage()}
                disabled={isUploading || images.length >= MAX_IMAGES}
                className="flex h-11 items-center justify-center rounded-lg border border-[#d9e2ec] bg-[#eef2f7] text-[#8aa0bd] disabled:cursor-not-allowed disabled:opacity-50 sm:h-[54px]"
              >
                {isUploading && index === images.length ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={20} />
                )}
              </button>
            );
          })}
        </div>
        
      </div>

      <div className="mt-3 shrink-0 rounded-xl bg-[#0f7a3c] p-2.5 text-white sm:p-3">
        <p className="text-xs font-semibold">{t("proTipTitle")}</p>
        <p className="mt-1 text-[11px] leading-4 text-white/80">{t("proTipBody")}</p>
      </div>
    </div>
  );
}