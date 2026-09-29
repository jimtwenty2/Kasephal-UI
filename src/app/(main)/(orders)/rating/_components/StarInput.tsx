"use client";

import { Star } from "lucide-react";

type RatingStarInputProps = {
  value: number;
  onChange: (value: number) => void;
};

export default function RatingStarInput({
  value,
  onChange,
}: RatingStarInputProps) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;

        return (
          <button
            key={starValue}
            type="button"
            onClick={() => onChange(value === starValue ? starValue - 1 : starValue)}
            className="transition hover:scale-110"
          >
            <Star
              size={18}
              className={
                starValue <= value
                  ? "fill-[#f6b545] text-[#f6b545]"
                  : "text-[#9ca3af]"
              }
            />
          </button>
        );
      })}
    </div>
  );
}