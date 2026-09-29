"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { fetchTranslations } from "@/action/translation.action";
import { useI18n } from "@/lib/i18n/I18nContext";

type TextValues = Record<string, string | number>;
type EndpointLanguage = "eng" | "kh";

const DYNAMIC_TRANSLATION_CACHE = new Map<string, string>();

const DETAIL_TEXT = {
  "cropProductDetails.home": { en: "Home", kh: "ទំព័រដើម" },
  "cropProductDetails.cropProducts": {
    en: "Crop Products",
    kh: "ផលិតផលដំណាំ",
  },
  "cropProductDetails.unnamedProduct": {
    en: "Unnamed Product",
    kh: "ផលិតផលគ្មានឈ្មោះ",
  },
  "cropProductDetails.noDescription": {
    en: "No description available.",
    kh: "មិនមានការពិពណ៌នាទេ។",
  },
  "cropProductDetails.notAvailable": { en: "N/A", kh: "មិនមាន" },
  "cropProductDetails.farmer": { en: "Farmer", kh: "កសិករ" },
  "cropProductDetails.phoneNumber": {
    en: "Phone Number",
    kh: "លេខទូរស័ព្ទ",
  },
  "cropProductDetails.email": { en: "Email", kh: "អ៊ីមែល" },
  "cropProductDetails.inStock": { en: "In Stock", kh: "មានក្នុងស្តុក" },
  "cropProductDetails.available": { en: "Available", kh: "អាចរកបាន" },
  "cropProductDetails.cropName": { en: "Crop Name", kh: "ឈ្មោះដំណាំ" },
  "cropProductDetails.cropType": { en: "Crop Type", kh: "ប្រភេទដំណាំ" },
  "cropProductDetails.price": { en: "Price", kh: "តម្លៃ" },
  "cropProductDetails.quantity": { en: "Quantity", kh: "បរិមាណ" },
  "cropProductDetails.productDescription": {
    en: "Product Description",
    kh: "ការពិពណ៌នាផលិតផល",
  },
  "cropProductDetails.noRankingYet": {
    en: "No Ranking Yet",
    kh: "មិនទាន់មានចំណាត់ថ្នាក់",
  },
  "cropProductDetails.topRatedFarmer": {
    en: "Top Rated Farmer",
    kh: "កសិករដែលទទួលបានវាយតម្លៃខ្ពស់បំផុត",
  },
  "cropProductDetails.highlyRatedFarmer": {
    en: "Highly Rated Farmer",
    kh: "កសិករដែលទទួលបានវាយតម្លៃខ្ពស់",
  },
  "cropProductDetails.reviewedFarmer": {
    en: "Reviewed Farmer",
    kh: "កសិករដែលមានការវាយតម្លៃ",
  },
  "cropProductDetails.needsMoreReviews": {
    en: "Needs More Reviews",
    kh: "ត្រូវការការវាយតម្លៃបន្ថែម",
  },
  "cropProductDetails.basedOnReviews": {
    en: "Based on {{count}} {{reviewLabel}}",
    kh: "ផ្អែកលើការវាយតម្លៃ {{count}}",
  },
  "cropProductDetails.reviewSingular": { en: "review", kh: "ការវាយតម្លៃ" },
  "cropProductDetails.reviewPlural": { en: "reviews", kh: "ការវាយតម្លៃ" },
  "cropProductDetails.star": { en: "Star", kh: "ផ្កាយ" },
  "cropProductDetails.noReviewComment": {
    en: "No review comment.",
    kh: "មិនមានមតិយោបល់វាយតម្លៃទេ។",
  },
  "cropProductDetails.noReview": { en: "No review", kh: "មិនមានការវាយតម្លៃ" },
  "cropProductDetails.unit.KG": { en: "kg", kh: "គីឡូក្រាម" },
  "cropProductDetails.unit.TON": { en: "ton", kh: "តោន" },
  "cropProductDetails.cropName.Cotton": { en: "Cotton", kh: "កប្បាស" },
  "cropProductDetails.cropName.Orange": { en: "Orange", kh: "ក្រូច" },
  "cropProductDetails.cropName.Watermelon": { en: "Watermelon", kh: "ផ្លែឪឡឹក" },
  "cropProductDetails.cropName.Strawberry": { en: "Strawberry", kh: "ផ្លែស្ត្របឺរី" },
  "cropProductDetails.cropName.Grape": { en: "Grape", kh: "ផ្លែទំពាំងបាយជូរ" },
  "cropProductDetails.cropName.Mango": { en: "Mango", kh: "ផ្លែស្វាយ" },
  "cropProductDetails.cropName.Durian": { en: "Durian", kh: "ផ្លែធុរេន" },
  "cropProductDetails.cropName.Keo_Romeat_Mango": {
    en: "Keo Romeat Mango",
    kh: "ស្វាយកែវរមៀត",
  },
  "cropProductDetails.cropName.Avocado": { en: "Avocado", kh: "ផ្លែប័រ" },
  "cropProductDetails.cropName.Lychee": { en: "Lychee", kh: "ផ្លៃគូលែន" },
  "cropProductDetails.cropName.Jackfruit": { en: "Jackfruit", kh: "ផ្លែខ្នុរ" },
  "cropProductDetails.cropName.Banana": { en: "Banana", kh: "ផ្លែចេក" },
  "cropProductDetails.cropName.Star_Fruit": { en: "Star Fruit", kh: "ផ្លែស្ពឺ" },
  "cropProductDetails.cropName.Apple": { en: "Apple", kh: "ផ្លែប៉ោម" },
  "cropProductDetails.cropName.Wheat": { en: "Wheat", kh: "ស្រូវសាលី" },
  "cropProductDetails.cropName.Rice": { en: "Rice", kh: "ស្រូវ" },
  "cropProductDetails.cropName.Oat": { en: "Oat", kh: "ស្រូវអូត" },
  "cropProductDetails.cropName.Yellow_Maize": { en: "Yellow Maize", kh: "ពោតលឿង" },
  "cropProductDetails.cropName.Soybean": { en: "Soybean", kh: "សណ្តែកសៀង" },
  "cropProductDetails.cropName.Sugarcane": { en: "Sugarcane", kh: "អំពៅ" },
  "cropProductDetails.cropName.Rubber": { en: "Rubber", kh: "កៅស៊ូ" },
  "cropProductDetails.cropName.Arabica_Coffee": {
    en: "Arabica Coffee",
    kh: "កាហ្វេអារ៉ាប៊ីកា",
  },
  "cropProductDetails.cropName.Jasmine_Rice": { en: "Jasmine Rice", kh: "ស្រូវផ្កាម្លិះ" },
  "cropProductDetails.cropName.Brown_Rice": { en: "Brown Rice", kh: "អង្ករសម្រូប" },
  "cropProductDetails.cropName.Sen_Kra_Ob_Rice": {
    en: "Sen Kra Ob Rice",
    kh: "ស្រូវសែនក្រអូប",
  },
  "cropProductDetails.cropName.Phka_Rumduol_Rice": {
    en: "Phka Rumduol Rice",
    kh: "ស្រូវផ្ការំដួល",
  },
  "cropProductDetails.cropName.Cassava": { en: "Cassava", kh: "ដំឡូងមី" },
  "cropProductDetails.cropName.Taro": { en: "Taro", kh: "ដំឡូងតារ៉ូ" },
  "cropProductDetails.cropName.Garlic": { en: "Garlic", kh: "ខ្ទឹមស" },
  "cropProductDetails.cropName.Turmeric": { en: "Turmeric", kh: "រមៀត" },
  "cropProductDetails.cropType.Rice_Crops": { en: "Rice Crops", kh: "ដំណាំស្រូវ" },
  "cropProductDetails.cropType.Fruit": { en: "Fruit", kh: "ផ្លែឈើ" },
  "cropProductDetails.cropType.Vegetable": { en: "Vegetable", kh: "បន្លែ" },
  "cropProductDetails.cropType.Legumes": { en: "Legumes", kh: "ដំណាំសណ្តែក" },
  "cropProductDetails.cropType.Herbs": { en: "Herbs", kh: "រុក្ខជាតិឱសថ" },
  "cropProductDetails.cropType.Spices": { en: "Spices", kh: "គ្រឿងទេស" },
  "cropProductDetails.cropType.Nut": { en: "Nut", kh: "គ្រាប់ធញ្ញជាតិ" },
  "cropProductDetails.cropType.Grain": { en: "Grain", kh: "គ្រាប់ធញ្ញជាតិ" },
  "cropProductDetails.cropType.Fiber_Crops": { en: "Fiber Crop", kh: "ដំណាំកប្បាស" },
  "cropProductDetails.cropType.Root_Crops": { en: "Root Crops", kh: "ដំណាំមើម" },
  "cropProductDetails.cropType.Industrial_Crops": {
    en: "Industrial Crops",
    kh: "ដំណាំឧស្សាហកម្ម",
  },
  "cropProductDetails.location.Cambodia": { en: "Cambodia", kh: "កម្ពុជា" },
  "cropProductDetails.location.BANTEAY_MEANCHEY": { en: "Banteay Meanchey", kh: "បន្ទាយមានជ័យ" },
  "cropProductDetails.location.BATTAMBANG": { en: "Battambang", kh: "បាត់ដំបង" },
  "cropProductDetails.location.KAMPONG_CHAM": { en: "Kampong Cham", kh: "កំពង់ចាម" },
  "cropProductDetails.location.KAMPONG_CHHNANG": { en: "Kampong Chhnang", kh: "កំពង់ឆ្នាំង" },
  "cropProductDetails.location.KAMPONG_SPEU": { en: "Kampong Speu", kh: "កំពង់ស្ពឺ" },
  "cropProductDetails.location.KAMPONG_THOM": { en: "Kampong Thom", kh: "កំពង់ធំ" },
  "cropProductDetails.location.KAMPOT": { en: "Kampot", kh: "កំពត" },
  "cropProductDetails.location.KANDAL": { en: "Kandal", kh: "កណ្តាល" },
  "cropProductDetails.location.KEP": { en: "Kep", kh: "កែប" },
  "cropProductDetails.location.KOH_KONG": { en: "Koh Kong", kh: "កោះកុង" },
  "cropProductDetails.location.KRATIE": { en: "Kratie", kh: "ក្រចេះ" },
  "cropProductDetails.location.MONDUL_KIRI": { en: "Mondul Kiri", kh: "មណ្ឌលគិរី" },
  "cropProductDetails.location.MONDULKIRI": { en: "Mondul Kiri", kh: "មណ្ឌលគិរី" },
  "cropProductDetails.location.OTDAR_MEANCHEY": { en: "Otdar Meanchey", kh: "ឧត្តរមានជ័យ" },
  "cropProductDetails.location.ODDAR_MEANCHEY": { en: "Otdar Meanchey", kh: "ឧត្តរមានជ័យ" },
  "cropProductDetails.location.PAILIN": { en: "Pailin", kh: "ប៉ៃលិន" },
  "cropProductDetails.location.PHNOM_PENH": { en: "Phnom Penh", kh: "រាជធានីភ្នំពេញ" },
  "cropProductDetails.location.SIHANOUKVILLE": { en: "Sihanoukville", kh: "ព្រះសីហនុ" },
  "cropProductDetails.location.PREAH_SIHANOUK": { en: "Sihanoukville", kh: "ព្រះសីហនុ" },
  "cropProductDetails.location.PREAH_VIHEAR": { en: "Preah Vihear", kh: "ព្រះវិហារ" },
  "cropProductDetails.location.PREY_VENG": { en: "Prey Veng", kh: "ព្រៃវែង" },
  "cropProductDetails.location.PURSAT": { en: "Pursat", kh: "ពោធិ៍សាត់" },
  "cropProductDetails.location.RATANAK_KIRI": { en: "Ratanak Kiri", kh: "រតនគិរី" },
  "cropProductDetails.location.RATANAKIRI": { en: "Ratanak Kiri", kh: "រតនគិរី" },
  "cropProductDetails.location.SIEMREAP": { en: "Siemreap", kh: "សៀមរាប" },
  "cropProductDetails.location.SIEM_REAP": { en: "Siemreap", kh: "សៀមរាប" },
  "cropProductDetails.location.STUNG_TRENG": { en: "Stung Treng", kh: "ស្ទឹងត្រែង" },
  "cropProductDetails.location.SVAY_RIENG": { en: "Svay Rieng", kh: "ស្វាយរៀង" },
  "cropProductDetails.location.TAKEO": { en: "Takeo", kh: "តាកែវ" },
  "cropProductDetails.location.TBOUNG_KHMUM": { en: "Tboung Khmum", kh: "ត្បូងឃ្មុំ" },
} as const;

function asParams(values?: TextValues) {
  if (!values) return undefined;

  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, String(value)]),
  );
}

function normalizeKey(value?: string | null) {
  return value?.trim().replaceAll(" ", "_");
}

function normalizeLocationKey(value: string) {
  return value.trim().toUpperCase().replaceAll(" ", "_");
}

function detectEndpointSourceLanguage(value: string): EndpointLanguage {
  return /[\u1780-\u17FF]/.test(value) ? "kh" : "eng";
}

function getEndpointTargetLanguage(language: string): EndpointLanguage {
  return language === "kh" ? "kh" : "eng";
}

function useDetailText() {
  const { language } = useI18n();
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";
  const fontClass = language === "kh" ? "font-khmer" : "";
  const t = (key: string, values?: Record<string, string>) => {
    let text: string =
      DETAIL_TEXT[key as keyof typeof DETAIL_TEXT]?.[lang] ??
      DETAIL_TEXT[key as keyof typeof DETAIL_TEXT]?.en ??
      key;

    if (values) {
      Object.entries(values).forEach(([name, value]) => {
        text = text.replaceAll(`{{${name}}}`, value);
      });
    }

    return text;
  };

  return { language, t, fontClass };
}

export function DetailText({
  k,
  values,
  className,
}: {
  k: string;
  values?: TextValues;
  className?: string;
}) {
  const { t, fontClass } = useDetailText();

  return <span className={`${fontClass} ${className ?? ""}`}>{t(k, asParams(values))}</span>;
}

export function DetailProductTitle({
  title,
  cropName,
}: {
  title: string;
  cropName?: string | null;
}) {
  const { t, fontClass } = useDetailText();
  const cropKey = normalizeKey(cropName);
  const titleKey =
    title === "Unnamed Product"
      ? "cropProductDetails.unnamedProduct"
      : title === cropName && cropKey
        ? `cropProductDetails.cropName.${cropKey}`
        : null;
  const translated = titleKey ? t(titleKey) : title;

  return <span className={fontClass}>{translated === titleKey ? title : translated}</span>;
}

export function DynamicProductText({
  value,
  fallback,
  className,
}: {
  value?: string | null;
  fallback?: ReactNode;
  className?: string;
}) {
  const { language, fontClass } = useDetailText();
  const text = value?.trim() ?? "";
  const sourceLang = useMemo(
    () => detectEndpointSourceLanguage(text),
    [text],
  );
  const targetLang = getEndpointTargetLanguage(language);
  const cacheKey = `${sourceLang}:${targetLang}:${text}`;
  const [translationState, setTranslationState] = useState<{
    key: string;
    text: string;
  } | null>(null);

  useEffect(() => {
    const cachedText = DYNAMIC_TRANSLATION_CACHE.get(cacheKey) ?? "";

    if (!text || sourceLang === targetLang || cachedText) {
      return;
    }

    let isCurrent = true;

    const loadTranslation = async () => {
      try {
        const translatedMessages = await fetchTranslations(
          { value: text },
          targetLang,
          sourceLang,
        );
        const nextText = translatedMessages.value?.trim();

        if (nextText) {
          DYNAMIC_TRANSLATION_CACHE.set(cacheKey, nextText);
        }

        if (isCurrent) {
          setTranslationState({ key: cacheKey, text: nextText ?? "" });
        }
      } catch (error) {
        console.error("Failed to translate crop product detail text:", error);
      }
    };

    void loadTranslation();

    return () => {
      isCurrent = false;
    };
  }, [cacheKey, sourceLang, targetLang, text]);

  if (!text) {
    return fallback ? <>{fallback}</> : null;
  }

  const translatedText =
    DYNAMIC_TRANSLATION_CACHE.get(cacheKey) ??
    (translationState?.key === cacheKey ? translationState.text : "");

  return (
    <span className={`${fontClass} ${className ?? ""}`}>
      {sourceLang === targetLang ? text : translatedText || text}
    </span>
  );
}

export function DetailCropName({ value }: { value?: string | null }) {
  const { t, fontClass } = useDetailText();
  const keyPart = normalizeKey(value);

  if (!keyPart) return <span>{t("cropProductDetails.notAvailable")}</span>;

  const key = `cropProductDetails.cropName.${keyPart}`;
  const translated = t(key);

  return <span className={fontClass}>{translated === key ? value : translated}</span>;
}

export function DetailCropType({ value }: { value?: string | null }) {
  const { t, fontClass } = useDetailText();
  const keyPart = normalizeKey(value);

  if (!keyPart) return <span>{t("cropProductDetails.notAvailable")}</span>;

  const key = `cropProductDetails.cropType.${keyPart}`;
  const translated = t(key);

  return <span className={fontClass}>{translated === key ? value : translated}</span>;
}

export function DetailUnit({ value }: { value?: string | null }) {
  const { t, fontClass } = useDetailText();

  if (!value) return <span>KG</span>;

  const key = `cropProductDetails.unit.${value}`;
  const translated = t(key);

  return <span className={fontClass}>{translated === key ? value : translated}</span>;
}

export function DetailLocation({ value }: { value: string }) {
  const { t, fontClass } = useDetailText();

  const translated = value
    .split(",")
    .map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return "";

      const keyPart =
        trimmed.toLowerCase() === "cambodia"
          ? "Cambodia"
          : normalizeLocationKey(trimmed);
      const key = `cropProductDetails.location.${keyPart}`;
      const translatedPart = t(key);

      return translatedPart === key ? trimmed : translatedPart;
    })
    .filter(Boolean)
    .join(", ");

  return <span className={fontClass}>{translated}</span>;
}

export function DetailFarmerRanking({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount: number;
}) {
  const { t, fontClass } = useDetailText();

  const key =
    reviewCount === 0
      ? "cropProductDetails.noRankingYet"
      : rating >= 4.5
        ? "cropProductDetails.topRatedFarmer"
        : rating >= 4
          ? "cropProductDetails.highlyRatedFarmer"
          : rating >= 3
            ? "cropProductDetails.reviewedFarmer"
            : "cropProductDetails.needsMoreReviews";

  return <span className={fontClass}>{t(key)}</span>;
}

export function DetailReviewSummary({ count }: { count: number }) {
  const { t, fontClass } = useDetailText();
  const reviewLabel = t(
    count === 1
      ? "cropProductDetails.reviewSingular"
      : "cropProductDetails.reviewPlural",
  );

  return (
    <span className={fontClass}>
      {t("cropProductDetails.basedOnReviews", asParams({ count, reviewLabel }))}
    </span>
  );
}

export function DetailReviewDate({ value }: { value: string }) {
  const { language, t, fontClass } = useDetailText();
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return <span className={fontClass}>{t("cropProductDetails.notAvailable")}</span>;
  }

  return (
    <span className={fontClass}>
      {new Intl.DateTimeFormat(language === "kh" ? "km-KH" : "en", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date)}
    </span>
  );
}
