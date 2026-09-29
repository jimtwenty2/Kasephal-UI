"use client";

import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RatingCriteria, { RatingItem } from "./RatingCriteria";
import RatingMediaUpload from "./RatingMediaUpload";
import { rateFarmerAction, rateBuyerAction } from "@/action/review.action";
import type { CriteriaScores } from "@/services/review.service";
import { showApiSuccess } from "@/lib/apiToast";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/I18nContext"; 
import BreadcrumbNav from "@/components/navigation/BreadcrumbNav";
import { uploadAttachmentAction } from "@/components/action-components/uploadAttachmentAction";

type UserRole = "farmer" | "buyer" | "government";
type Lang = "en" | "kh";

type RatingReviewFormProps = {
  role: UserRole;
  alreadyReviewed?: boolean;
};

type ReviewImage = {
  previewUrl: string;
  fileName: string;
};

type RatingFormItem = RatingItem & {
  key: keyof CriteriaScores;
};

// ✅ Translation map
const TEXT = {
  home: { en: "Home", kh: "ទំព័រដើម" },
  orderHistory: { en: "Order History", kh: "ប្រវត្តិការបញ្ជាទិញ" },
  breadcrumb: { en: "Rating and Review", kh: "ការវាយតម្លៃ និង ការពិនិត្យឡើងវិញ" },
  pageTitle: { en: "Rating and Review", kh: "ការវាយតម្លៃ និង ការពិនិត្យឡើងវិញ" },
  pageSubtitle: {
    en: "Expand your Cambodian produce to the digital marketplace.",
    kh: "ពង្រីកផលិតផលកសិផលកម្ពុជារបស់អ្នកទៅកាន់ទីផ្សារឌីជីថល",
  },
  rateExperience: { en: "Rate your experience", kh: "សូមវាយតម្លៃបទពិសោធន៍របស់អ្នក" },
  details: { en: "Details", kh: "ព័ត៌មានលម្អិត" },
  feedback: { en: "Feedback", kh: "មតិយោបល់" },
  feedbackOptional: { en: "optional", kh: "ជម្រើស" },
  feedbackPlaceholder: {
    en: "Share more details about your experience...",
    kh: "សូមចែករំលែកព័ត៌មានលម្អិតបន្ថែមអំពីបទពិសោធន៍របស់អ្នក...",
  },
  proTipTitle: { en: "Pro Tip", kh: "គន្លឹះពីអ្នកជំនាញ" },
  proTipBody: {
    en: "Listings with more than 5 high-quality photos and detailed harvest dates receive 3x more inquiries from industrial buyers.",
    kh: "បញ្ជីដែលមានរូបភាពគុណភាពខ្ពស់ជាង ៥ ហើយនិងកាលបរិច្ឆេទប្រមូលផល ទទួលបានការសាកសួរច្រើនជាង ៣ ដងពីអ្នកទិញឧស្សាហកម្ម។",
  },
  cancel: { en: "CANCEL", kh: "បោះបង់" },
  submit: { en: "SUBMIT REVIEW", kh: "ដាក់បញ្ជូនការពិនិត្យ" },
  submitting: { en: "SUBMITTING...", kh: "កំពុងដាក់បញ្ជូន..." },
  alreadyReviewedTitle: { en: "Review already submitted", kh: "ការពិនិត្យត្រូវបានដាក់បញ្ជូនរួចហើយ" },
  alreadyReviewedBody: {
    en: "You have already reviewed this order.",
    kh: "អ្នកបានពិនិត្យការបញ្ជាទិញនេះរួចហើយ។",
  },
  missingOrderId: {
    en: "Missing order ID. Cannot submit review.",
    kh: "បាត់លេខសម្គាល់ការបញ្ជាទិញ។ មិនអាចដាក់បញ្ជូនការពិនិត្យបានទេ។",
  },
  ratingsRequiredError: {
    en: "Please rate all criteria before submitting.",
    kh: "សូមវាយតម្លៃលក្ខណៈវិនិច្ឆ័យទាំងអស់មុនពេលដាក់បញ្ជូន។",
  },
  submitFailed: { en: "Failed to submit review.", kh: "បរាជ័យក្នុងការដាក់បញ្ជូនការពិនិត្យ។" },
  cropQualityTitle: { en: "Crop Quality", kh: "គុណភាពកសិផល" },
  cropQualityDesc: {
    en: "Freshness, taste, and appearance",
    kh: "ភាពស្រស់ រសជាតិ និងរូបរាងខាងក្រៅ",
  },
  contractReliabilityTitle: { en: "Contract Reliability", kh: "ភាពជឿទុកចិត្តនៃកិច្ចសន្យា" },
  contractReliabilityDesc: {
    en: "Adherence to agreed quantities.",
    kh: "ការគោរពតាមបរិមាណដែលបានព្រមព្រៀង",
  },
  deliveryPerformanceTitle: { en: "Delivery Performance", kh: "ប្រសិទ្ធភាពនៃការដឹកជញ្ជូន" },
  deliveryPerformanceDesc: {
    en: "Timeliness and packaging",
    kh: "ភាពទាន់ពេលវេលា និងការវេចខ្ចប់",
  },
  overallRatingTitle: { en: "Overall Rating", kh: "ការវាយតម្លៃសរុប" },
  overallRatingDesc: { en: "Your overall experience.", kh: "បទពិសោធន៍សរុបរបស់អ្នក" },
  paymentPromptnessTitle: { en: "Payment Promptness", kh: "ភាពទាន់ពេលវេលានៃការបង់ប្រាក់" },
  paymentPromptnessDesc: { en: "Timeliness of payments.", kh: "ភាពទាន់ពេលវេលានៃការបង់ប្រាក់" },
  easeOfTransactionTitle: { en: "Ease of Transaction", kh: "ភាពងាយស្រួលនៃប្រតិបត្តិការ" },
  easeOfTransactionDesc: {
    en: "How smooth the transaction was",
    kh: "ភាពរលូននៃប្រតិបត្តិការ។",
  },
  communicationTitle: { en: "Communication", kh: "ការទំនាក់ទំនង" },
  communicationDesc: { en: "Clarity and responsiveness.", kh: "ភាពច្បាស់លាស់ និងការឆ្លើយតប" },
} as const;

// ─── helpers ─────────────────────────────────────────────────────────────────

const MAX_IMAGES = 5;
const MAX_THUMBNAILS = 4;
const MIN_STAR = 0;

const t = (key: keyof typeof TEXT, lang: Lang): string => TEXT[key][lang];
const normalizeSingleSpaces = (value: string) => value.replace(/ {2,}/g, " ");

const getRatingByRole = (lang: Lang): Record<UserRole, RatingFormItem[]> => ({
  farmer: [
    { key: "paymentPromptness", title: t("paymentPromptnessTitle", lang), description: t("paymentPromptnessDesc", lang), rating: 0 },
    { key: "easeOfTransaction", title: t("easeOfTransactionTitle", lang), description: t("easeOfTransactionDesc", lang), rating: 0 },
    { key: "communication", title: t("communicationTitle", lang), description: t("communicationDesc", lang), rating: 0 },
    { key: "overallRating", title: t("overallRatingTitle", lang), description: t("overallRatingDesc", lang), rating: 0 },
  ],
  buyer: [
    { key: "cropQuality", title: t("cropQualityTitle", lang), description: t("cropQualityDesc", lang), rating: 0 },
    { key: "contractQuality", title: t("contractReliabilityTitle", lang), description: t("contractReliabilityDesc", lang), rating: 0 },
    { key: "deliveryPerformance", title: t("deliveryPerformanceTitle", lang), description: t("deliveryPerformanceDesc", lang), rating: 0 },
    { key: "overallRating", title: t("overallRatingTitle", lang), description: t("overallRatingDesc", lang), rating: 0 },
  ],
  government: [
    { key: "cropQuality", title: t("cropQualityTitle", lang), description: t("cropQualityDesc", lang), rating: 0 },
    { key: "contractQuality", title: t("contractReliabilityTitle", lang), description: t("contractReliabilityDesc", lang), rating: 0 },
    { key: "deliveryPerformance", title: t("deliveryPerformanceTitle", lang), description: t("deliveryPerformanceDesc", lang), rating: 0 },
    { key: "overallRating", title: t("overallRatingTitle", lang), description: t("overallRatingDesc", lang), rating: 0 },
  ],
});

// ─── component ────────────────────────────────────────────────────────────────

export default function RatingReviewForm({
  role,
  alreadyReviewed = false,
}: RatingReviewFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";

  const { language } = useI18n();
  const lang: Lang = language === "kh" ? "kh" : "en";

  useEffect(() => {
    if (alreadyReviewed) {
      showApiSuccess(
        t("alreadyReviewedTitle", lang),
        t("alreadyReviewedBody", lang),
      );
      router.replace("/order-history");
    }
  }, [alreadyReviewed, router, lang]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [replaceImage, setReplaceImage] = useState<string | null>(null);
  const [imageItems, setImageItems] = useState<ReviewImage[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [ratingScores, setRatingScores] = useState<number[]>(
    () => getRatingByRole(lang)[role].map(() => 0),
  );
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep selected scores stable while labels follow the active language.
  const ratings = getRatingByRole(lang)[role].map((item, index) => ({
    ...item,
    rating: ratingScores[index] ?? 0,
  }));

  const images = imageItems.map((image) => image.previewUrl);
  const thumbnailImages = images
    .filter((image) => image !== previewImage)
    .slice(0, MAX_THUMBNAILS);

  const handleChooseImage = (imageToReplace?: string) => {
    if (!imageToReplace && images.length >= MAX_IMAGES) return;
    setReplaceImage(imageToReplace ?? null);
    fileInputRef.current?.click();
  };

  const uploadImageFiles = async (
    files: File[],
    imageToReplace?: string | null,
  ) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (!imageFiles.length) return;

    const availableSlots = imageToReplace ? 1 : MAX_IMAGES - imageItems.length;
    const filesToUpload = imageFiles.slice(0, Math.max(0, availableSlots));
    if (!filesToUpload.length) return;

    setIsUploadingImage(true);
    setError(null);

    try {
      const uploadedImages: ReviewImage[] = [];

      for (const file of filesToUpload) {
        const result = await uploadAttachmentAction(file);

        if (!result.success || !result.fileName) {
          setError(result.error ?? "Failed to upload photo.");
          continue;
        }

        uploadedImages.push({
          fileName: result.fileName,
          previewUrl: result.imageUrl ?? URL.createObjectURL(file),
        });
      }

      if (uploadedImages.length === 0) return;

      if (imageToReplace) {
        const nextImage = uploadedImages[0];

        setImageItems((prev) =>
          prev.map((image) =>
            image.previewUrl === imageToReplace ? nextImage : image,
          ),
        );
        setPreviewImage(nextImage.previewUrl);
        return;
      }

      setImageItems((prev) => {
        const nextImages = [...prev, ...uploadedImages].slice(0, MAX_IMAGES);
        setPreviewImage(nextImages[nextImages.length - 1]?.previewUrl ?? null);
        return nextImages;
      });
    } finally {
      setIsUploadingImage(false);
      setReplaceImage(null);
    }
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    await uploadImageFiles(files, replaceImage);
    event.target.value = "";
  };

  const handleDropImages = (files: File[], imageToReplace?: string) => {
    void uploadImageFiles(files, imageToReplace ?? null);
  };

  const handleRemoveImage = (
    event: MouseEvent<HTMLButtonElement>,
    imageToRemove: string,
  ) => {
    event.stopPropagation();
    setImageItems((prev) => {
      const nextImages = prev.filter((image) => image.previewUrl !== imageToRemove);
      if (previewImage === imageToRemove) {
        setPreviewImage(nextImages[nextImages.length - 1]?.previewUrl ?? null);
      }
      return nextImages;
    });
  };

  const handleRatingChange = (ratingIndex: number, starValue: number) => {
    const safeStarValue = Math.max(MIN_STAR, starValue);
    setRatingScores((prev) => {
      const nextScores = [...prev];
      nextScores[ratingIndex] = safeStarValue;
      return nextScores;
    });
    if (error === t("ratingsRequiredError", lang)) {
      setError(null);
    }
  };

  const handleFeedbackChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setFeedback(normalizeSingleSpaces(event.target.value));
  };

  const handleSubmit = async () => {
    setError(null);

    if (!orderId) {
      setError(t("missingOrderId", lang));
      return;
    }

    const hasUnratedCriteria = ratings.some((item) => item.rating < 1);
    if (hasUnratedCriteria) {
      setError(t("ratingsRequiredError", lang));
      return;
    }

    const trimmedFeedback = feedback.trim();

    const criteriaScores: CriteriaScores = {};
    ratings.forEach((item) => {
      criteriaScores[item.key] = item.rating;
    });

    setIsSubmitting(true);

    try {
      const action = role === "farmer" ? rateBuyerAction : rateFarmerAction;

      const result = await action({
        orderId,
        criteriaScores,
        feedback: trimmedFeedback,
        attachments: imageItems.map((image) => image.fileName),
      });

      if (!result.success) {
        setError(result.error ?? t("submitFailed", lang));
        return;
      }

      showApiSuccess("Review submitted", "Your rating has been submitted successfully.");
      setTimeout(() => {
        router.push("/order-history");
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("submitFailed", lang),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setImageItems([]);
    setPreviewImage(null);
    setFeedback("");
    setRatingScores(getRatingByRole(lang)[role].map(() => 0));
    setError(null);
  };

  if (alreadyReviewed) return null;

  return (
    <div className={`mt-5 relative overflow-x-clip ${lang === "kh" ? "font-khmer" : ""}`}>
      <div className="px-4 md:px-[120px]">
        <BreadcrumbNav
          items={[
            { label: t("home", lang), href: "/" },
            { label: t("orderHistory", lang), href: "/order-history" },
            ...(orderId
              ? [
                  {
                    label: "Order Detail",
                    href: `/order-history/${encodeURIComponent(orderId)}`,
                  },
                ]
              : []),
            { label: t("breadcrumb", lang) },
          ]}
          className="mx-0 mb-3 max-w-none py-0 text-[#4b5563]"
          currentClassName="text-[#08743f]"
        />
      </div>

      {/* Yellow blur glow circles */}
      <div className="pointer-events-none absolute right-0 top-[10%] z-0 h-[clamp(240px,32vw,480px)] w-[clamp(240px,32vw,480px)] translate-x-1/2 rounded-full bg-amber-300 opacity-15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[4%] left-0 z-0 h-[clamp(240px,32vw,480px)] w-[clamp(240px,32vw,480px)] -translate-x-1/2 rounded-full bg-yellow-300 opacity-15 blur-3xl" />

      {/* Decorative background crops */}
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

      <main className="bg-[#F9F6EE] px-4 py-6 pb-16 md:px-[120px] md:pb-20">
        <section className="flex w-full flex-col">
          <div className="mb-4 w-full">
            <h1 className="text-xl font-bold text-[#1f2933] sm:text-2xl">
              {t("pageTitle", lang)}
            </h1>
            <p className="mt-1 text-sm font-medium text-[#6b7280]">
              {t("pageSubtitle", lang)}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <div className="grid w-full gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
            <div>
              <RatingMediaUpload
                fileInputRef={fileInputRef}
                images={images}
                previewImage={previewImage}
                thumbnailImages={thumbnailImages}
                maxImages={MAX_IMAGES}
                maxThumbnails={MAX_THUMBNAILS}
                onChooseImage={handleChooseImage}
                onImageChange={handleImageChange}
                onDropImages={handleDropImages}
                onRemoveImage={handleRemoveImage}
                isUploading={isUploadingImage}
                uploadingLabel="Uploading photo..."
              />

              <div className="mt-3 rounded-xl bg-[#0f7a3c] p-3 text-white">
                <p className="text-xs font-semibold">{t("proTipTitle", lang)}</p>
                <p className="mt-1 text-[11px] leading-4 text-white/80">
                  {t("proTipBody", lang)}
                </p>
              </div>
            </div>

            <div>
              <div className="rounded-xl border border-[#d9e2ec] bg-white p-4 shadow-sm">
                <h2 className="mb-4 text-sm font-bold text-[#2f3a45]">
                  {t("rateExperience", lang)}
                </h2>

                <RatingCriteria
                  ratings={ratings}
                  onRatingChange={handleRatingChange}
                />

                <div className="mt-5">
                  <h2 className="mb-3 text-sm font-bold text-[#2f3a45]">
                    {t("details", lang)}
                  </h2>

                  <label className="mb-2 block text-sm font-semibold text-[#08743f]">
                    {t("feedback", lang)}
                    <span className="ml-1 font-normal text-[#9ca3af]">
                      ({t("feedbackOptional", lang)})
                    </span>
                  </label>

                  <textarea
                    value={feedback}
                    onChange={handleFeedbackChange}
                    placeholder={t("feedbackPlaceholder", lang)}
                    className="min-h-[100px] w-full resize-y rounded-xl border border-[#d9e2ec] bg-white p-3 text-sm text-[#1f2933] outline-none transition placeholder:text-gray-400 focus:border-[#08743f] focus:outline-none focus:ring-0"
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="h-11 rounded-xl border border-[#9ca3af] px-6 text-xs font-bold text-[#374151] transition hover:bg-white disabled:opacity-50"
                >
                  {t("cancel", lang)}
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || isUploadingImage}
                  className="flex h-11 min-w-[140px] items-center justify-center rounded-xl bg-[#f8bd4d] px-6 text-xs font-bold text-[#1f2933] transition hover:bg-[#f5b437] disabled:opacity-50"
                >
                  {isSubmitting ? t("submitting", lang) : t("submit", lang)}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
