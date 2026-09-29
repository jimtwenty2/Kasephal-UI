import { CropProductPost } from "@/types/crop-product";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import Link from "next/link";
import ActionButtons from "./ActionButtons";
import CropProductImageGallery from "./CropProductImageGallery";
import type { UserRole } from "@/constants/role";
import type { IdentityVerificationState } from "@/lib/identityVerification";
import {
  getCropProductImages,
  normalizeCropProductImageUrl,
} from "@/lib/cropProductImage";
import type { FarmerReview } from "@/types/rankingView";
import { formatCambodiaPhone } from "@/utils/formatCambodiaPhone";
import BreadcrumbNav from "@/components/navigation/BreadcrumbNav";
import { resolveReviewersDisplayInfo } from "@/utils/reviewerInfo";
import { FALLBACK_PROFILE_AVATAR } from "@/utils/profileDisplay";
import { formatCropProductFullLocation } from "@/utils/cropProduct.helpers";
import {
  DetailCropName,
  DetailCropType,
  DetailFarmerRanking,
  DetailLocation,
  DetailProductTitle,
  DetailReviewDate,
  DetailReviewSummary,
  DetailText,
  DetailUnit,
  DynamicProductText,
} from "./CropProductDetailsI18n";

interface CropProductDetailProps {
  data: CropProductPost;
  reviews?: FarmerReview[];
  role?: UserRole | null;
  identityVerification?: IdentityVerificationState | null;
}

const FALLBACK_PROFILE_IMAGE = "/assets/no-profile.jpg";
const FALLBACK_AVATAR = FALLBACK_PROFILE_AVATAR;

function getProductImages(imageUrls?: string | string[]) {
  return getCropProductImages(imageUrls);
}

function clampRating(value: unknown) {
  const rating = Number(value);
  if (!Number.isFinite(rating)) return 0;
  return Math.min(5, Math.max(0, rating));
}

function getRatingBreakdown(reviews: FarmerReview[]) {
  const total = reviews.length || 1;

  return [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter(
      (review) => Math.round(clampRating(review.overallRating)) === rating,
    ).length;

    return {
      rating,
      percentage: Math.round((count / total) * 100),
    };
  });
}

function Stars({ rating }: { rating: number }) {
  const filledStars = Math.round(clampRating(rating));
  const grayCount = 5 - filledStars;

  return (
    <div className="flex gap-0.5 text-[#F6B941]">
      {Array.from({ length: filledStars }).map((_, i) => (
        <Star key={`yellow-${i}`} size={16} fill="currentColor" stroke="none" />
      ))}
      {Array.from({ length: grayCount }).map((_, i) => (
        <Star
          key={`gray-${i}`}
          size={16}
          className="text-[#D0D5DD]"
          fill="currentColor"
          stroke="none"
        />
      ))}
    </div>
  );
}

export default async function CropProductDetail({
  data,
  reviews = [],
}: CropProductDetailProps) {

  const title = data.post?.title || data.crop?.cropName || "Unnamed Product";
  const description = data.post?.description?.trim() || "";
  const cropName = data.crop?.cropName || "N/A";
  const titleMatchesCropName = title === data.crop?.cropName;
  const cropType = data.crop?.cropTypeName || "N/A";
  const farmerName = data.farmerName || data.sellerName || "Farmer";
  const farmerLocation = formatCropProductFullLocation(data.farmerLocation || data.location);
  const farmerPhoneNumber = formatCambodiaPhone(data.farmerPhoneNumber) || "N/A";
  const farmerEmail = data.farmerEmail || "N/A";
  const isRielCurrency = data.currencyCode === "KHR";
  const currencyLabel =
    data.currencyCode === "USD"
      ? "$"
      : isRielCurrency
        ? "៛"
        : `${data.currencyCode} `;
  const farmerId = data.createdBy ?? data.farmerId;
  const images = getProductImages(data.imageUrls);

  const farmerProfileImage = data.farmerProfileUrl
    ? normalizeCropProductImageUrl(data.farmerProfileUrl)
    : FALLBACK_PROFILE_IMAGE;

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + clampRating(review.overallRating), 0) /
        reviews.length
      : 0;
  const ratingBreakdown = getRatingBreakdown(reviews);
  const displayedReviews = reviews.slice(0, 5);
  const reviewerInfoMap = await resolveReviewersDisplayInfo(displayedReviews);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#fbf6e9] pb-14 pt-4 font-thicccboi sm:pb-20 sm:pt-6">
      <Image
        src="/assets/srov.png"
        width={260}
        height={260}
        alt="srov"
        className="pointer-events-none absolute right-0 top-[15%] z-0 h-auto max-h-[50%] w-[clamp(240px,9vw,200px)] object-contain opacity-50"
      />
      <Image
        src="/assets/srov2.png"
        width={260}
        height={260}
        alt="srov2"
        className="pointer-events-none absolute bottom-0 left-0 z-0 h-auto max-h-[50%] w-[clamp(240px,11vw,200px)] object-contain opacity-50"
      />

      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          className="mx-auto mb-6 max-w-285 py-0 font-semibold sm:mb-8"
          currentClassName="max-w-full truncate font-semibold text-emerald-800 sm:max-w-80"
          items={[
            { label: <DetailText k="cropProductDetails.home" />, href: "/" },
            {
              label: <DetailText k="cropProductDetails.cropProducts" />,
              href: "/listing-product",
            },
            {
              label: (
                titleMatchesCropName ? (
                  <DetailProductTitle
                    title={title}
                    cropName={data.crop?.cropName}
                  />
                ) : (
                  <DynamicProductText
                    value={title}
                    fallback={
                      <DetailProductTitle
                        title={title}
                        cropName={data.crop?.cropName}
                      />
                    }
                  />
                )
              ),
            },
          ]}
        />

        <div className="mx-auto w-full max-w-285">
          <section className="mt-6 flex flex-col gap-4 rounded-2xl p-4 backdrop-blur-xs sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <Link
              href={`/other-profile/${farmerId}`}
              className="group flex min-w-0 items-center gap-3.5"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white bg-[#E4E7EC] shadow-xs">
                <Image
                  src={farmerProfileImage}
                  alt="Farmer Profile Avatar"
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0">
                <h1 className="break-words text-base font-bold leading-tight text-[#1D2939] transition-colors group-hover:text-emerald-800 sm:text-lg">
                  <DynamicProductText
                    value={farmerLocation}
                    fallback={<DetailLocation value={farmerLocation} />}
                  />
                </h1>
                <p className="mt-0.5 break-words text-[13px] font-medium text-[#667085]">
                  {farmerName} •{" "}
                  <span className="text-[#98A2B3]">
                    <DetailText k="cropProductDetails.farmer" />
                  </span>
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F8F4] px-2.5 py-1 text-[11px] font-bold text-[#087443]">
                    <Star size={12} fill="currentColor" stroke="none" />
                    {averageRating.toFixed(2)}
                  </span>
                  <span className="rounded-full bg-[#FFF4D6] px-2.5 py-1 text-[11px] font-bold text-[#7A4F00]">
                    <DetailFarmerRanking
                      rating={averageRating}
                      reviewCount={reviews.length}
                    />
                  </span>
                </div>
              </div>
            </Link>

            <div className="grid w-full min-w-0 grid-cols-1 gap-3 text-[13px] sm:w-auto sm:grid-cols-2 sm:border-l sm:border-[#D0D5DD] sm:pl-8">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">
                  <DetailText k="cropProductDetails.phoneNumber" />
                </p>
                <p className="mt-0.5 break-words font-semibold text-[#344054]">{farmerPhoneNumber}</p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">
                  <DetailText k="cropProductDetails.email" />
                </p>
                <p className="mt-0.5 break-words font-semibold text-[#344054]">{farmerEmail}</p>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <div className="grid gap-6 rounded-3xl bg-white p-4 shadow-xs sm:p-5 md:gap-8 md:p-8 lg:grid-cols-[minmax(0,420px)_1fr]">
              <CropProductImageGallery images={images} title={title} />

              <div className="flex flex-col justify-between space-y-6 lg:space-y-0">
                <div className="space-y-4">
                  <span className="inline-flex items-center rounded-full bg-[#E8F8F4] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#087443]">
                    <DetailText k="cropProductDetails.inStock" /> -{" "}
                    {data.stockLeft ?? 0} <DetailUnit value={data.unitType} />{" "}
                    <DetailText k="cropProductDetails.available" />
                  </span>

                  <h2 className="text-2xl font-bold tracking-tight text-[#1D2939] sm:text-3xl">
                    {titleMatchesCropName ? (
                      <DetailProductTitle
                        title={title}
                        cropName={data.crop?.cropName}
                      />
                    ) : (
                      <DynamicProductText
                        value={title}
                        fallback={
                          <DetailProductTitle
                            title={title}
                            cropName={data.crop?.cropName}
                          />
                        }
                      />
                    )}
                  </h2>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#98A2B3]">
                    <MapPin size={14} className="text-[#98A2B3]" />
                    <span className="uppercase tracking-wider">
                      <DynamicProductText
                        value={farmerLocation}
                        fallback={<DetailLocation value={farmerLocation} />}
                      />
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 pt-2 sm:grid-cols-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">
                        <DetailText k="cropProductDetails.cropName" />
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#344054]">
                        <DetailCropName value={cropName} />
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">
                        <DetailText k="cropProductDetails.cropType" />
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#344054]">
                        <DynamicProductText
                          value={cropType}
                          fallback={<DetailCropType value={cropType} />}
                        />
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">
                        <DetailText k="cropProductDetails.price" />
                      </p>
                      <p className="mt-0.5 inline-flex items-end text-xl font-black leading-none text-[#087443]">
                        <span className={isRielCurrency ? "inline-block translate-y-0.75 text-2xl leading-none" : ""}>
                          {currencyLabel}
                        </span>
                        {data.pricePerUnit?.toLocaleString() ?? 0}
                        <span className="text-xs font-medium text-[#667085]">
                          /<DetailUnit value={data.unitType} />
                        </span>
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">
                        <DetailText k="cropProductDetails.quantity" />
                      </p>
                      <p className="mt-0.5 text-xl font-black text-[#087443]">
                        {data.totalQuantity?.toLocaleString() ?? 0}
                        <span className="ml-1 text-xs font-medium text-[#667085]">
                          <DetailUnit value={data.unitType} />
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[#F2F4F7] pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">
                      <DetailText k="cropProductDetails.productDescription" />
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#475467] sm:text-[13px]">
                      <DynamicProductText
                        value={description}
                        fallback={
                          <DetailText k="cropProductDetails.noDescription" />
                        }
                      />
                    </p>
                  </div>
                </div>
                
                <ActionButtons
                  cropProductId={data.cropProductId}
                  postId={data.postId}
                  farmerId={farmerId}
                  farmerName={data.farmerName}
                  farmerLocation={farmerLocation}
                  productOwnerId={data.farmerId ?? data.sellerId ?? data.post?.createdBy}
                />
              </div>
            </div>
          </section>

          <section className="mt-10">
            <div className="grid gap-6 rounded-2xl bg-white p-4 shadow-xs sm:gap-8 sm:p-7 lg:grid-cols-[210px_1fr] lg:p-8">
              <aside className="space-y-5">
                <div>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold leading-none text-[#101828]">
                      {averageRating.toFixed(1)}
                    </span>
                    <span className="text-lg font-bold text-[#475467]">/ 5</span>
                  </div>

                  <div className="mt-4">
                    <Stars rating={averageRating} />
                  </div>

                  <p className="mt-1 text-xs font-medium text-[#667085]">
                    <DetailReviewSummary count={reviews.length} />
                  </p>
                </div>

                <div className="space-y-2">
                  {ratingBreakdown.map((item) => (
                    <div
                      key={item.rating}
                      className="grid grid-cols-[30px_minmax(0,1fr)_34px] items-center gap-2 text-[10px] text-[#344054] sm:grid-cols-[34px_1fr_34px]"
                    >
                      <span>
                        {item.rating} <DetailText k="cropProductDetails.star" />
                      </span>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#EAECF0]">
                        <div
                          className="h-full rounded-full bg-[#F6B941]"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-right">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </aside>

              {/* Fix 2: Corrected JSX structure — removed duplicate date, fixed closing tags */}
              <div className="divide-y divide-[#EAECF0]">
                {displayedReviews.length > 0 ? (
                  displayedReviews.map((review) => {
                    const reviewerInfo = review.reviewerId
                      ? reviewerInfoMap[review.reviewerId]
                      : undefined;
                    const reviewerName = reviewerInfo?.name ?? "Anonymous";
                    const reviewerAvatar = reviewerInfo?.avatar ?? FALLBACK_AVATAR;
                    const reviewerHref = review.reviewerId
                      ? `/other-profile/${review.reviewerId}`
                      : undefined;

                    return (
                      <article
                        key={review.reviewId}
                        className="flex flex-col gap-4 py-6 first:pt-0 last:pb-0 sm:flex-row"
                      >
                        {review.reviewerId ? (
                          <Link
                            href={reviewerHref || "#"}
                            className="flex h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#E4E7EC] transition hover:ring-2 hover:ring-emerald-600"
                          >
                            <Image
                              src={reviewerAvatar}
                              alt={reviewerName}
                              width={44}
                              height={44}
                              sizes="44px"
                              className="h-full w-full object-cover"
                            />
                          </Link>
                        ) : (
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#E4E7EC]">
                            <Image
                              src={reviewerAvatar}
                              alt={reviewerName}
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
                                  className="text-sm font-bold text-[#101828] transition hover:text-emerald-800"
                                >
                                  {reviewerName}
                                </Link>
                              ) : (
                                <h3 className="text-sm font-bold text-[#101828]">
                                  {reviewerName}
                                </h3>
                              )}
                              <time className="mt-1 block text-[10px] font-medium text-[#667085]">
                                <DetailReviewDate value={review.createdAt} />
                              </time>
                            </div>

                            <Stars rating={review.overallRating} />
                          </div>

                          <p className="mt-3 max-w-170 text-xs leading-relaxed text-[#344054] sm:text-[13px]">
                            &quot;
                            {review.feedback || (
                              <DetailText k="cropProductDetails.noReviewComment" />
                            )}
                            &quot;
                          </p>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <p className="flex min-h-36 items-center justify-center py-8 text-center text-sm font-semibold text-[#667085]">
                    <DetailText k="cropProductDetails.noReview" />
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
