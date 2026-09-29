"use client";

import Image from "next/image";
import { ChangeEvent, DragEvent, MouseEvent, RefObject, useState } from "react";
import { ImageIcon, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/I18nContext"; // ✅ read language from context directly

type RatingMediaUploadProps = {
  fileInputRef: RefObject<HTMLInputElement | null>;
  images: string[];
  previewImage: string | null;
  thumbnailImages: string[];
  maxImages: number;
  maxThumbnails: number;
  onChooseImage: (imageToReplace?: string) => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDropImages: (files: File[], imageToReplace?: string) => void;
  onRemoveImage: (
    event: MouseEvent<HTMLButtonElement>,
    imageToRemove: string
  ) => void;
  isUploading?: boolean;
  uploadingLabel?: string;
};

const TEXT = {
  productMedia: { en: "Product Media", kh: "មេឌៀផលិតផល" },
  addPhotos: { en: "Add Photos", kh: "បន្ថែមរូបភាព" },
  uploadHint: {
    en: "Drag and drop or click to upload. High resolution photos increase sales by 50%.",
    kh: "អូស និងទម្លាក់ ឬចុចដើម្បីបង្ហោះ។ រូបភាពដែលមានគុណភាពខ្ពស់បង្កើនការលក់ដល់ ៥០%។",
  },
} as const;

export default function RatingMediaUpload({
  fileInputRef,
  images,
  previewImage,
  thumbnailImages,
  maxImages,
  maxThumbnails,
  onChooseImage,
  onImageChange,
  onDropImages,
  onRemoveImage,
  isUploading = false,
  uploadingLabel = "Uploading photo...",
}: RatingMediaUploadProps) {
  const { language } = useI18n();
  const lang = language === "kh" ? "kh" : "en";
  const t = (key: keyof typeof TEXT) => TEXT[key][lang];
  const [dragTarget, setDragTarget] = useState<string | null>(null);

  const handleDragOver = (
    event: DragEvent<HTMLElement>,
    imageToReplace?: string,
  ) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setDragTarget(imageToReplace ?? "new");
  };

  const handleDragLeave = (event: DragEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setDragTarget(null);
    }
  };

  const handleDrop = (
    event: DragEvent<HTMLElement>,
    imageToReplace?: string,
  ) => {
    event.preventDefault();
    setDragTarget(null);

    const files = Array.from(event.dataTransfer.files ?? []);
    if (!files.length) return;

    onDropImages(files, imageToReplace);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onImageChange}
        className="hidden"
      />

      <div className="rounded-xl border border-[#d9e2ec] bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <ImageIcon size={16} className="text-[#2f3a45]" />
          <h2 className="text-sm font-bold text-[#2f3a45]">
            {t("productMedia")}
          </h2>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => onChooseImage()}
          onDragOver={(event) => handleDragOver(event)}
          onDragLeave={handleDragLeave}
          onDrop={(event) => handleDrop(event)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              onChooseImage();
            }
          }}
          className={cn(
            "relative flex h-[190px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#a8d5c2] bg-[#f8fafc] transition sm:h-[220px] lg:h-[240px]",
            dragTarget === "new" && "border-[#08743f] bg-emerald-50",
          )}
        >
          {isUploading && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/70 text-xs font-bold text-[#08743f]">
              {uploadingLabel}
            </div>
          )}

          {previewImage ? (
            <>
              <Image
                src={previewImage}
                alt="Last uploaded image"
                fill
                className="object-cover"
              />

              <button
                type="button"
                onClick={(event) => onRemoveImage(event, previewImage)}
                className="absolute right-2 top-2 z-20 rounded-full bg-black/70 p-1 text-white hover:bg-black"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <div className="px-4 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#e1eee9]">
                <ImageIcon size={18} className="text-[#2f3a45]" />
              </div>
              <p className="text-sm font-bold text-[#2f3a45]">
                {t("addPhotos")}
              </p>
              <p className="mt-1 text-xs leading-4 text-[#4b5563]">
                {t("uploadHint")}
              </p>
            </div>
          )}
        </div>

        <div className="mt-2 grid grid-cols-4 gap-2">
          {Array.from({ length: maxThumbnails }).map((_, index) => {
            const image = thumbnailImages[index];

            return image ? (
              <div key={image} className="relative">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onChooseImage(image)}
                  onDragOver={(event) => handleDragOver(event, image)}
                  onDragLeave={handleDragLeave}
                  onDrop={(event) => handleDrop(event, image)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      onChooseImage(image);
                    }
                  }}
                  className={cn(
                    "relative h-[56px] w-full cursor-pointer overflow-hidden rounded-lg border border-[#d9e2ec] bg-[#eef2f7] transition sm:h-[64px]",
                    dragTarget === image && "border-[#08743f] ring-2 ring-[#08743f]/20",
                  )}
                >
                  <Image
                    src={image}
                    alt="Uploaded product"
                    fill
                    className="object-cover"
                  />
                </div>

                <button
                  type="button"
                  onClick={(event) => onRemoveImage(event, image)}
                  className="absolute right-1 top-1 z-20 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                >
                  <X size={11} />
                </button>
              </div>
            ) : (
              <button
                key={index}
                type="button"
                onClick={() => onChooseImage()}
                onDragOver={(event) => handleDragOver(event)}
                onDragLeave={handleDragLeave}
                onDrop={(event) => handleDrop(event)}
                disabled={images.length >= maxImages}
                className={cn(
                  "flex h-[56px] items-center justify-center rounded-lg border border-[#d9e2ec] bg-[#eef2f7] text-[#8aa0bd] transition disabled:cursor-not-allowed disabled:opacity-50 sm:h-[64px]",
                  dragTarget === "new" && "border-[#08743f] bg-emerald-50 text-[#08743f]",
                )}
              >
                <Plus size={20} />
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
