"use client";

import Image from "next/image";
import { useState } from "react";

const FALLBACK_IMAGE = "/assets/image/no-product.jpg";

type CropProductImageGalleryProps = {
  images: string[];
  title: string;
};

export default function CropProductImageGallery({
  images,
  title,
}: CropProductImageGalleryProps) {
  const galleryImages = images.length > 0 ? images : [FALLBACK_IMAGE];
  const [activeImage, setActiveImage] = useState(galleryImages[0]);
  const mainImage = galleryImages.includes(activeImage)
    ? activeImage
    : galleryImages[0];

  return (
    <div className="space-y-3.5">
      <div className="relative h-60 overflow-hidden rounded-xl bg-[#F2F4F7] sm:h-85">
        <Image
          key={mainImage}
          src={mainImage}
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 420px"
          className="object-cover"
        />
      </div>

      {galleryImages.length > 0 && (
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {galleryImages.map((img, index) => (
            <button
              type="button"
              key={`${img}-${index}`}
              onClick={() => setActiveImage(img)}
              className={`relative h-14 cursor-pointer overflow-hidden rounded-lg bg-[#F2F4F7] transition-all hover:opacity-90 sm:h-16 ${
                img === mainImage ? "ring-2 ring-emerald-600/60" : ""
              }`}
              aria-label={`Show product image ${index + 1}`}
            >
              <Image
                src={img}
                alt={`Thumbnail view ${index + 1}`}
                fill
                sizes="100px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
