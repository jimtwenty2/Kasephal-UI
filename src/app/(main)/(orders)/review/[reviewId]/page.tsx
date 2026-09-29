import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, FileImage, Star, UserRound } from "lucide-react";
import BreadcrumbNav from "@/components/navigation/BreadcrumbNav";
import { getReviewByIdService } from "@/services/ranking.service";
import { getFileUrl } from "@/utils/getFileUrl";
import { resolveReviewersDisplayInfo } from "@/utils/reviewerInfo";

type ReviewDetailPageProps = {
  params: Promise<{
    reviewId: string;
  }>;
};

function formatLabel(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
}

function formatOrderCode(orderId?: string | null) {
  const suffix = orderId?.trim().slice(-4).toUpperCase() || "----";
  return `#ORD-${suffix}`;
}

export default async function ReviewDetailPage({ params }: ReviewDetailPageProps) {
  const { reviewId } = await params;
  const result = await getReviewByIdService(reviewId);
  const review = result.data;

  if (!review) notFound();

  const criteria = Object.entries(review.criteriaScores ?? {}).filter(
    ([, score]) => typeof score === "number",
  );
  const title =
    review.reviewType === "BUYER_REVIEW"
      ? "Buyer Review"
      : review.reviewType === "FARMER_REVIEW"
        ? "Farmer Review"
        : "Review Detail";
  const reviewerInfo = review.reviewerId
    ? (await resolveReviewersDisplayInfo([review]))[review.reviewerId]
    : null;
  const reviewerName = reviewerInfo?.name ?? "Anonymous User";
  const reviewerAvatar = reviewerInfo?.avatar ?? "/assets/no-profile.jpg";
  const attachments = review.attachments ?? [];

  return (
    <div className="font-thicccboi">
      <div className="mt-9 min-w-full px-6">
        <div className="relative z-0 -mt-30 h-20 w-full overflow-hidden rounded-[28px]">
          <Image
            src="/assets/nav-bar/navbar_bg_image.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </div>

      <main className="relative min-h-screen overflow-x-clip bg-[#F9F6EE] px-4 py-6 pb-16 md:px-[120px] md:pb-20">
        <div className="pointer-events-none absolute right-0 top-[10%] z-0 h-[clamp(240px,32vw,480px)] w-[clamp(240px,32vw,480px)] translate-x-1/2 rounded-full bg-amber-300 opacity-15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[4%] left-0 z-0 h-[clamp(240px,32vw,480px)] w-[clamp(240px,32vw,480px)] -translate-x-1/2 rounded-full bg-yellow-300 opacity-15 blur-3xl" />
        <Image
          src="/assets/srov.png"
          width={260}
          height={260}
          alt=""
          className="pointer-events-none absolute right-0 top-[15%] z-0 hidden h-auto max-h-[50%] w-[clamp(100px,9vw,200px)] object-contain opacity-50 sm:block"
        />
        <Image
          src="/assets/srov2.png"
          width={260}
          height={260}
          alt=""
          className="pointer-events-none absolute bottom-0 left-0 z-0 hidden h-auto max-h-[50%] w-[clamp(100px,11vw,200px)] object-contain opacity-50 sm:block"
        />

        <section className="relative z-10 mx-auto max-w-5xl">
        <BreadcrumbNav
          items={[
            { label: "Home", href: "/" },
            { label: "Order History", href: "/order-history" },
            ...(review.orderId
              ? [
                  {
                    label: "Order Detail",
                    href: `/order-history/${encodeURIComponent(review.orderId)}`,
                  },
                ]
              : []),
            { label: "Review Detail" },
          ]}
          className="mx-0 mb-3 max-w-none py-0 text-[#4b5563]"
          currentClassName="text-[#08743f]"
        />

        <article className="rounded-3xl border border-none bg-white p-5 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 border-b border-[#EEF2F6] pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                {title}
              </p>
              <h1 className="mt-2 text-2xl font-bold text-primary-heading">
                Review Detail
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3 rounded-2xl border border-[#EEF2F6] bg-[#F8FAF7] px-3 py-2">
                  <Image
                    src={reviewerAvatar}
                    alt={reviewerName}
                    width={38}
                    height={38}
                    className="h-9.5 w-9.5 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                      Review by
                    </p>
                    <p className="text-sm font-bold text-primary-heading">
                      {reviewerName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-[#EEF2F6] bg-white px-3 py-2 text-sm font-bold text-primary-heading">
                  <UserRound className="h-4 w-4 text-primary" />
                  <span>{formatOrderCode(review.orderId)}</span>
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-[#EEF2F6] bg-white px-3 py-2 text-sm font-semibold text-muted">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span>{formatDate(review.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-amber-700">
              <Star className="h-5 w-5 fill-current" />
              <span className="text-2xl font-bold">{review.overallRating}</span>
              <span className="text-sm font-semibold">/ 5</span>
            </div>
          </div>

          <div className="grid gap-6 py-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section>
              <h2 className="text-base font-bold text-primary-heading">Feedback</h2>
              <p className="mt-3 whitespace-pre-wrap rounded-xl bg-[#F8FAF7] p-4 text-sm leading-6 text-description-text">
                {review.feedback || "No written feedback was provided."}
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-primary-heading">Scores</h2>
              <div className="mt-3 space-y-3">
                {criteria.length > 0 ? (
                  criteria.map(([key, score]) => (
                    <div key={key} className="rounded-xl border border-[#EEF2F6] p-3">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-semibold text-primary-heading">
                          {formatLabel(key)}
                        </span>
                        <span className="font-bold text-primary">{score}/5</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl bg-[#F8FAF7] p-4 text-sm text-muted">
                    No criteria scores were provided.
                  </p>
                )}
              </div>
            </section>
          </div>

          {attachments.length > 0 && (
            <section className="border-t border-[#EEF2F6] pt-5">
              <div className="flex items-center gap-2">
                <FileImage className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold text-primary-heading">
                  Attachments
                </h2>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {attachments.map((attachment) => {
                  const imageUrl = getFileUrl(attachment.fileName);

                  return (
                    <Link
                      key={attachment.reviewAttachmentId ?? attachment.fileName}
                      href={imageUrl || "#"}
                      target="_blank"
                      className="group relative block aspect-[4/3] overflow-hidden rounded-2xl border border-[#E4E7E4] bg-[#F8FAF7]"
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt="Review attachment"
                          fill
                          sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
                          className="object-cover transition duration-200 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm font-semibold text-muted">
                          Attachment unavailable
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </article>
        </section>
      </main>
    </div>
  );
}
