"use client";

import Image from "next/image";
import { useState } from "react";

interface CropImageProps {
  imageUrls?: string | string[];
  alt: string;
}

const FALLBACK = "/image-demand/product2.jpg";

function resolveImages(imageUrls?: string | string[]): string[] {
  if (!imageUrls) return [FALLBACK];
  if (Array.isArray(imageUrls)) return imageUrls.length > 0 ? imageUrls : [FALLBACK];
  return [imageUrls];
}

export default function CropImage({ imageUrls, alt }: CropImageProps) {
  const images = resolveImages(imageUrls);
  const [current, setCurrent] = useState(0);
  const [errored, setErrored] = useState<Record<number, boolean>>({});

  const src = errored[current] ? FALLBACK : images[current];

  const handleDotClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    e.stopPropagation();
    setCurrent(index);
  };

  return (
    <div className="relative w-full h-full">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 293px) 100vw, 293px"
        priority={false}
        className="object-cover object-top scale-80 w-full h-full transition-transform duration-300 ease-in-out hover:scale-105"
        onError={() => setErrored((prev) => ({ ...prev, [current]: true }))}
      />

      {/* Dot indicators — only show if more than 1 image */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-[5px] z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => handleDotClick(e, index)}
              className={`
                rounded-full transition-all duration-200
                ${
                  index === current
                    ? "w-[18px] h-[5px] bg-black/80 hover:bg-black/90"
                    : "w-[5px] h-[5px] bg-white/50 hover:bg-white/80"
                }
              `}
            />
          ))}
        </div>
      )}
    </div>
  );
}