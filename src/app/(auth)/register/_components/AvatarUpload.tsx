"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { UserIcon } from "@heroicons/react/24/solid";
import { pushToast } from "@/lib/toastStore";

type Props = {
  value?: string | null;
  onFileChange: (file: File | null) => void;
};

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

export default function AvatarUpload({ value, onFileChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(value ?? null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      onFileChange(null);
      e.target.value = "";

      pushToast({
        title: "Invalid image type",
        message: "Only JPG and PNG images are allowed.",
        variant: "error",
      });

      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setPreview(previewUrl);
    onFileChange(file);
  };

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex h-25 w-25 items-center justify-center overflow-hidden rounded-full bg-primary/7"
      >
        {preview ? (
          <Image
            src={preview}
            alt="Profile"
            width={100}
            height={100}
            className="h-full w-full object-cover"
          />
        ) : (
          <UserIcon className="h-12 w-12 text-primary" />
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleImageChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-3 flex cursor-pointer gap-1 rounded-[10px] bg-primary/7 p-1 text-xs font-bold text-primary"
      >
        <PhotoIcon className="h-4 w-5" />
        Choose Image
      </button>
    </div>
  );
}