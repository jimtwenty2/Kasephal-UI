"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

type ProductImageGalleryProps = {
  images: string[];
  title: string;
  fallbackImage: string;
};

export default function ProductImageGallery({
  images,
  title,
  fallbackImage,
}: ProductImageGalleryProps) {
  const gallery = useMemo(
    () => (images.length > 0 ? images : [fallbackImage]),
    [fallbackImage, images],
  );
  const [activeImage, setActiveImage] = useState(gallery[0]);
  const displayedImage = gallery.includes(activeImage) ? activeImage : gallery[0];

  return (
    <div className="space-y-3.5">
      <div className="relative h-60 overflow-hidden rounded-xl bg-[#F2F4F7] sm:h-85">
        <Image
          src={displayedImage}
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 420px"
          className="object-cover"
        />
      </div>

      {gallery.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {gallery.map((img, index) => {
            const isActive = displayedImage === img;

            return (
              <button
                key={`${img}-${index}`}
                type="button"
                onClick={() => setActiveImage(img)}
                className={`relative h-14 overflow-hidden rounded-lg bg-[#F2F4F7] transition-all hover:opacity-90 sm:h-16 ${
                  isActive ? "ring-2 ring-emerald-600/30" : "ring-1 ring-transparent"
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
            );
          })}
        </div>
      )}
    </div>
  );
}
