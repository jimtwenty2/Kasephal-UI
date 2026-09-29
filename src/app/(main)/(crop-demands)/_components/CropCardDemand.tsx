"use client";

import Image from "next/image";
import { CropDemandPost } from "@/types/crop-demand";
import { MapPin } from "lucide-react";
import SaveButtonComponent from "@/components/action-components/SaveButtomComponent";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { normalizeUserRole, ROLES } from "@/constants/role";
import { normalizeCropProductImageUrl } from "@/lib/cropProductImage";
import { useI18n } from "@/lib/i18n/I18nContext";

interface CropCardDemandProps {
  data: CropDemandPost;
}

const FALLBACK_CROP_IMAGE = "/image-demand/product2.jpg";

const CROP_NAME_TEXT = {
  Cotton: { en: "Cotton", kh: "កប្បាស" },
  Orange: { en: "Orange", kh: "ក្រូច" },
  Watermelon: { en: "Watermelon", kh: "ផ្លែឪឡឹក" },
  Strawberry: { en: "Strawberry", kh: "ផ្លែស្ត្របឺរី" },
  Grape: { en: "Grape", kh: "ផ្លែទំពាំងបាយជូរ" },
  Mango: { en: "Mango", kh: "ផ្លែស្វាយ" },
  Durian: { en: "Durian", kh: "ផ្លែធុរេន" },
  "Keo Romeat Mango": { en: "Keo Romeat Mango", kh: "ស្វាយកែវរមៀត" },
  Avocado: { en: "Avocado", kh: "ផ្លែប័រ" },
  Lychee: { en: "Lychee", kh: "ផ្លៃគូលែន" },
  Jackfruit: { en: "Jackfruit", kh: "ផ្លែខ្នុរ" },
  Banana: { en: "Banana", kh: "ផ្លែចេក" },
  "Star Fruit": { en: "Star Fruit", kh: "ផ្លែស្ពឺ" },
  Apple: { en: "Apple", kh: "ផ្លែប៉ោម" },
  Wheat: { en: "Wheat", kh: "ស្រូវសាលី" },
  Rice: { en: "Rice", kh: "ស្រូវ" },
  Oat: { en: "Oat", kh: "ស្រូវអូត" },
  "Black Pepper": { en: "Black Pepper", kh: "ម្រេច"},
  "Yellow Maize": { en: "Yellow Maize", kh: "ពោតលឿង" },
  Soybean: { en: "Soybean", kh: "សណ្តែកសៀង" },
  Sugarcane: { en: "Sugarcane", kh: "អំពៅ" },
  Rubber: { en: "Rubber", kh: "កៅស៊ូ" },
  "Arabica Coffee": { en: "Arabica Coffee", kh: "កាហ្វេអារ៉ាប៊ីកា" },
  "Jasmine Rice": { en: "Jasmine Rice", kh: "ស្រូវផ្កាម្លិះ" },
  "Brown Rice": { en: "Brown Rice", kh: "អង្ករសម្រូប" },
  "Sen Kra Ob Rice": { en: "Sen Kra Ob Rice", kh: "ស្រូវសែនក្រអូប" },
  "Phka Rumduol Rice": { en: "Phka Rumduol Rice", kh: "ស្រូវផ្ការំដួល" },
  Cassava: { en: "Cassava", kh: "ដំឡូងមី" },
  Taro: { en: "Taro", kh: "ដំឡូងតារ៉ូ" },
  Garlic: { en: "Garlic", kh: "ខ្ទឹមស" },
  Turmeric: { en: "Turmeric", kh: "រមៀត" },
} as const;

const CROP_CARD_DEMAND_TEXT = {
  "cropCardDemand.viewDetail": { en: "VIEW DETAIL", kh: "មើលលម្អិត" },
  "cropCardDemand.cropImage": { en: "Crop Image", kh: "រូបភាពដំណាំ" },
  "cropCardDemand.global": { en: "Global", kh: "ទូទាំងប្រទេស" },
  "cropCardDemand.deliveryDate": {
    en: "Delivery Date",
    kh: "កាលបរិច្ឆេទដឹកជញ្ជូន",
  },
  "cropCardDemand.maxUnitPrice": {
    en: "Max Unit Price",
    kh: "តម្លៃឯកតាអតិបរមា",
  },
  "cropCardDemand.notAvailable": { en: "N/A", kh: "មិនមាន" },

  "cropCardDemand.status.OPEN": { en: "OPEN", kh: "បើក" },
  "cropCardDemand.status.MATCHED": { en: "MATCHED", kh: "បានផ្គូផ្គង" },
  "cropCardDemand.status.CLOSED": { en: "CLOSED", kh: "បានបិទ" },
  "cropCardDemand.status.EXPIRED": { en: "EXPIRED", kh: "ផុតកំណត់" },

  "cropCardDemand.demandLevel.LOW": { en: "LOW", kh: "ទាប" },
  "cropCardDemand.demandLevel.MODERATE": { en: "MODERATE", kh: "មធ្យម" },
  "cropCardDemand.demandLevel.HIGH": { en: "HIGH", kh: "ខ្ពស់" },

  "cropCardDemand.unit.KG": { en: "KG", kh: "គីឡូក្រាម" },
  "cropCardDemand.unit.TON": { en: "TON", kh: "តោន" },

  "cropCardDemand.location.BANTEAY_MEANCHEY": {
    en: "Banteay Meanchey",
    kh: "បន្ទាយមានជ័យ",
  },
  "cropCardDemand.location.BATTAMBANG": { en: "Battambang", kh: "បាត់ដំបង" },
  "cropCardDemand.location.KAMPONG_CHAM": {
    en: "Kampong Cham",
    kh: "កំពង់ចាម",
  },
  "cropCardDemand.location.KAMPONG_CHHNANG": {
    en: "Kampong Chhnang",
    kh: "កំពង់ឆ្នាំង",
  },
  "cropCardDemand.location.KAMPONG_SPEU": {
    en: "Kampong Speu",
    kh: "កំពង់ស្ពឺ",
  },
  "cropCardDemand.location.KAMPONG_THOM": {
    en: "Kampong Thom",
    kh: "កំពង់ធំ",
  },
  "cropCardDemand.location.KAMPOT": { en: "Kampot", kh: "កំពត" },
  "cropCardDemand.location.KANDAL": { en: "Kandal", kh: "កណ្ដាល" },
  "cropCardDemand.location.KEP": { en: "Kep", kh: "កែប" },
  "cropCardDemand.location.KOH_KONG": { en: "Koh Kong", kh: "កោះកុង" },
  "cropCardDemand.location.KRATIE": { en: "Kratie", kh: "ក្រចេះ" },
  "cropCardDemand.location.MONDULKIRI": {
    en: "Mondul Kiri",
    kh: "មណ្ឌលគិរី",
  },
  "cropCardDemand.location.ODDAR_MEANCHEY": {
    en: "Otdar Meanchey",
    kh: "ឧត្ដរមានជ័យ",
  },
  "cropCardDemand.location.PAILIN": { en: "Pailin", kh: "ប៉ៃលិន" },
  "cropCardDemand.location.PHNOM_PENH": {
    en: "Phnom Penh",
    kh: "រាជធានីភ្នំពេញ",
  },
  "cropCardDemand.location.PREAH_SIHANOUK": {
    en: "Sihanoukville",
    kh: "ព្រះសីហនុ",
  },
  "cropCardDemand.location.PREAH_VIHEAR": {
    en: "Preah Vihear",
    kh: "ព្រះវិហារ",
  },
  "cropCardDemand.location.PREY_VENG": { en: "Prey Veng", kh: "ព្រៃវែង" },
  "cropCardDemand.location.PURSAT": { en: "Pursat", kh: "ពោធិ៍សាត់" },
  "cropCardDemand.location.RATANAKIRI": {
    en: "Ratanak Kiri",
    kh: "រតនគិរី",
  },
  "cropCardDemand.location.SIEM_REAP": { en: "Siemreap", kh: "សៀមរាប" },
  "cropCardDemand.location.STUNG_TRENG": {
    en: "Stung Treng",
    kh: "ស្ទឹងត្រែង",
  },
  "cropCardDemand.location.SVAY_RIENG": {
    en: "Svay Rieng",
    kh: "ស្វាយរៀង",
  },
  "cropCardDemand.location.TAKEO": { en: "Takeo", kh: "តាកែវ" },
  "cropCardDemand.location.TBOUNG_KHMUM": {
    en: "Tboung Khmum",
    kh: "ត្បូងឃ្មុំ",
  },
} as const;

function getCropCardDemandText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  return (key: string) =>
    CROP_CARD_DEMAND_TEXT[key as keyof typeof CROP_CARD_DEMAND_TEXT]?.[lang] ??
    key;
}

function translateCropName(cropName?: string, language = "en") {
  if (!cropName) return "";

  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  return CROP_NAME_TEXT[cropName as keyof typeof CROP_NAME_TEXT]?.[lang] ?? cropName;
}

function formatDisplayDate(date?: string, language = "en") {
  if (!date) return "";

  return new Intl.DateTimeFormat(language === "kh" ? "km-KH" : "en-CA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  }).format(new Date(date));
}

function getCropImage(imageUrls?: string | string[]) {
  const image = Array.isArray(imageUrls) ? imageUrls.find(Boolean) : imageUrls;

  return typeof image === "string" && image.trim().length > 0
    ? normalizeCropProductImageUrl(image)
    : FALLBACK_CROP_IMAGE;
}

function normalizeLocationKey(location: string) {
  const normalized = location.trim().toUpperCase().replaceAll(" ", "_");

  const aliases: Record<string, string> = {
    MONDUL_KIRI: "MONDULKIRI",
    MONDULKIRI: "MONDULKIRI",
    RATANAK_KIRI: "RATANAKIRI",
    RATANAKIRI: "RATANAKIRI",
    SIEMREAP: "SIEM_REAP",
    SIEM_REAP: "SIEM_REAP",
    SIHANOUKVILLE: "PREAH_SIHANOUK",
    PREAH_SIHANOUK: "PREAH_SIHANOUK",
    OTDAR_MEANCHEY: "ODDAR_MEANCHEY",
    ODDAR_MEANCHEY: "ODDAR_MEANCHEY",
  };

  return aliases[normalized] ?? normalized;
}

function formatLocationName(
  location?: string,
  fallback = "Global",
  t?: (key: string) => string,
) {
  const locationName = location?.trim();

  if (!locationName) return fallback;

  return locationName
    .split(",")
    .map((part) => {
      const normalizedLocation = normalizeLocationKey(part);

      if (t) {
        const translatedLocation = t(
          `cropCardDemand.location.${normalizedLocation}`,
        );

        if (
          translatedLocation !== `cropCardDemand.location.${normalizedLocation}`
        ) {
          return translatedLocation;
        }
      }

      return part.trim();
    })
    .filter(Boolean)
    .join(", ");
}

export default function CropCardDemand({ data }: CropCardDemandProps) {
  const router = useRouter();
  const { language } = useI18n();
  const t = getCropCardDemandText(language);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";
  const isMatched = data.status === "MATCHED" || data.status === "CLOSED";
  const detailId = data.postId || data.cropDemandPostId;
  const remainingQuantity = Math.max(0, data.quantityNeeded ?? 0);

  const { data: session } = useSession();

  const role = normalizeUserRole(session?.user?.role);
  const isLoggedIn = !!session?.user;
  const isFarmer = isLoggedIn && role === ROLES.FARMER;
  const isBuyer =
    isLoggedIn && (role === ROLES.BUYER || role === ROLES.GOVERNMENT);

  function getButtonLabel() {
    if (isMatched) return t("cropCardDemand.viewDetail");
    if (!isLoggedIn) return t("cropCardDemand.viewDetail");
    if (isFarmer) return t("cropCardDemand.viewDetail");
    if (isBuyer) return t("cropCardDemand.viewDetail");
    return t("cropCardDemand.viewDetail");
  }

  function getButtonStyle() {
    return "bg-secondary hover:bg-secondary/90 text-primary-heading";
  }

  const isRielCurrency = data.currencyCode === "KHR";
  const currencyLabel = isRielCurrency ? "៛" : "$";

  const detailHref =
    isLoggedIn && detailId ? `/listing-crop-demands/${detailId}` : "/login";

  const goToDetail = () => {
    router.push(detailHref);
  };

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={goToDetail}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          goToDetail();
        }
      }}
      className={`mx-auto flex w-full max-w-sm cursor-pointer flex-col items-center overflow-hidden rounded-xl border border-light-grey bg-white pb-4 ${fontClass} shadow-[0px_4px_20px_0px_rgba(14,59,41,0.05)] transition-all hover:scale-[1.02] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20 sm:max-w-md md:max-w-xs`}
    >
      <div className="relative w-full h-40.75 pt-3 px-3">
        <div className="relative w-full h-full rounded-3xl overflow-hidden bg-light-grey/50">
          <Image
            src={getCropImage(
              data.imageUrls?.length ? data.imageUrls : data.thumbnailUrl,
            )}
            alt={
              translateCropName(data.cropName, language) ||
              t("cropCardDemand.cropImage")
            }
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={false}
            className="h-full w-full object-cover object-center"
          />

          <div
            className={`absolute top-[5.5px] left-1.75 flex gap-1 z-10 ${fontClass}`}
          >
            <span
              className={`backdrop-blur-sm px-3 bg-[#e2f5ed] py-1 rounded-full text-[12px] font-bold shadow-sm ${
                data.status === "CLOSED" ? " text-red-600" : " text-primary"
              }`}
            >
              {t(`cropCardDemand.status.${data.status}`)}
            </span>
            {data.demandLevel && (
              <span
                className={`backdrop-blur-sm px-3 py-1 bg-[#e2f5ed] rounded-full text-[12px] font-bold uppercase shadow-sm ${
                  data.demandLevel === "HIGH"
                    ? " text-red-800"
                    : data.demandLevel === "MODERATE"
                      ? " text-amber-800"
                      : " text-teal-700"
                }`}
              >
                {t(`cropCardDemand.demandLevel.${data.demandLevel}`)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={`w-full px-4 mt-4 flex flex-col gap-2 ${fontClass}`}>
        <div className="flex justify-between items-start min-h-13.25 gap-2">
          <div className="flex-1 min-w-0 gap-1 flex flex-col">
            <h2 className="text-[18px] sm:text-[20px] font-bold leading-6 sm:leading-7 text-primary-heading truncate">
              {translateCropName(data.cropName, language)}
            </h2>
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-secondary-body shrink-0" />
              <span className="text-[12px] font-semibold text-secondary-body tracking-[0.6px] truncate">
                {formatLocationName(
                  data.locationPreferences,
                  t("cropCardDemand.global"),
                  t,
                )}
              </span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-0.5 shrink-0">
            <span className="block text-[22px] sm:text-[26px] font-bold leading-5.5 sm:leading-6.5 text-primary">
              {remainingQuantity}
            </span>
            <span className="text-[12px] font-semibold uppercase text-primary-heading tracking-wider">
              {t(`cropCardDemand.unit.${data.unitType}`)}
            </span>
          </div>
        </div>

        <div className="w-full min-h-15 border-y border-light-grey/20 grid grid-cols-2 py-2 items-center mt-1 gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[10px] font-semibold uppercase text-muted tracking-wider truncate">
              {t("cropCardDemand.deliveryDate")}
            </span>
            <span className="text-[14px] font-bold text-secondary-body truncate">
              {data.expectedDeliveryDate
                ? formatDisplayDate(data.expectedDeliveryDate, language)
                : t("cropCardDemand.notAvailable")}
            </span>
          </div>
          <div className="flex min-w-0 flex-col gap-1 text-right">
            <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted">
              {t("cropCardDemand.maxUnitPrice")}
            </span>

            <span className="inline-flex items-baseline justify-end truncate text-[14px] font-bold leading-none text-primary-heading">
              <span
                className={
                  isRielCurrency
                    ? "inline-block text-[16px] leading-none"
                    : "inline-block text-[14px] leading-none"
                }
              >
                {currencyLabel}
              </span>

              <span className="ml-0.5">
                {data.maxPricePerUnit || "0"} /{" "}
                {t(`cropCardDemand.unit.${data.unitType}`)}
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between w-full pt-2 gap-3">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              goToDetail();
            }}
            className={`
              text-[13px] sm:text-[14px] font-bold rounded-2xl transition-colors
              flex items-center justify-center flex-1 h-11 text-center px-2
              ${getButtonStyle()}
            `}
          >
            {getButtonLabel()}
          </button>

          {isFarmer && (
            <div
              className="shrink-0 rounded-3xl border border-light-grey/40"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <SaveButtonComponent
                postId={detailId}
                initialFavorite={data.isSaved}
                color="primary"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
