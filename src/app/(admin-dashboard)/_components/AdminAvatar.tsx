"use client";

import { useState } from "react";
import Image from "next/image";
import { getAttachmentUrl } from "@/utils/getAttachmentUrl";

type AdminAvatarProps = {
  src?: string | null;
  name?: string | null;
  sizeClassName?: string;
  textClassName?: string;
  imageSizes?: string;
};

export default function AdminAvatar({
  src,
  name,
  sizeClassName = "h-8 w-8",
  textClassName = "text-xs",
  imageSizes = "32px",
}: AdminAvatarProps) {
  const [failed, setFailed] = useState(false);
  const imageSrc = getAttachmentUrl(src);
  const safeName = name?.trim() || "Unknown user";
  const initial = safeName.charAt(0).toUpperCase() || "?";

  if (!imageSrc || failed) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-stone-200 font-semibold text-stone-600 ${sizeClassName} ${textClassName}`}
      >
        {initial}
      </span>
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={safeName}
      width={96}
      height={96}
      sizes={imageSizes}
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-full object-cover ${sizeClassName}`}
    />
  );
}
