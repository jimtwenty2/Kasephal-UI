"use client";

import RatingStarInput from "./StarInput";

export type RatingItem = {
  title: string;
  description: string;
  rating: number;
};

type RatingCriteriaProps = {
  ratings: RatingItem[];
  onRatingChange: (ratingIndex: number, starValue: number) => void;
};

export default function RatingCriteria({
  ratings,
  onRatingChange,
}: RatingCriteriaProps) {
  return (
    <div className="space-y-5">
      {ratings.map((item, ratingIndex) => (
        <div
          key={item.title}
          className="grid gap-y-2 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-x-4"
        >
          <div className="grid grid-cols-[12px_1fr] gap-x-1">
            <span className="pt-[2px] text-sm leading-none text-red-500">
              *
            </span>

            <h3 className="text-sm font-semibold leading-none text-[#08743f]">
              {item.title}
            </h3>

            <p className="col-start-2 mt-3 text-sm leading-5 text-[#5b646f]">
              {item.description}
            </p>
          </div>

          <div className="col-start-1 pl-[16px] sm:col-start-auto sm:pl-0">
            <RatingStarInput
              value={item.rating}
              onChange={(value) => onRatingChange(ratingIndex, value)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}