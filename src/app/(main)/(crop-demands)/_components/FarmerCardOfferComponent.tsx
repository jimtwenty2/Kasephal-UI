"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import type { FarmerOfferItem } from "@/types/farmer-offer";
import { normalizeCropProductImageUrl } from "@/lib/cropProductImage";
import { showApiToast } from "@/lib/apiToast";
import { useI18n } from "@/lib/i18n/I18nContext";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FALLBACK_AVATAR = "/assets/no-profile.jpg";

const FARMER_OFFER_TEXT = {
  "farmerOffer.review": { en: "review", kh: "ការវាយតម្លៃ" },
  "farmerOffer.reviews": { en: "reviews", kh: "ការវាយតម្លៃ" },
  "farmerOffer.locationNotSpecified": { en: "Location not specified", kh: "មិនបានបញ្ជាក់ទីតាំង" },
  "farmerOffer.lockedMessage": { en: "Please verify your identity document before contacting a farmer.", kh: "សូមផ្ទៀងផ្ទាត់ឯកសារអត្តសញ្ញាណរបស់អ្នក មុនពេលទាក់ទងកសិករ។" },
  "farmerOffer.chatUnlocked": { en: "Chat unlocked", kh: "បានបើកការជជែក" },
  "farmerOffer.identityRequired": { en: "Identity verification required", kh: "ត្រូវការផ្ទៀងផ្ទាត់អត្តសញ្ញាណ" },
  "farmerOffer.viewProfileAria": { en: "View {name}'s profile", kh: "មើលប្រវត្តិរូបរបស់ {name}" },
  "farmerOffer.recommended": { en: "Recommended", kh: "បានណែនាំ" },
  "farmerOffer.pricePerUnit": { en: "Price / Unit", kh: "តម្លៃ / ឯកតា" },
  "farmerOffer.offerQty": { en: "Offer Qty", kh: "បរិមាណស្នើ" },
  "farmerOffer.estDelivery": { en: "Est. Delivery", kh: "ការដឹកជញ្ជូនប៉ាន់ស្មាន" },
  "farmerOffer.message": { en: "Message", kh: "សារ" },
  "farmerOffer.noMessage": { en: "No message provided.", kh: "មិនមានសារបានផ្តល់។" },
  "farmerOffer.viewProfile": { en: "View Profile", kh: "មើលប្រវត្តិរូប" },
  "farmerOffer.contactFarmer": { en: "Contact Farmer", kh: "ទាក់ទងកសិករ" },
} as const;
function getFarmerOfferText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  return (key: string, values?: Record<string, string | number>): string => {
    let text: string =
      FARMER_OFFER_TEXT[key as keyof typeof FARMER_OFFER_TEXT]?.[lang] ?? key;

    if (values) {
      Object.entries(values).forEach(([name, value]) => {
        text = text.replaceAll(`{${name}}`, String(value));
      });
    }

    return text;
  };
}

function getImageSrc(src?: string | null) {
  const trimmedSrc = src?.trim();

  return trimmedSrc ? normalizeCropProductImageUrl(trimmedSrc) : FALLBACK_AVATAR;
}

function formatDate(dateStr: string, language = "en") {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat(language === "kh" ? "km-KH" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(dateStr));
}

function formatPrice(price: number, currencyCode?: string | null) {
  const currency = currencyCode === "USD" ? "$" : "KHR ";

  return `${currency}${price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatRating(score?: number | null) {
  const numericScore = Number(score);
  const clampedScore = Number.isFinite(numericScore)
    ? Math.min(5, Math.max(0, numericScore))
    : 0;

  return clampedScore.toFixed(1);
}

function formatReviewText(count: number | null | undefined, t: ReturnType<typeof getFarmerOfferText>) {
  const reviewCount = Math.max(0, Number(count) || 0);
  return `${reviewCount.toLocaleString()} ${reviewCount === 1 ? t("farmerOffer.review") : t("farmerOffer.reviews")}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FarmerCardOfferComponent({
  offer,
  demandPostId,
  isRecommended = false,
  showActions = true,
  isVerifiedIdentity = true,
  lockedMessage,
}: {
  offer: FarmerOfferItem;
  demandPostId?: string;
  isRecommended?: boolean;
  showActions?: boolean;
  isVerifiedIdentity?: boolean;
  lockedMessage?: string;
}) {
  const router = useRouter();
  const { language } = useI18n();
  const t = getFarmerOfferText(language);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";
  const avatar = getImageSrc(offer.farmerProfileUrl);
  console.log("farmer profile url", offer.farmerProfileUrl);
  console.log("avatar",avatar)
  const rating = formatRating(offer.trustScore);
  const reviewText = formatReviewText(offer.reviewCount, t);
  const farmerLocation =
    offer.farmerLocation?.trim() ||
    offer.farmLocation?.trim() ||
    offer.location?.trim() ||
    t("farmerOffer.locationNotSpecified");
  const profileHref = `/other-profile/farmer/${offer.farmerId}`;

  const handleContactFarmer = () => {
    if (!isVerifiedIdentity) {
      showApiToast(
        { success: false, error: lockedMessage ?? t("farmerOffer.lockedMessage") },
        {
          successTitle: t("farmerOffer.chatUnlocked"),
          errorTitle: t("farmerOffer.identityRequired"),
        },
      );
      return;
    }

    const params = new URLSearchParams({
      new: "true",
      postId: demandPostId ?? offer.cropDemandPostId,
      farmerId: offer.farmerId,
      chatType: "CROP_DEMAND",
    });

    router.push(`/chat?${params.toString()}`);
  };

  return (
    <article className={`flex w-full flex-col justify-between rounded-3xl border border-gray-100 bg-white p-4 shadow-sm xs:p-5 ${fontClass}`}>
      <div>
        {/* Farmer info */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            {/* Avatar */}
            <Link
              href={profileHref}
              aria-label={t("farmerOffer.viewProfileAria", { name: offer.farmerName })}
              className="relative h-[12vw] max-h-13 min-h-11 min-w-11 max-w-13 w-[12vw] shrink-0 cursor-pointer overflow-hidden rounded-full bg-[#F2F4F7] transition hover:ring-2 hover:ring-primary/60"
            >
              <Image
                src={avatar}
                alt={offer.farmerName}
                fill
                className="object-cover"
              />
            </Link>

            <div className="min-w-0">
              <h3 className="truncate text-base font-bold leading-tight text-[#101828] xs:text-[17px]">
                <Link
                  href={profileHref}
                  className="cursor-pointer transition hover:text-primary hover:underline"
                >
                  {offer.farmerName}
                </Link>
              </h3>

              {/* Rating and reviews */}
              <div className="mt-1.5 flex items-center gap-1 text-[12px] text-[#344054]">
                <Star size={13} className="shrink-0 fill-[#FDB022] text-[#FDB022]" />
                <span className="font-semibold">{rating}</span>
                <span className="text-[#667085]">({reviewText})</span>
              </div>

              {/* Farmer location */}
              <div className="mt-1 flex items-center gap-1 text-[12px] text-[#475467]">
                <MapPin size={13} className="shrink-0" />
                <span className="truncate font-medium">{farmerLocation}</span>
              </div>
            </div>
          </div>

          {isRecommended && (
            <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#FFC85A] px-3 py-1.5 text-[#1D1B12] shadow-sm">
              <BadgeCheck size={14} className="shrink-0" strokeWidth={2.6} />
              <span className="text-[11px] font-semibold uppercase leading-none">
                {t("farmerOffer.recommended")}
              </span>
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-[10px] bg-[#FBF7EC] px-3 py-3 xs:px-4">
          <div className="min-w-0">
            <p className="truncate text-[9px] font-bold uppercase tracking-wider text-[#667085] xs:text-[10px]">
              {t("farmerOffer.pricePerUnit")}
            </p>
            <p className="mt-1 truncate text-sm font-bold text-[#101828] xs:text-[16px]">
              {formatPrice(offer.proposedPricePerUnit, offer.currencyCode)}
            </p>
          </div>

          <div className="min-w-0">
            <p className="truncate text-[9px] font-bold uppercase tracking-wider text-[#667085] xs:text-[10px]">
              {t("farmerOffer.offerQty")}
            </p>
            <p className="mt-1 truncate text-sm font-bold text-[#101828] xs:text-[16px]">
              {offer.offeredQuantity.toLocaleString()}
            </p>
          </div>

          <div className="min-w-0">
            <p className="truncate text-[9px] font-bold uppercase tracking-wider text-[#667085] xs:text-[10px]">
              {t("farmerOffer.estDelivery")}
            </p>
            <p className="mt-1 truncate text-sm font-bold text-[#101828] xs:text-[16px]">
              {formatDate(offer.estimatedDeliveryDate, language)}
            </p>
          </div>
        </div>

        {/* Message */}
        <div className="mt-3.5 rounded-[10px] bg-[#FBF7EC] p-3.5 xs:p-4">
          <p className="text-[9px] font-bold uppercase tracking-wider text-[#98A2B3] xs:text-[10px]">
            {t("farmerOffer.message")}
          </p>
          <p className="mt-1 line-clamp-3 wrap-break-word text-xs leading-relaxed text-[#101828] xs:text-[13px]">
            {offer.message || t("farmerOffer.noMessage")}
          </p>
        </div>
      </div>

      {showActions && <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        <Link
          href={profileHref}
          className="flex h-11 w-full items-center justify-center rounded-[9px] border border-[#667085] bg-white text-sm font-semibold text-[#101828] transition hover:border-primary hover:bg-[#F9FAFB] active:scale-[0.99] sm:h-10.5"
        >
          {t("farmerOffer.viewProfile")}
        </Link>

        <button
          type="button"
          onClick={handleContactFarmer}
          className="flex h-11 w-full items-center justify-center rounded-[9px] bg-[#F6B941] text-sm font-semibold text-[#1D2939] shadow-xs transition hover:bg-[#e0a634] active:scale-[0.99] sm:h-10.5"
        >
          {t("farmerOffer.contactFarmer")}
        </button>
      </div>}
    </article>
  );
}
