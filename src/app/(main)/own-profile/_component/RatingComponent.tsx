"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import Image from "next/image";
import PaginationComponent from "./PaginationComponent";
import type { ProfileReviewItem } from "../_lib/own-profile.types";
import { useI18n } from "@/lib/i18n/I18nContext";

const PROFILE_TEXT = {
  "profile.description.rating": { en: "Ratings and reviews will appear here once interactions or orders are successfully completed.", kh: "ការវាយតម្លៃ និងមតិយោបល់នឹងបង្ហាញនៅទីនេះ បន្ទាប់ពីការទំនាក់ទំនង ឬការបញ្ជាទិញបានបញ្ចប់ដោយជោគជ័យ។" },
  "profile.rating.buyerReviews": { en: "Buyer reviews", kh: "មតិយោបល់ពីអ្នកទិញ" },
  "profile.rating.contractFulfillment": { en: "Contract Fulfillment", kh: "ការអនុវត្តកិច្ចសន្យា" },
  "profile.rating.cropQuality": { en: "Crop Quality", kh: "គុណភាពដំណាំ" },
  "profile.rating.deliveryPerformance": { en: "Delivery Performance", kh: "ប្រសិទ្ធភាពដឹកជញ្ជូន" },
  "profile.rating.farmerReviews": { en: "Farmer reviews", kh: "មតិយោបល់ពីកសិករ" },
  "profile.rating.overallRating": { en: "Overall Rating", kh: "ការវាយតម្លៃសរុប" },
  "profile.rating.whatBuyerRate": { en: "What Buyer Rate", kh: "អ្វីដែលអ្នកទិញវាយតម្លៃ" },
  "profile.rating.whatFarmerRate": { en: "What Farmer Rate", kh: "អ្វីដែលកសិករវាយតម្លៃ" },
} as const;

function getProfileText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  return (key: string) =>
    PROFILE_TEXT[key as keyof typeof PROFILE_TEXT]?.[lang] ?? key;
}

type UserRole = "farmer" | "buyer" | "government";

type RatingComponentProps = {
  role: UserRole;
  reviews: ProfileReviewItem[];
};

const ITEMS_PER_PAGE = 4;

const CUSTOMER_RATES = [
  {
    labelKey: "profile.rating.cropQuality",
    badgeClass: "bg-[#E6F4EA] text-[#137333]",
    circleClass: "border-[#137333] text-[#137333]",
  },
  {
    labelKey: "profile.rating.contractFulfillment",
    badgeClass: "bg-[#FEF3D6] text-[#B06000]", 
    circleClass: "border-[#B06000] text-[#B06000]",
  },
  {
    labelKey: "profile.rating.deliveryPerformance",
    badgeClass: "bg-[#F3E8FF] text-[#6B21A8]", 
    circleClass: "border-[#6B21A8] text-[#6B21A8]",
  },
  {
    labelKey: "profile.rating.overallRating",
    badgeClass: "bg-[#E8F0FE] text-[#1A73E8]", 
    circleClass: "border-[#1A73E8] text-[#1A73E8]",
  },
];

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  const roundedRating = Math.round(rating);

  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={size}
          className={
            index < roundedRating
              ? "fill-secondary text-secondary"
              : "text-light-grey"
          }
        />
      ))}
    </div>
  );
}

function getRatingBreakdown(reviews: ProfileReviewItem[]) {
  const total = reviews.length || 1;

  return [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter(
      (review) => Math.round(review.rating) === rating,
    ).length;

    return {
      rating,
      percentage: `${Math.round((count / total) * 100)}%`,
      count,
    };
  });
}

function getCriteriaAverages(reviews: ProfileReviewItem[]) {
  const scores = new Map<string, { total: number; count: number }>();

  reviews.forEach((review) => {
    review.criteriaScores.forEach((criteria) => {
      const current = scores.get(criteria.label) ?? { total: 0, count: 0 };
      scores.set(criteria.label, {
        total: current.total + criteria.value,
        count: current.count + 1,
      });
    });
  });

  const averages = Array.from(scores.entries()).map(([label, score]) => ({
    label,
    rating: score.count ? score.total / score.count : 0,
  }));

  return averages.length
    ? averages
    : CUSTOMER_RATES.map((item) => ({ label: item.labelKey, rating: 0 }));
}

export default function RatingComponent({ role, reviews }: RatingComponentProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const { language } = useI18n();
  const t = getProfileText(language);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";
  const reviewTitle = role === "farmer" ? t("profile.rating.buyerReviews") : t("profile.rating.farmerReviews");
  const ratingTitle =
    role === "farmer" ? t("profile.rating.whatBuyerRate") : t("profile.rating.whatFarmerRate");

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);

    return total / reviews.length;
  }, [reviews]);

  const roundedAverage = Math.round(averageRating);
  const breakdownBars = useMemo(() => getRatingBreakdown(reviews), [reviews]);
  const criteriaAverages = useMemo(() => getCriteriaAverages(reviews), [reviews]);

  const translateCriteriaLabel = (label: string) => {
    const normalized = label.trim().toLowerCase();

    if (normalized === "crop quality") return t("profile.rating.cropQuality");
    if (normalized === "contract fulfillment") return t("profile.rating.contractFulfillment");
    if (normalized === "delivery performance") return t("profile.rating.deliveryPerformance");
    if (normalized === "overall rating") return t("profile.rating.overallRating");
    if (label.startsWith("profile.rating.")) return t(label);

    return label;
  };

  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    return reviews.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [reviews, currentPage]);

  return (
    <div className={`w-full ${fontClass}`}>
      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[340px_1fr] xl:gap-8">
        <aside className="rounded-4xl border border-light-grey bg-white p-5 shadow-sm sm:p-11">
          <div className="flex flex-col items-center pb-6 text-center">
            <span className="text-[15px] font-bold text-muted">
              {reviewTitle}
            </span>

            <h2 className="mt-1 text-[48px] font-extrabold leading-none tracking-tight text-primary-heading sm:text-[54px]">
              {averageRating.toFixed(1)}
            </h2>

            <div className="mt-3">
              <StarRating rating={roundedAverage} size={20} />
            </div>
          </div>

          <div className="flex flex-col gap-3 py-6">
            {breakdownBars.map((bar) => (
              <div key={bar.rating} className="flex items-center gap-3">
                {/* Outlined index numbers for rows matching layout */}
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-primary/40 text-[9px] font-semibold text-primary/70">
                  {bar.rating}
                </span>

                <Star
                  size={12}
                  className="shrink-0 fill-secondary text-secondary"
                />

                <div className="relative h-2 flex-1 rounded-full bg-light-grey">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-[#117343]"
                    style={{ width: bar.percentage }}
                  />
                </div>

                <span className="w-8 text-right text-[11px] font-bold text-muted/60">
                  {bar.percentage}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom Section Layout updated */}
          <div className="pt-4">
            <h4 className="mb-5 text-[13px] font-extrabold uppercase tracking-wide text-primary-heading">
              {ratingTitle}
            </h4>

            <div className="flex flex-col gap-4">
              {criteriaAverages.map((item, index) => {
                const config = CUSTOMER_RATES[index % CUSTOMER_RATES.length];

                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {/* Styled circular color indicator border from layout */}
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${config.circleClass}`}>
                        {index + 1}
                      </span>

                      <span className="truncate text-[13px] font-semibold text-secondary-body">
                        {translateCriteriaLabel(item.label)}
                      </span>
                    </div>

                    {/* Numeric variable scoring wrapper styled with pastel token properties */}
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide min-w-[75px] text-center ${config.badgeClass}`}
                    >
                      {item.rating.toFixed(1)} Rating
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <section className="flex flex-col gap-4 sm:gap-5">
          {paginatedReviews.length > 0 ? (
            paginatedReviews.map((review) => {
              const reviewerHref = review.reviewerId
                ? `/other-profile/${review.reviewerId}`
                : undefined;
              
              return (
                <article
                  key={review.id}
                  className="flex flex-col gap-4 rounded-4xl border border-light-grey bg-white p-4 shadow-sm sm:flex-row sm:p-6"
                >
                  {review.reviewerId ? (
                    <Link
                      href={reviewerHref || "#"}
                      className="flex h-11 w-11 shrink-0 overflow-hidden rounded-full bg-light-grey transition hover:ring-2 hover:ring-primary"
                    >
                      <Image
                        src={review.avatar}
                        alt={review.author}
                        width={44}
                        height={44}
                        sizes="44px"
                        className="h-full w-full object-cover"
                      />
                    </Link>
                  ) : (
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-light-grey">
                      <Image
                        src={review.avatar}
                        alt={review.author}
                        width={44}
                        height={44}
                        sizes="44px"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        {review.reviewerId ? (
                          <Link
                            href={reviewerHref || "#"}
                            className="text-[15px] font-bold text-primary-heading hover:text-primary transition"
                          >
                            {review.author}
                          </Link>
                        ) : (
                          <h3 className="text-[15px] font-bold text-primary-heading">
                            {review.author}
                          </h3>
                        )}

                        <time className="mt-1 block text-[11px] font-medium text-muted">
                          {review.date}
                        </time>
                      </div>

                      <StarRating rating={review.rating} />
                    </div>

                    <p className="mt-3 text-[14px] font-medium leading-5.5 text-secondary-body">
                      {review.comment}
                    </p>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-4xl border border-light-grey bg-white p-8 text-center text-sm font-semibold text-muted">
              {t("profile.description.rating")}
            </div>
          )}
        </section>
      </div>

      <div className="mt-8 sm:mt-10">
        <PaginationComponent
          currentPage={currentPage}
          totalItems={reviews.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}