"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { CropProductPost } from "@/types/crop-product";
import { ROLES, type UserRole } from "@/constants/role";
import SaveButtonComponent from "@/components/action-components/SaveButtomComponent";
import { getCropProductImages } from "@/lib/cropProductImage";
import { useI18n } from "@/lib/i18n/I18nContext";
import { formatCropProductProvince } from "@/utils/cropProduct.helpers";
import { fetchTranslations } from "@/action/translation.action";

type Props = {
  data: CropProductPost;
  role: UserRole | null;
};

type EndpointLanguage = "eng" | "kh";

const DYNAMIC_CARD_TRANSLATION_CACHE = new Map<string, string>();

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

const CROP_TYPE_TEXT = {
  "Rice Crops": { en: "Rice Crops", kh: "ដំណាំស្រូវ" },
  Fruit: { en: "Fruit", kh: "ផ្លែឈើ" },
  Vegetable: { en: "Vegetable", kh: "បន្លែ" },
  Legumes: { en: "Legumes", kh: "ដំណាំសណ្តែក" },
  Herbs: { en: "Herbs", kh: "រុក្ខជាតិឱសថ" },
  Spices: { en: "Spices", kh: "គ្រឿងទេស" },
  Nuts: { en: "Nuts", kh: "គ្រាប់ធញ្ញជាតិ" },
  Grains: { en: "Grains", kh: "គ្រាប់ធញ្ញជាតិ" },
  "Root Crops": { en: "Root Crops", kh: "ដំណាំមើម" },
  "Industrial Crops": { en: "Industrial Crops", kh: "ដំណាំឧស្សាហកម្ម" },
} as const;

const PROVINCE_TEXT = {
  BANTEAY_MEANCHEY: { en: "Banteay Meanchey", kh: "បន្ទាយមានជ័យ" },
  BATTAMBANG: { en: "Battambang", kh: "បាត់ដំបង" },
  KAMPONG_CHAM: { en: "Kampong Cham", kh: "កំពង់ចាម" },
  KAMPONG_CHHNANG: { en: "Kampong Chhnang", kh: "កំពង់ឆ្នាំង" },
  KAMPONG_SPEU: { en: "Kampong Speu", kh: "កំពង់ស្ពឺ" },
  KAMPONG_THOM: { en: "Kampong Thom", kh: "កំពង់ធំ" },
  KAMPOT: { en: "Kampot", kh: "កំពត" },
  KANDAL: { en: "Kandal", kh: "កណ្ដាល" },
  KEP: { en: "Kep", kh: "កែប" },
  KOH_KONG: { en: "Koh Kong", kh: "កោះកុង" },
  KRATIE: { en: "Kratie", kh: "ក្រចេះ" },
  MONDUL_KIRI: { en: "Mondul Kiri", kh: "មណ្ឌលគិរី" },
  MONDULKIRI: { en: "Mondul Kiri", kh: "មណ្ឌលគិរី" },
  OTDAR_MEANCHEY: { en: "Otdar Meanchey", kh: "ឧត្ដរមានជ័យ" },
  ODDAR_MEANCHEY: { en: "Otdar Meanchey", kh: "ឧត្ដរមានជ័យ" },
  PAILIN: { en: "Pailin", kh: "ប៉ៃលិន" },
  PHNOM_PENH: { en: "Phnom Penh", kh: "រាជធានីភ្នំពេញ" },
  SIHANOUKVILLE: { en: "Sihanoukville", kh: "ព្រះសីហនុ" },
  PREAH_SIHANOUK: { en: "Sihanoukville", kh: "ព្រះសីហនុ" },
  PREAH_VIHEAR: { en: "Preah Vihear", kh: "ព្រះវិហារ" },
  PREY_VENG: { en: "Prey Veng", kh: "ព្រៃវែង" },
  PURSAT: { en: "Pursat", kh: "ពោធិ៍សាត់" },
  RATANAK_KIRI: { en: "Ratanak Kiri", kh: "រតនគិរី" },
  RATANAKIRI: { en: "Ratanak Kiri", kh: "រតនគិរី" },
  SIEMREAP: { en: "Siemreap", kh: "សៀមរាប" },
  SIEM_REAP: { en: "Siemreap", kh: "សៀមរាប" },
  STUNG_TRENG: { en: "Stung Treng", kh: "ស្ទឹងត្រែង" },
  SVAY_RIENG: { en: "Svay Rieng", kh: "ស្វាយរៀង" },
  TAKEO: { en: "Takeo", kh: "តាកែវ" },
  TBOUNG_KHMUM: { en: "Tboung Khmum", kh: "ត្បូងឃ្មុំ" },
} as const;

const CROP_PRODUCT_CARD_TEXT = {
  "cropProductCard.defaultCountry": {
    en: "Cambodia",
    kh: "កម្ពុជា",
  },
  "cropProductCard.unnamedCrop": {
    en: "Unnamed Crop",
    kh: "ដំណាំគ្មានឈ្មោះ",
  },
  "cropProductCard.defaultCategory": {
    en: "Agricultural Crop",
    kh: "ដំណាំកសិកម្ម",
  },
  "cropProductCard.quantity": {
    en: "Quantity",
    kh: "បរិមាណ",
  },
  "cropProductCard.buyNow": {
    en: "Buy Now",
    kh: "ទិញឥឡូវនេះ",
  },
  "cropProductCard.viewDetail": {
    en: "View Detail",
    kh: "មើលលម្អិត",
  },
  "cropProductCard.status.open": {
    en: "Open",
    kh: "កំពុងបើក",
  },
  "cropProductCard.status.available": {
    en: "Available",
    kh: "មានស្តុក",
  },
  "cropProductCard.status.soldOut": {
    en: "Sold Out",
    kh: "អស់ពីស្តុក",
  },
  "cropProductCard.status.closed": {
    en: "Closed",
    kh: "បានបិទ",
  },
  "cropProductCard.status.inactive": {
    en: "Inactive",
    kh: "មិនដំណើរការ",
  },
  "cropProductCard.unit.KG": {
    en: "kg",
    kh: "គីឡូក្រាម",
  },
  "cropProductCard.unit.TON": {
    en: "ton",
    kh: "តោន",
  },
} as const;

function getCropProductCardText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  return (key: string, values?: Record<string, string | number>): string => {
    let text: string =
      CROP_PRODUCT_CARD_TEXT[key as keyof typeof CROP_PRODUCT_CARD_TEXT]?.[
        lang
      ] ?? key;

    if (values) {
      Object.entries(values).forEach(([name, value]) => {
        text = text.replaceAll(`{${name}}`, String(value));
      });
    }

    return text;
  };
}

function translateCropName(cropName?: string, language = "en") {
  if (!cropName) return "";

  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  return CROP_NAME_TEXT[cropName as keyof typeof CROP_NAME_TEXT]?.[lang] ?? cropName;
}

function hasCropNameTranslation(cropName?: string) {
  if (!cropName) return false;

  return cropName in CROP_NAME_TEXT;
}

function translateCropType(cropType?: string, language = "en") {
  if (!cropType) return "";

  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  return CROP_TYPE_TEXT[cropType as keyof typeof CROP_TYPE_TEXT]?.[lang] ?? cropType;
}

function translateProvince(province?: string, fallback = "Cambodia", language = "en") {
  const provinceName = province?.trim();

  if (!provinceName) return fallback;

  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";
  const key = provinceName.toUpperCase().replaceAll(" ", "_");

  return PROVINCE_TEXT[key as keyof typeof PROVINCE_TEXT]?.[lang] ?? provinceName;
}

function getProductImage(imageUrls?: string | string[]) {
  return getCropProductImages(imageUrls)[0];
}

function getStatusLabel(status: string | undefined, t: (key: string) => string) {
  if (!status) return "";

  const normalizedStatus = status.toLowerCase().replaceAll("_", "-");

  const statusKeyMap: Record<string, string> = {
    open: "cropProductCard.status.open",
    available: "cropProductCard.status.available",
    "sold-out": "cropProductCard.status.soldOut",
    soldout: "cropProductCard.status.soldOut",
    closed: "cropProductCard.status.closed",
    inactive: "cropProductCard.status.inactive",
  };

  const key = statusKeyMap[normalizedStatus];

  return key ? t(key) : status;
}

function getUnitLabel(unitType: string | undefined, t: (key: string) => string) {
  if (!unitType) return "";

  const key = `cropProductCard.unit.${unitType}`;

  const translated = t(key);

  return translated === key ? unitType.toLowerCase() : translated;
}

function detectEndpointSourceLanguage(value: string): EndpointLanguage {
  return /[\u1780-\u17FF]/.test(value) ? "kh" : "eng";
}

function getEndpointTargetLanguage(language: string): EndpointLanguage {
  return language === "kh" ? "kh" : "eng";
}

function compactTranslationMessages(messages: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(messages)
      .map(([key, value]) => [key, value?.trim() ?? ""] as const)
      .filter(([, value]) => value.length > 0),
  );
}

function useDynamicCardTranslations(
  messages: Record<string, string>,
  language: string,
) {
  const targetLang = getEndpointTargetLanguage(language);
  const translationKey = JSON.stringify([targetLang, messages]);
  const [translationState, setTranslationState] = useState<{
    key: string;
    messages: Record<string, string>;
  } | null>(null);

  useEffect(() => {
    let isCurrent = true;
    const entriesToTranslate = Object.entries(messages).filter(
      ([, value]) =>
        value &&
        detectEndpointSourceLanguage(value) !== targetLang &&
        !DYNAMIC_CARD_TRANSLATION_CACHE.has(
          `${detectEndpointSourceLanguage(value)}:${targetLang}:${value}`,
        ),
    );

    if (entriesToTranslate.length === 0) {
      return;
    }

    const loadTranslations = async () => {
      const translatedEntries = await Promise.all(
        entriesToTranslate.map(async ([key, value]) => {
          const sourceLang = detectEndpointSourceLanguage(value);
          const cacheKey = `${sourceLang}:${targetLang}:${value}`;

          try {
            const translatedMessages = await fetchTranslations(
              { value },
              targetLang,
              sourceLang,
            );
            const translatedValue = translatedMessages.value?.trim() || "";

            if (translatedValue) {
              DYNAMIC_CARD_TRANSLATION_CACHE.set(cacheKey, translatedValue);
            }

            return [key, translatedValue] as const;
          } catch (error) {
            console.error("Failed to translate crop product card text:", error);
            return [key, ""] as const;
          }
        }),
      );

      if (isCurrent) {
        setTranslationState({
          key: translationKey,
          messages: Object.fromEntries(
            translatedEntries.filter(([, value]) => value.length > 0),
          ),
        });
      }
    };

    void loadTranslations();

    return () => {
      isCurrent = false;
    };
  }, [messages, targetLang, translationKey]);

  return Object.fromEntries(
    Object.entries(messages).map(([key, value]) => {
      const sourceLang = detectEndpointSourceLanguage(value);
      const cacheKey = `${sourceLang}:${targetLang}:${value}`;
      const cachedValue = DYNAMIC_CARD_TRANSLATION_CACHE.get(cacheKey);
      const stateValue =
        translationState?.key === translationKey
          ? translationState.messages[key]
          : undefined;

      return [
        key,
        sourceLang === targetLang ? value : cachedValue || stateValue || "",
      ];
    }),
  );
}

export default function CropProductCardComponent({ data, role }: Props) {
  const router = useRouter();
  const { language } = useI18n();
  const t = getCropProductCardText(language);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";

  const isLoggedIn = role !== null;
  const isBuyer = role === ROLES.BUYER || role === ROLES.GOVERNMENT;

  const rawTitle: string =
    data.post?.title ||
    data.title ||
    data.crop?.cropName ||
    data.cropName ||
    t("cropProductCard.unnamedCrop");

  const rawCropName: string = data.crop?.cropName || data.cropName || rawTitle;

  const fallbackTitle =
    rawTitle === rawCropName
      ? translateCropName(rawCropName, language)
      : rawTitle;

  const rawCategory: string =
    data.crop?.cropTypeName ||
    data.cropTypeName ||
    data.cropType ||
    t("cropProductCard.defaultCategory");

  const fallbackCategory = translateCropType(rawCategory, language);

  const rawLocation: string = formatCropProductProvince(
    data.farmerLocation || data.location,
    t("cropProductCard.defaultCountry"),
  );
  const fallbackLocation = translateProvince(
    rawLocation,
    t("cropProductCard.defaultCountry"),
    language,
  );
  const dynamicTranslationMessages = useMemo(
    () =>
      compactTranslationMessages({
        title: rawTitle,
        category: rawCategory,
        location: rawLocation,
      }),
    [rawCategory, rawLocation, rawTitle],
  );
  const dynamicTranslations = useDynamicCardTranslations(
    dynamicTranslationMessages,
    language,
  );
  const title =
    rawTitle === rawCropName || hasCropNameTranslation(rawTitle)
      ? fallbackTitle
      : dynamicTranslations.title || fallbackTitle;
  const category = dynamicTranslations.category || fallbackCategory;
  const location = dynamicTranslations.location || fallbackLocation;

  const displayImage = getProductImage(data.imageUrls);

  const formattedUnit = getUnitLabel(data.unitType, t);

  const detailId =
    data.postId ||
    data.post?.postId ||
    data.cropProductId ||
    data.cropProductPostId;

  const isRielCurrency = data.currencyCode === "KHR";

  const currencyLabel =
    data.currencyCode === "USD"
      ? "$"
      : isRielCurrency
        ? "៛"
        : `${data.currencyCode} `;

  const href = detailId ? `/listing-product/${detailId}` : "/listing-product";

  const goToDetail = () => {
    router.push(href);
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
      className={`flex w-full max-w-sm cursor-pointer flex-col gap-3 rounded-xl border border-light-grey bg-white p-3 shadow-xs transition duration-300 ease-in-out hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20 sm:p-4 ${fontClass}`}
    >
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-light-grey/40">
        <Image
          src={displayImage}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 300px"
          className="object-cover"
        />

        <div className="absolute left-0 top-0 flex w-full items-center justify-between bg-linear-to-b from-black/40 to-transparent px-3 py-2">
          <span className="rounded-full bg-[#E2F5ED] px-3 py-1 text-xs font-bold text-primary">
            {getStatusLabel(data.status, t)}
          </span>

          {isLoggedIn && (role === ROLES.BUYER || role === ROLES.GOVERNMENT) && (
            <div
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <SaveButtonComponent
                postId={data.post?.postId || data.postId}
                initialFavorite={data.isSaved ?? true}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex min-h-18 flex-col items-stretch justify-between gap-2 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-primary-heading">
            {title}
          </h3>

          <p className="truncate text-xs font-bold uppercase text-muted">
            {location} • {category}
          </p>

          <p className="text-sm font-medium text-secondary-body">
            {t("cropProductCard.quantity")}: {data.stockLeft ?? 0}{" "}
            {formattedUnit}
          </p>
        </div>

        <div className="shrink-0 text-left sm:text-right">
          <span className="inline-flex items-end text-base font-extrabold leading-none text-primary">
            <span
              className={
                isRielCurrency
                  ? "inline-block translate-y-0.5 text-xl leading-none"
                  : ""
              }
            >
              {currencyLabel}
            </span>
            {data.pricePerUnit.toLocaleString()}
          </span>

          <span className="ml-1 text-xs text-muted">/ {formattedUnit}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          goToDetail();
        }}
        className="mt-2 flex h-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white"
      >
        {isBuyer
          ? t("cropProductCard.buyNow")
          : t("cropProductCard.viewDetail")}
      </button>
    </div>
  );
}
