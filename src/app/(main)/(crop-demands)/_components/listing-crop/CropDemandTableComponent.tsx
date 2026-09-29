"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import Image from "next/image";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  CirclePlus,
  X,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ChevronsUpDown,
} from "lucide-react";
import type {
  CropDemandPost,
  CropDemandRequestBody,
  DemandLevel,
  DemandStatus,
} from "@/types/crop-demand";
import Link from "next/link";
import { CustomFilterSelect } from "../CustomFilterSelect";
import {
  deleteCropDemandAction,
  getOwnCropDemandsAction,
  updateCropDemandAction,
} from "@/action/crop-demand.action";
import { useRouter } from "next/navigation";
import { showApiSuccess, showApiToast } from "@/lib/apiToast";
import PaginationComponent from "@/components/action-components/PaginationComponent";
import { getCropTypeFilterOptions } from "@/lib/cropTypeOptions";
import { getLocationFilterOptions } from "@/lib/locationOptions";
import { CropType } from "@/types/cropType";
import type { AdministrativeLocation } from "@/services/locationFilter.service";
import type { IdentityVerificationState } from "@/lib/identityVerification";
import { useI18n } from "@/lib/i18n/I18nContext";
import { getFileUrl } from "@/utils/getFileUrl";

// ==========================================
// 2. MAIN CROP DEMAND LISTINGS COMPONENT
// ==========================================
const DEMAND_IMAGE_FALLBACK = "/assets/srov.png";

const DEMAND_TABLE_TEXT = {
  "demandTable.notAvailable": { en: "N/A", kh: "មិនមាន" },
  "demandTable.heroAlt": {
    en: "Hero Background",
    kh: "ផ្ទៃខាងក្រោយផ្នែក Hero",
  },
  "demandTable.productAlt": {
    en: "Demand Product",
    kh: "ផលិតផលតម្រូវការ",
  },
  "demandTable.postNewDemand": {
    en: "Post New Demand",
    kh: "បង្កើតតម្រូវការថ្មី",
  },
  "demandTable.sortBy": {
    en: "Sort by {label}",
    kh: "តម្រៀបតាម {label}",
  },
  "demandTable.updateLevelAria": {
    en: "Update demand level for {cropName}",
    kh: "កែប្រែកម្រិតតម្រូវការសម្រាប់ {cropName}",
  },
  "demandTable.statusAutoTitle": {
    en: "Crop demand status is updated automatically by orders and delivery tracking.",
    kh: "ស្ថានភាពតម្រូវការដំណាំត្រូវបានធ្វើបច្ចុប្បន្នភាពដោយស្វ័យប្រវត្តិតាមការបញ្ជាទិញ និងការតាមដានការដឹកជញ្ជូន។",
  },
  "demandTable.viewAria": {
    en: "View crop demand",
    kh: "មើលតម្រូវការដំណាំ",
  },
  "demandTable.updateAria": {
    en: "Update crop demand",
    kh: "កែប្រែតម្រូវការដំណាំ",
  },
  "demandTable.deleteAria": {
    en: "Delete crop demand",
    kh: "លុបតម្រូវការដំណាំ",
  },
  "demandTable.cropSuffix": { en: "Crop", kh: "ដំណាំ" },
  "demandTable.closeLevel": {
    en: "Close demand level popup",
    kh: "បិទផ្ទាំងកែប្រែកម្រិតតម្រូវការ",
  },
  "demandTable.updateDemandLevel": {
    en: "Update Demand Level",
    kh: "កែប្រែកម្រិតតម្រូវការ",
  },
  "demandTable.chooseUrgency": {
    en: "Choose how urgent this crop demand should appear to farmers.",
    kh: "ជ្រើសរើសថាតើតម្រូវការដំណាំនេះគួរបង្ហាញជាបន្ទាន់កម្រិតណាចំពោះកសិករ។",
  },
  "demandTable.current": { en: "Current", kh: "បច្ចុប្បន្ន" },
  "demandTable.cancel": { en: "Cancel", kh: "បោះបង់" },
  "demandTable.updating": { en: "Updating", kh: "កំពុងកែប្រែ" },
  "demandTable.updateLevel": { en: "Update Level", kh: "កែប្រែកម្រិត" },
  "demandTable.closeDelete": {
    en: "Close delete confirmation",
    kh: "បិទការបញ្ជាក់លុប",
  },
  "demandTable.deleteDemand": { en: "Delete Demand", kh: "លុបតម្រូវការ" },
  "demandTable.deleteDesc": {
    en: "This crop demand will be removed from your management list. This action cannot be undone.",
    kh: "តម្រូវការដំណាំនេះនឹងត្រូវបានលុបចេញពីបញ្ជីគ្រប់គ្រងរបស់អ្នក។ សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។",
  },
  "demandTable.deleting": { en: "Deleting", kh: "កំពុងលុប" },
  "demandTable.status.OPEN": { en: "OPEN", kh: "បើក" },
  "demandTable.status.MATCHED": { en: "MATCHED", kh: "បានផ្គូផ្គង" },
  "demandTable.status.CLOSED": { en: "CLOSED", kh: "បានបិទ" },
  "demandTable.demandLevel.LOW": { en: "LOW", kh: "ទាប" },
  "demandTable.demandLevel.MODERATE": { en: "MODERATE", kh: "មធ្យម" },
  "demandTable.demandLevel.HIGH": { en: "HIGH", kh: "ខ្ពស់" },
  "demandTable.demandLevelDesc.LOW": {
    en: "Lower urgency. Farmers can respond when supply is available.",
    kh: "តម្រូវការមិនបន្ទាន់ខ្លាំង។ កសិករអាចឆ្លើយតបពេលមានការផ្គត់ផ្គង់។",
  },
  "demandTable.demandLevelDesc.MODERATE": {
    en: "Standard priority for active sourcing.",
    kh: "អាទិភាពធម្មតាសម្រាប់ការស្វែងរកការផ្គត់ផ្គង់។",
  },
  "demandTable.demandLevelDesc.HIGH": {
    en: "Urgent demand. Highlight this request as high priority.",
    kh: "តម្រូវការបន្ទាន់។ បង្ហាញសំណើនេះជាអាទិភាពខ្ពស់។",
  },
  "demandTable.unit.KG": { en: "KG", kh: "គីឡូក្រាម" },
  "demandTable.unit.TON": { en: "TON", kh: "តោន" },
  "demandTable.unit.TONS": { en: "TON", kh: "តោន" },
  "demandTable.cropType.Rice Crops": { en: "Rice Crops", kh: "ដំណាំស្រូវ" },
  "demandTable.cropType.Fruits": { en: "Fruits", kh: "ផ្លែឈើ" },
  "demandTable.cropType.Fruit": { en: "Fruit", kh: "ផ្លែឈើ" },
  "demandTable.cropType.Vegetables": { en: "Vegetables", kh: "បន្លែ" },
  "demandTable.cropType.Vegetable": { en: "Vegetable", kh: "បន្លែ" },
  "demandTable.cropType.Grain": { en: "Grain", kh: "ធញ្ញជាតិ" },
  "demandTable.cropType.Grains": { en: "Grains", kh: "ធញ្ញជាតិ" },
  "demandTable.cropType.Fiber Crop": { en: "Fiber Crop", kh: "ដំណាំសរសៃ" },
  "demandTable.cropType.Fiber Crops": { en: "Fiber Crops", kh: "ដំណាំសរសៃ" },
  "demandTable.cropType.Root Crops": { en: "Root Crops", kh: "ដំណាំមើម" },
  "demandTable.cropType.Industrial Crops": {
    en: "Industrial Crops",
    kh: "ដំណាំឧស្សាហកម្ម",
  },
  "demandTable.cropType.Herbs": { en: "Herbs", kh: "រុក្ខជាតិឱសថ" },
  "demandTable.cropType.Spices": { en: "Spices", kh: "គ្រឿងទេស" },
  "demandTable.cropType.Nuts": { en: "Nuts", kh: "គ្រាប់ធញ្ញជាតិ" },
  "demandTable.cropType.Legumes": { en: "Legumes", kh: "ដំណាំសណ្តែក" },
  "demandTable.cropName.Cotton": { en: "Cotton", kh: "កប្បាស" },
  "demandTable.cropName.Orange": { en: "Orange", kh: "ក្រូច" },
  "demandTable.cropName.Watermelon": { en: "Watermelon", kh: "ផ្លែឪឡឹក" },
  "demandTable.cropName.Strawberry": { en: "Strawberry", kh: "ផ្លែស្ត្របឺរី" },
  "demandTable.cropName.Grape": { en: "Grape", kh: "ផ្លែទំពាំងបាយជូរ" },
  "demandTable.cropName.Mango": { en: "Mango", kh: "ផ្លែស្វាយ" },
  "demandTable.cropName.Durian": { en: "Durian", kh: "ផ្លែធុរេន" },
  "demandTable.cropName.Keo Romeat Mango": {
    en: "Keo Romeat Mango",
    kh: "ស្វាយកែវរមៀត",
  },
  "demandTable.cropName.Avocado": { en: "Avocado", kh: "ផ្លែប័រ" },
  "demandTable.cropName.Lychee": { en: "Lychee", kh: "ផ្លៃគូលែន" },
  "demandTable.cropName.Jackfruit": { en: "Jackfruit", kh: "ផ្លែខ្នុរ" },
  "demandTable.cropName.Banana": { en: "Banana", kh: "ផ្លែចេក" },
  "demandTable.cropName.Star Fruit": { en: "Star Fruit", kh: "ផ្លែស្ពឺ" },
  "demandTable.cropName.Apple": { en: "Apple", kh: "ផ្លែប៉ោម" },
  "demandTable.cropName.Wheat": { en: "Wheat", kh: "ស្រូវសាលី" },
  "demandTable.cropName.Rice": { en: "Rice", kh: "ស្រូវ" },
  "demandTable.cropName.Oat": { en: "Oat", kh: "ស្រូវអូត" },
  "demandTable.cropName.Black Pepper": { en: "Black Pepper", kh: "ម្រេច" },
  "demandTable.cropName.Yellow Maize": { en: "Yellow Maize", kh: "ពោតលឿង" },
  "demandTable.cropName.Soybean": { en: "Soybean", kh: "សណ្តែកសៀង" },
  "demandTable.cropName.Sugarcane": { en: "Sugarcane", kh: "អំពៅ" },
  "demandTable.cropName.Rubber": { en: "Rubber", kh: "កៅស៊ូ" },
  "demandTable.cropName.Arabica Coffee": {
    en: "Arabica Coffee",
    kh: "កាហ្វេអារ៉ាប៊ីកា",
  },
  "demandTable.cropName.Jasmine Rice": {
    en: "Jasmine Rice",
    kh: "ស្រូវផ្កាម្លិះ",
  },
  "demandTable.cropName.Brown Rice": { en: "Brown Rice", kh: "អង្ករសម្រូប" },
  "demandTable.cropName.Sen Kra Ob Rice": {
    en: "Sen Kra Ob Rice",
    kh: "ស្រូវសែនក្រអូប",
  },
  "demandTable.cropName.Phka Rumduol Rice": {
    en: "Phka Rumduol Rice",
    kh: "ស្រូវផ្ការំដួល",
  },
  "demandTable.cropName.Cassava": { en: "Cassava", kh: "ដំឡូងមី" },
  "demandTable.cropName.Taro": { en: "Taro", kh: "ដំឡូងតារ៉ូ" },
  "demandTable.cropName.Garlic": { en: "Garlic", kh: "ខ្ទឹមស" },
  "demandTable.cropName.Turmeric": { en: "Turmeric", kh: "រមៀត" },
  "demandTable.location.BANTEAY_MEANCHEY": {
    en: "Banteay Meanchey",
    kh: "បន្ទាយមានជ័យ",
  },
  "demandTable.location.BATTAMBANG": { en: "Battambang", kh: "បាត់ដំបង" },
  "demandTable.location.KAMPONG_CHAM": { en: "Kampong Cham", kh: "កំពង់ចាម" },
  "demandTable.location.KAMPONG_CHHNANG": {
    en: "Kampong Chhnang",
    kh: "កំពង់ឆ្នាំង",
  },
  "demandTable.location.KAMPONG_SPEU": { en: "Kampong Speu", kh: "កំពង់ស្ពឺ" },
  "demandTable.location.KAMPONG_THOM": { en: "Kampong Thom", kh: "កំពង់ធំ" },
  "demandTable.location.KAMPOT": { en: "Kampot", kh: "កំពត" },
  "demandTable.location.KANDAL": { en: "Kandal", kh: "កណ្តាល" },
  "demandTable.location.KEP": { en: "Kep", kh: "កែប" },
  "demandTable.location.KOH_KONG": { en: "Koh Kong", kh: "កោះកុង" },
  "demandTable.location.KRATIE": { en: "Kratie", kh: "ក្រចេះ" },
  "demandTable.location.MONDULKIRI": { en: "Mondul Kiri", kh: "មណ្ឌលគិរី" },
  "demandTable.location.ODDAR_MEANCHEY": {
    en: "Otdar Meanchey",
    kh: "ឧត្តរមានជ័យ",
  },
  "demandTable.location.PAILIN": { en: "Pailin", kh: "ប៉ៃលិន" },
  "demandTable.location.PHNOM_PENH": {
    en: "Phnom Penh",
    kh: "រាជធានីភ្នំពេញ",
  },
  "demandTable.location.PREAH_SIHANOUK": {
    en: "Sihanoukville",
    kh: "ព្រះសីហនុ",
  },
  "demandTable.location.PREAH_VIHEAR": { en: "Preah Vihear", kh: "ព្រះវិហារ" },
  "demandTable.location.PREY_VENG": { en: "Prey Veng", kh: "ព្រៃវែង" },
  "demandTable.location.PURSAT": { en: "Pursat", kh: "ពោធិ៍សាត់" },
  "demandTable.location.RATANAKIRI": { en: "Ratanak Kiri", kh: "រតនគិរី" },
  "demandTable.location.SIEM_REAP": { en: "Siemreap", kh: "សៀមរាប" },
  "demandTable.location.STUNG_TRENG": { en: "Stung Treng", kh: "ស្ទឹងត្រែង" },
  "demandTable.location.SVAY_RIENG": { en: "Svay Rieng", kh: "ស្វាយរៀង" },
  "demandTable.location.TAKEO": { en: "Takeo", kh: "តាកែវ" },
  "demandTable.location.TBOUNG_KHMUM": {
    en: "Tboung Khmum",
    kh: "ត្បូងឃ្មុំ",
  },
} as const;

function getDemandTableText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  return (key: string, values?: Record<string, string | number>): string => {
    let text: string =
      DEMAND_TABLE_TEXT[key as keyof typeof DEMAND_TABLE_TEXT]?.[lang] ?? key;

    if (values) {
      Object.entries(values).forEach(([name, value]) => {
        text = text.replaceAll(`{${name}}`, String(value));
      });
    }

    return text;
  };
}

function getDemandTableFontScopeClass(language: string) {
  return language === "kh"
    ? "!font-khmer [&_*]:!font-khmer [&_.title]:!font-khmer [&_.sub-title]:!font-khmer [&_.heading]:!font-khmer [&_.table-title]:!font-khmer [&_.description]:!font-khmer"
    : "!font-thicccboi [&_*]:!font-thicccboi [&_.title]:!font-thicccboi [&_.sub-title]:!font-thicccboi [&_.heading]:!font-thicccboi [&_.table-title]:!font-thicccboi [&_.description]:!font-thicccboi";
}

interface CropDemandListingsPageProps {
  demands: CropDemandPost[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  initialCropTypes: CropType[];
  initialProvinces: AdministrativeLocation[];
  identityVerification: IdentityVerificationState;
}

type VisibleDemandStatus = Exclude<DemandStatus, "APPLY">;
const DEMAND_LEVEL_OPTIONS: DemandLevel[] = ["LOW", "MODERATE", "HIGH"];
type HeaderSortColumn =
  | "cropName"
  | "cropType"
  | "region"
  | "price"
  | "delivery"
  | "demandLevel";
type HeaderSortDirection = "asc" | "desc";

const STATUS_META: Record<
  VisibleDemandStatus,
  {
    label: string;
    description: string;
    badgeClass: string;
    panelClass: string;
    dotClass: string;
  }
> = {
  OPEN: {
    label: "Open",
    description: "Visible to farmers and ready to receive offers.",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    panelClass: "border-emerald-200 bg-emerald-50/70 text-emerald-900",
    dotClass: "bg-emerald-500",
  },
  MATCHED: {
    label: "Matched",
    description: "A farmer offer has been matched to this demand.",
    badgeClass: "bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]",
    panelClass: "border-lime-200 bg-lime-50/80 text-lime-900",
    dotClass: "bg-lime-500",
  },
  CLOSED: {
    label: "Closed",
    description: "Stop showing this demand as available for new offers.",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    panelClass: "border-rose-200 bg-rose-50/80 text-rose-900",
    dotClass: "bg-rose-500",
  },
};

const DEMAND_LEVEL_META: Record<
  DemandLevel,
  {
    label: string;
    description: string;
    badgeClass: string;
    panelClass: string;
    dotClass: string;
  }
> = {
  LOW: {
    label: "Low",
    description: "Lower urgency. Farmers can respond when supply is available.",
    badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
    panelClass: "border-gray-200 bg-gray-50 text-gray-800",
    dotClass: "bg-gray-400",
  },
  MODERATE: {
    label: "Moderate",
    description: "Standard priority for active sourcing.",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    panelClass: "border-amber-200 bg-amber-50 text-amber-900",
    dotClass: "bg-amber-500",
  },
  HIGH: {
    label: "High",
    description: "Urgent demand. Highlight this request as high priority.",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    panelClass: "border-red-200 bg-red-50 text-red-900",
    dotClass: "bg-red-500",
  },
};

function normalizeLocationKey(location: string) {
  const normalized = location.trim().toUpperCase().replaceAll(/\s+/g, "_");

  const aliases: Record<string, string> = {
    MONDUL_KIRI: "MONDULKIRI",
    RATANAK_KIRI: "RATANAKIRI",
    SIEMREAP: "SIEM_REAP",
    SIHANOUKVILLE: "PREAH_SIHANOUK",
    OTDAR_MEANCHEY: "ODDAR_MEANCHEY",
  };

  return aliases[normalized] ?? normalized;
}

function formatTitleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeTranslationValue(value: string) {
  return value.trim().replaceAll("_", " ").replaceAll(/\s+/g, " ");
}

function getTranslationCandidateValues(namespace: string, value: string) {
  const normalizedValue = normalizeTranslationValue(value);
  const titleCaseValue = formatTitleCase(normalizedValue);
  const upperSnakeValue = normalizedValue.toUpperCase().replaceAll(" ", "_");
  const candidates = [value, normalizedValue, titleCaseValue, upperSnakeValue];

  const aliases: Record<string, Record<string, string>> = {
    cropType: {
      RICE_CROPS: "Rice Crops",
      FRUIT_CROPS: "Fruits",
      FRUITS: "Fruits",
      FRUIT: "Fruit",
      VEGETABLES: "Vegetables",
      VEGETABLE: "Vegetable",
      GRAIN: "Grain",
      GRAINS: "Grains",
      FIBER_CROP: "Fiber Crop",
      FIBER_CROPS: "Fiber Crops",
      ROOT_CROPS: "Root Crops",
      INDUSTRIAL_CROPS: "Industrial Crops",
    },
    unit: {
      TONS: "TONS",
      TON: "TON",
      KG: "KG",
    },
  };

  const alias = aliases[namespace]?.[upperSnakeValue];

  return Array.from(new Set(alias ? [...candidates, alias] : candidates));
}

function translateTableValue(
  t: ReturnType<typeof getDemandTableText>,
  namespace: string,
  value?: string,
) {
  if (!value) return t("demandTable.notAvailable");

  for (const candidate of getTranslationCandidateValues(namespace, value)) {
    const key = `demandTable.${namespace}.${candidate}`;
    const translated = t(key);

    if (translated !== key) return translated;
  }

  return value;
}

function translateCropName(
  cropName: string | undefined,
  t: ReturnType<typeof getDemandTableText>,
) {
  return translateTableValue(t, "cropName", cropName);
}

function translateCropType(
  cropType: string | undefined,
  t: ReturnType<typeof getDemandTableText>,
) {
  return translateTableValue(t, "cropType", cropType);
}

function translateUnitType(
  unitType: string | undefined,
  t: ReturnType<typeof getDemandTableText>,
) {
  return translateTableValue(t, "unit", unitType);
}

function formatLocationName(
  location?: string,
  t?: ReturnType<typeof getDemandTableText>,
) {
  const locationName = location?.split(",")[0]?.trim();

  if (!locationName) return t?.("demandTable.notAvailable") ?? "N/A";

  if (t) {
    const locationKey = normalizeLocationKey(locationName);
    const translatedLocation = t(`demandTable.location.${locationKey}`);

    if (translatedLocation !== `demandTable.location.${locationKey}`) {
      return translatedLocation;
    }
  }

  return formatTitleCase(locationName);
}

function toLocationCode(location?: string) {
  return (location ?? "")
    .split(",")[0]
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
}

function formatDeliveryDate(dateValue?: string, language = "en") {
  if (!dateValue) return language === "kh" ? "មិនមាន" : "N/A";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return language === "kh" ? "មិនមាន" : "N/A";

  return new Intl.DateTimeFormat(language === "kh" ? "km-KH" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function getDeliveryTimestamp(dateValue?: string) {
  if (!dateValue) return 0;

  const date = new Date(dateValue);

  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function getVisibleStatus(status: string): VisibleDemandStatus {
  if (status === "MATCHED" || status === "CLOSED") return status;

  return "OPEN";
}

function getImageFileName(value: string) {
  try {
    const url = new URL(value);
    const parts = url.pathname.split("/").filter(Boolean);

    return parts[parts.length - 1] ?? value;
  } catch {
    const parts = value.split("/").filter(Boolean);

    return parts[parts.length - 1] ?? value;
  }
}

function getDemandImageFileNames(imageUrls?: string | string[]) {
  const urls = Array.isArray(imageUrls)
    ? imageUrls
    : imageUrls
      ? [imageUrls]
      : [];

  return urls
    .filter(
      (url): url is string => typeof url === "string" && url.trim().length > 0,
    )
    .map(getImageFileName);
}

function buildDemandUpdatePayload(
  demand: CropDemandPost,
  demandLevel: DemandLevel,
): CropDemandRequestBody | null {
  if (!demand.cropId) return null;

  return {
    title: demand.title,
    description: demand.description ?? "",
    cropId: demand.cropId,
    unitType: demand.unitType === "TONS" ? "TON" : demand.unitType,
    currencyCode: demand.currencyCode,
    maxPricePerUnit: demand.maxPricePerUnit,
    quantityNeeded: demand.quantityNeeded,
    locationPreferences: toLocationCode(demand.locationPreferences),
    expectedDeliveryDate: demand.expectedDeliveryDate,
    demandLevel,
    imageUrls: getDemandImageFileNames(demand.imageUrls),
  };
}

export default function CropDemandListingsPage({
  demands,
  pagination,
  initialCropTypes,
  initialProvinces,
  identityVerification,
}: CropDemandListingsPageProps) {
  const router = useRouter();
  const { t, language } = useI18n();
  const tt = getDemandTableText(language);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";
  const fontScopeClass = getDemandTableFontScopeClass(language);
  const [localDemands, setLocalDemands] = useState(demands);
  const [paginationState, setPaginationState] = useState(pagination);
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCropType, setSelectedCropType] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [levelDemand, setLevelDemand] = useState<CropDemandPost | null>(null);
  const [selectedNextLevel, setSelectedNextLevel] =
    useState<DemandLevel>("HIGH");
  const [isUpdatingLevel, setIsUpdatingLevel] = useState(false);
  const [deleteDemand, setDeleteDemand] = useState<CropDemandPost | null>(null);
  const [isDeletingDemand, setIsDeletingDemand] = useState(false);
  const isVerifiedIdentity = identityVerification.isVerified;

  const [headerSort, setHeaderSort] = useState<{
    column: HeaderSortColumn;
    direction: HeaderSortDirection;
  } | null>(null);

  const itemsPerPage = paginationState.size;
  const cropTypeOptions = useMemo(
    () => getCropTypeFilterOptions(initialCropTypes),
    [initialCropTypes],
  );
  const regionOptions = useMemo(
    () => getLocationFilterOptions(initialProvinces),
    [initialProvinces],
  );

  const getEndpointFilters = useCallback(
    (
      overrides: Partial<{
        search: string;
        cropType: string;
        region: string;
        status: string;
      }> = {},
    ) => ({
      search: overrides.search ?? searchQuery.trim(),
      cropType: overrides.cropType ?? selectedCropType,
      region: overrides.region ?? selectedRegion,
      status: overrides.status ?? selectedStatus,
    }),
    [searchQuery, selectedCropType, selectedRegion, selectedStatus],
  );

  const fetchDemands = useCallback(
    (
      filters: {
        search: string;
        cropType: string;
        region: string;
        status: string;
      },
      page: number,
    ) => {
      startTransition(async () => {
        const result = await getOwnCropDemandsAction({
          ...filters,
          page,
          size: paginationState.size,
        });

        if (result.error) {
          showApiToast(
            { success: false, error: result.error },
            {
              successTitle: "Crop demands loaded",
              errorTitle: "Load failed",
              errorMessage: "Failed to load crop demands.",
            },
          );
          return;
        }

        setLocalDemands(result.data);
        setPaginationState(result.pagination);
      });
    },
    [paginationState.size],
  );

  useEffect(() => {
    const search = searchQuery.trim();
    const timer = window.setTimeout(() => {
      fetchDemands(getEndpointFilters({ search }), 1);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [fetchDemands, getEndpointFilters, searchQuery]);

  useEffect(() => {
    const hasOpenModal = Boolean(levelDemand || deleteDemand);
    if (!hasOpenModal) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [deleteDemand, levelDemand]);

  const updateEndpointFilter = (
    key: "cropType" | "region" | "status",
    value: string,
  ) => {
    if (key === "cropType") setSelectedCropType(value);
    if (key === "region") setSelectedRegion(value);
    if (key === "status") setSelectedStatus(value);

    fetchDemands(getEndpointFilters({ [key]: value }), 1);
  };

  const toggleHeaderSort = (column: HeaderSortColumn) => {
    setHeaderSort((current) => {
      if (current?.column !== column) {
        return { column, direction: "asc" };
      }

      return {
        column,
        direction: current.direction === "asc" ? "desc" : "asc",
      };
    });
  };

  const getPrimaryImageSrc = (imageUrls?: string | string[]) => {
    const image = Array.isArray(imageUrls) ? imageUrls[0] : imageUrls;

    return getFileUrl(image) || DEMAND_IMAGE_FALLBACK;
  };

  const goToPage = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), paginationState.totalPages);

    if (nextPage !== paginationState.page) {
      fetchDemands(getEndpointFilters(), nextPage);
    }
  };

  const openLevelPopup = (demand: CropDemandPost) => {
    setLevelDemand(demand);
    setSelectedNextLevel(demand.demandLevel);
  };

  const closeLevelPopup = () => {
    if (isUpdatingLevel) return;

    setLevelDemand(null);
  };

  const handleDemandLevelUpdate = async () => {
    if (!levelDemand) return;

    const detailId = levelDemand.postId || levelDemand.cropDemandPostId;
    const payload = buildDemandUpdatePayload(levelDemand, selectedNextLevel);

    if (!payload) {
      setLevelDemand(null);
      showApiToast(
        {
          success: false,
          error:
            "This demand is missing crop information. Please edit the demand and save it again.",
        },
        {
          successTitle: "Demand level updated",
          errorTitle: "Update failed",
        },
      );
      return;
    }

    setIsUpdatingLevel(true);
    const result = await updateCropDemandAction(detailId, payload);
    setIsUpdatingLevel(false);
    setLevelDemand(null);

    if (!result.success) {
      showApiToast(result, {
        successTitle: "Demand level updated",
        errorTitle: "Update failed",
        errorMessage: "Failed to update demand level.",
      });
      return;
    }

    setLocalDemands((currentDemands) =>
      currentDemands.map((demand) =>
        (demand.postId || demand.cropDemandPostId) === detailId
          ? { ...demand, demandLevel: selectedNextLevel }
          : demand,
      ),
    );
    showApiSuccess(
      "Demand level updated",
      `Demand level is now ${selectedNextLevel}.`,
    );
    router.refresh();
  };

  const getLockedMessage = () => {
    const status = String(identityVerification.status ?? "").toUpperCase();

    if (status === "REJECTED") {
      return identityVerification.rejectionReason
        ? `Your identity document was rejected: ${identityVerification.rejectionReason}. Please upload again and wait for approval before managing crop demands.`
        : "Your identity document was rejected. Please upload again and wait for approval before managing crop demands.";
    }

    if (status === "PENDING") {
      return "Your identity document is under review. Please wait for approval before managing crop demands.";
    }

    return "Please verify your identity document before managing crop demands.";
  };

  const explainLockedFeature = () => {
    showApiToast(
      { success: false, error: getLockedMessage() },
      {
        successTitle: "Feature unlocked",
        errorTitle: "Identity verification required",
      },
    );
  };

  const goToTrustedFeature = (href: string) => {
    if (!isVerifiedIdentity) {
      explainLockedFeature();
      return;
    }

    router.push(href);
  };

  const requestDelete = (demand: CropDemandPost) => {
    setDeleteDemand(demand);
  };

  const closeDeletePopup = () => {
    if (isDeletingDemand) return;

    setDeleteDemand(null);
  };

  const handleDelete = async () => {
    if (!deleteDemand) return;

    const postId = deleteDemand.postId || deleteDemand.cropDemandPostId;

    setIsDeletingDemand(true);
    const result = await deleteCropDemandAction(postId);
    setIsDeletingDemand(false);
    setDeleteDemand(null);

    if (!result.success) {
      showApiToast(result, {
        successTitle: "Crop demand deleted",
        errorTitle: "Delete failed",
        errorMessage: "Failed to delete crop demand.",
      });
      return;
    }

    showApiSuccess("Crop demand deleted", "The demand post has been removed.");
    setDeleteDemand(null);
    setLocalDemands((currentDemands) =>
      currentDemands.filter(
        (demand) => (demand.postId || demand.cropDemandPostId) !== postId,
      ),
    );
    router.refresh();
  };

  const filteredDemands = useMemo(() => {
    const demands = localDemands;

    if (!headerSort) return demands;

    const sortedDemands = [...demands].sort((a, b) => {
      const direction = headerSort.direction === "asc" ? 1 : -1;

      if (headerSort.column === "price") {
        return (a.maxPricePerUnit - b.maxPricePerUnit) * direction;
      }

      if (headerSort.column === "delivery") {
        return (
          (getDeliveryTimestamp(a.expectedDeliveryDate) -
            getDeliveryTimestamp(b.expectedDeliveryDate)) *
          direction
        );
      }

      const getSortValue = (demand: CropDemandPost) => {
        if (headerSort.column === "cropName") return demand.cropName ?? "";
        if (headerSort.column === "cropType") return demand.cropType ?? "";
        if (headerSort.column === "demandLevel")
          return demand.demandLevel ?? "";
        return formatLocationName(demand.locationPreferences);
      };

      return getSortValue(a).localeCompare(getSortValue(b)) * direction;
    });

    return sortedDemands;
  }, [localDemands, headerSort]);

  const paginatedDemands = filteredDemands;

  const renderSortHeader = (label: string, column: HeaderSortColumn) => {
    const isActive = headerSort?.column === column;

    return (
      <button
        type="button"
        onClick={() => toggleHeaderSort(column)}
        className={`group flex w-full items-center justify-between gap-1 text-left font-bold uppercase tracking-wider transition-colors hover:text-primary ${
          isActive ? "text-primary" : "text-muted"
        }`}
        aria-label={tt("demandTable.sortBy", { label })}
      >
        <span className="truncate">{label}</span>
        <ChevronsUpDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${
            isActive && headerSort.direction === "desc" ? "rotate-180" : ""
          } ${isActive ? "text-primary" : "text-muted"}`}
        />
      </button>
    );
  };

  return (
    <div className={`min-h-screen bg-background ${fontClass} ${fontScopeClass}`}>
      <section className="mt-6 px-3 sm:px-4 md:px-6">
        <div className="relative mx-auto -mt-25.75 h-75 w-full overflow-hidden rounded-[20px] sm:h-90 md:h-100.75 md:rounded-[28px] z-0">
          <Image
            src="/assets/nav-bar/navbar_bg_image.png"
            alt={tt("demandTable.heroAlt")}
            fill
            priority
            className="object-cover"
          />
          <div className="relative z-10 flex h-full items-center justify-center px-4 text-center text-white sm:px-8 md:px-12 lg:px-20">
            <div className="flex w-full max-w-194.5 flex-col items-center gap-4 md:gap-6">
              <div className="relative">
                <p className="text-[22px] font-black leading-none sm:text-[28px] md:text-[34px] lg:text-[36px]">
                  {t("cropDemands.title")}
                </p>
                <Image
                  src="/assets/home_page/vector.png"
                  alt="Underline"
                  width={215}
                  height={26}
                  priority
                  className="absolute left-1/2 top-7.5 w-30 -translate-x-1/2 sm:w-40 md:top-9.5 md:w-53.75"
                  style={{ height: "auto" }}
                />
                <h1
                  className={`mt-5 text-[36px] font-black leading-none text-[#F9C156] sm:text-[48px] md:text-[60px] lg:text-[68px] ${fontClass}`}
                >
                  {t("cropDemands.heroTitle")}
                </h1>
              </div>
              <p className="max-w-85 text-[13px] font-medium leading-normal text-white sm:max-w-130 sm:text-[15px] md:max-w-160 md:text-[16px] lg:text-[18px]">
                {t("crop.hero.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-350 flex-col gap-y-6 overflow-x-hidden p-4 md:p-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-2 flex w-full min-w-0 items-center gap-2 text-[14px] font-medium text-muted sub-title">
          <Link href="/" className="hover:underline">
            {t("crop.common.home")}
          </Link>
          <span>&rsaquo;</span>
          <Link href="/listing-crop-demands" className="hover:underline">
            {t("cropDemands.title")}
          </Link>
          <span>&rsaquo;</span>
          <span className="font-semibold text-primary">
            {t("cropDemands.management")}
          </span>
        </nav>

        {/* Header Block */}
        <header className="mb-2 flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-[40px] font-bold tracking-tight text-primary-heading heading">
            {t("cropDemands.listings")}
          </h1>

          <div className="flex w-full min-w-0 flex-col items-stretch gap-2.5 sm:w-auto sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => goToTrustedFeature("/crop-demands-edit")}
              className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-secondary px-5 py-3 text-center text-[14px] font-semibold text-primary-heading shadow-xs transition-all hover:brightness-95 active:scale-98 sm:w-auto sub-title"
            >
              <CirclePlus className="h-4 w-4 shrink-0" />
              <span className="uppercase">
                {tt("demandTable.postNewDemand")}
              </span>
            </button>
          </div>
        </header>

        {/* Interactive Filter Panel (Uses Custom Filter dropdowns) */}
        <section className="grid w-full min-w-0 grid-cols-1 items-end gap-4 lg:grid-cols-12 rounded-2xl backdrop-blur-xs">
          <div className="flex w-full min-w-0 flex-col gap-2 lg:col-span-4">
            <label className="text-[14px] font-medium uppercase tracking-wider text-muted sub-title">
              {t("crop.common.search")}
            </label>
            <div className="relative w-full min-w-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("crop.common.searchByCropName")}
                className="w-full rounded-xl border border-light-grey bg-white py-3 pl-4 pr-12 text-[14px] font-medium text-dark-grey shadow-xs focus:border-primary focus:outline-none sub-title"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">
                <Search className="h-5 w-5 opacity-70" />
              </span>
            </div>
          </div>

          <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-8">
            <CustomFilterSelect
              label={t("crop.common.cropType")}
              selected={selectedCropType}
              onChange={(val) => updateEndpointFilter("cropType", val)}
              labelClassName="text-muted"
              options={[...cropTypeOptions]}
            />
            <CustomFilterSelect
              label={t("crop.common.region")}
              selected={selectedRegion}
              onChange={(val) => updateEndpointFilter("region", val)}
              labelClassName="text-muted"
              options={regionOptions}
            />
            <CustomFilterSelect
              label={t("crop.common.status")}
              selected={selectedStatus}
              onChange={(val) => updateEndpointFilter("status", val)}
              options={["All", "OPEN", "MATCHED", "CLOSED"]}
            />
          </div>
        </section>

        {/* Data View Table */}
        <div className="hidden w-full rounded-2xl border border-light-grey bg-white shadow-xs lg:block">
          <table className="w-full border-collapse text-left table-fixed">
            <thead>
              <tr className="border-b border-light-grey bg-gray-50/70 text-[14px] font-medium uppercase tracking-wider text-muted sub-title">
                <th className="w-[5%] px-4 py-4 text-center font-bold">
                  {t("crop.common.no")}
                </th>
                <th className="w-[8%] px-4 py-4 font-bold">
                  {t("crop.common.image")}
                </th>
                <th className="w-[15%] px-4 py-4">
                  {renderSortHeader(t("crop.common.cropName"), "cropName")}
                </th>
                <th className="w-[14%] px-4 py-4">
                  {renderSortHeader(t("crop.common.cropType"), "cropType")}
                </th>
                <th className="w-[12%] px-4 py-4">
                  {renderSortHeader(t("crop.common.region"), "region")}
                </th>
                <th className="w-[8%] px-4 py-4 font-semibold text-muted">
                  {t("cropDemands.unit")}
                </th>
                <th className="w-[12%] px-4 py-4">
                  {renderSortHeader(t("crop.common.price"), "price")}
                </th>
                <th className="w-[13%] px-4 py-4">
                  {renderSortHeader(t("cropDemands.delivery"), "delivery")}
                </th>
                <th className="w-[13%] px-4 py-4">
                  {renderSortHeader(t("cropDemands.demand"), "demandLevel")}
                </th>
                <th className="w-[10%] px-4 py-4 font-bold text-muted">
                  {t("crop.common.status")}
                </th>
                <th className="w-[11%] px-4 py-4 text-center font-bold text-muted">
                  {t("crop.common.action")}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-light-grey text-[16px] font-semibold text-dark-grey">
              {paginatedDemands.length > 0 ? (
                paginatedDemands.map((item, index) => {
                  const displayDate = formatDeliveryDate(
                    item.expectedDeliveryDate,
                    language,
                  );
                  const displayLocation = formatLocationName(
                    item.locationPreferences,
                    tt,
                  );
                  const displayCropName = translateCropName(
                    item.cropName,
                    tt,
                  );
                  const displayCropType = translateCropType(
                    item.cropTypeName ?? item.cropType,
                    tt,
                  );
                  const displayUnit = translateUnitType(item.unitType, tt);

                  const imgSource = getPrimaryImageSrc(item.imageUrls);

                  const detailId = item.postId || item.cropDemandPostId;

                  return (
                    <tr
                      key={detailId}
                      onClick={() =>
                        router.push(`/listing-crop-demands/${detailId}`)
                      }
                      className="group cursor-pointer transition-colors hover:bg-gray-50/70"
                    >
                      <td className="px-4 py-4 text-center text-muted font-medium text-[14px] sub-title truncate">
                        {(paginationState.page - 1) * itemsPerPage + index + 1}
                      </td>

                      <td className="px-4 py-3">
                        <div className="relative h-11 w-11">
                          <Image
                            src={imgSource}
                            alt={displayCropName || tt("demandTable.productAlt")}
                            fill
                            sizes="44px"
                            className="rounded-xl border border-light-grey bg-gray-50 object-cover"
                          />
                        </div>
                      </td>

                      <td className="px-4 py-4 sub-title font-semibold text-primary-heading title group-hover:text-primary transition-colors truncate">
                        {displayCropName}
                      </td>

                      <td className="px-4 py-4 text-secondary-body uppercase sub-title tracking-wider font-medium sub-title truncate">
                        {displayCropType}
                      </td>

                      <td className="px-4 py-4 text-secondary-body sub-title font-medium sub-title truncate">
                        {displayLocation}
                      </td>

                      <td className="px-4 py-4 font-medium text-muted sub-title sub-title truncate">
                        {displayUnit}
                      </td>

                      <td className="px-4 py-4 sub-title font-semibold text-primary title truncate">
                        {item.currencyCode}
                        {item.maxPricePerUnit.toLocaleString()}
                      </td>

                      <td className="px-4 py-4 text-secondary-body font-medium sub-title truncate">
                        {displayDate}
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (isVerifiedIdentity) {
                              openLevelPopup(item);
                            } else {
                              explainLockedFeature();
                            }
                          }}
                          className="rounded-xl outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary/30"
                          aria-label={tt("demandTable.updateLevelAria", {
                            cropName: displayCropName,
                          })}
                        >
                          <DemandLevelBadge level={item.demandLevel} t={tt} />
                        </button>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          title={tt("demandTable.statusAutoTitle")}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <StatusBadge status={item.status} t={tt} />
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/listing-crop-demands/${detailId}`}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button
                              className="cursor-pointer rounded-lg border border-light-grey bg-white p-1.5 text-secondary-body transition-colors hover:bg-gray-50 hover:text-dark-grey"
                              aria-label={tt("demandTable.viewAria")}
                              title={t("crop.common.view")}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          </Link>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              goToTrustedFeature(
                                `/crop-demands-edit/${detailId}`,
                              );
                            }}
                            className="cursor-pointer rounded-lg border border-amber-200 bg-amber-50/50 p-1.5 text-amber-500 transition-colors hover:bg-amber-100"
                            aria-label={tt("demandTable.updateAria")}
                            title={t("crop.common.update")}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              if (isVerifiedIdentity) {
                                requestDelete(item);
                              } else {
                                explainLockedFeature();
                              }
                            }}
                            className="cursor-pointer rounded-lg border border-rose-200 bg-rose-50/50 p-1.5 text-rose-500 transition-colors hover:bg-rose-100"
                            aria-label={tt("demandTable.deleteAria")}
                            title={t("crop.common.delete")}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={11}
                    className="bg-gray-50/20 py-12 text-center font-medium text-muted text-[14px] sub-title"
                  >
                    {t("cropDemands.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Responsive Mobile Layout cards */}
        <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
          {paginatedDemands.map((item, index) => {
            const detailId = item.postId || item.cropDemandPostId;
            const displayCropName = translateCropName(item.cropName, tt);
            const displayCropType = translateCropType(
              item.cropTypeName ?? item.cropType,
              tt,
            );
            const displayLocation = formatLocationName(
              item.locationPreferences,
              tt,
            );
            const displayDate = formatDeliveryDate(
              item.expectedDeliveryDate,
              language,
            );
            const displayUnit = translateUnitType(item.unitType, tt);

            return (
              <div
                key={detailId}
                onClick={() =>
                  router.push(`/listing-crop-demands/${detailId}`)
                }
                className="relative flex w-full min-w-0 cursor-pointer gap-4 rounded-xl border border-light-grey bg-white p-4 shadow-xs transition-colors hover:bg-gray-50"
              >
              <span className="absolute right-3 top-3 rounded-full bg-gray-100 px-2 py-0.5 text-[14px] font-medium text-muted sub-title">
                #{(paginationState.page - 1) * itemsPerPage + index + 1}
              </span>

              <div className="relative h-20 w-20 shrink-0">
                <Image
                  src={getPrimaryImageSrc(item.imageUrls)}
                  alt={displayCropName || tt("demandTable.productAlt")}
                  fill
                  sizes="80px"
                  className="rounded-xl border border-light-grey bg-gray-50 object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex gap-1 items-center mb-1">
                  <StatusBadge status={item.status} t={tt} />
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (isVerifiedIdentity) {
                        openLevelPopup(item);
                      } else {
                        explainLockedFeature();
                      }
                    }}
                    className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    aria-label={tt("demandTable.updateLevelAria", {
                      cropName: displayCropName,
                    })}
                  >
                    <DemandLevelBadge level={item.demandLevel} t={tt} />
                  </button>
                </div>

                <h3 className="truncate text-[20px] font-semibold text-primary-heading title">
                  {displayCropName}
                </h3>
                <p className="text-[14px] font-medium uppercase tracking-wider text-muted sub-title">
                  {displayCropType} {tt("demandTable.cropSuffix")}
                </p>
                <p className="mt-1 truncate text-[14px] font-medium text-secondary-body sub-title">
                  {displayLocation}
                </p>

                <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 border-t border-gray-100 pt-2 text-[14px] sub-title">
                  <div>
                    <span className="block text-muted">
                      {t("cropDemands.maxPrice")}:
                    </span>
                    <span className="text-[18px] font-semibold text-primary">
                      {item.currencyCode} {item.maxPricePerUnit} /{" "}
                      {displayUnit}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted">
                      {t("cropDemands.delivery")}:
                    </span>
                    <span className="font-semibold text-secondary-body truncate block">
                      {displayDate}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-end gap-1.5 border-t border-gray-100 pt-2">
                  <Link
                    href={`/listing-crop-demands/${detailId}`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button className="rounded-lg border border-light-grey px-2.5 py-1.5 text-[14px] font-semibold text-secondary-body sub-title">
                      {t("crop.common.view")}
                    </button>
                  </Link>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      goToTrustedFeature(
                        `/crop-demands-edit/${detailId}`,
                      );
                    }}
                    className="rounded-lg border border-amber-200 bg-amber-50/50 px-2.5 py-1.5 text-[14px] font-semibold text-amber-600 sub-title"
                  >
                    {t("crop.common.edit")}
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      if (isVerifiedIdentity) {
                        requestDelete(item);
                      } else {
                        explainLockedFeature();
                      }
                    }}
                    className="rounded-lg border border-rose-200 bg-rose-50/50 px-2.5 py-1.5 text-[14px] font-semibold text-rose-600 sub-title"
                  >
                    {t("crop.common.delete")}
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        <footer className="mt-4 border-t border-light-grey pt-4">
          <PaginationComponent
            currentPage={paginationState.page}
            totalItems={paginationState.totalElements}
            pageSize={itemsPerPage}
            onPageChange={goToPage}
            pageBase={1}
            size="sm"
            className="border-0 shadow-none"
            disabled={isPending}
          />
        </footer>
      </div>

      <DemandLevelUpdatePopup
        demand={levelDemand}
        selectedLevel={selectedNextLevel}
        isUpdating={isUpdatingLevel}
        onSelectLevel={setSelectedNextLevel}
        onClose={closeLevelPopup}
        onConfirm={handleDemandLevelUpdate}
      />
      <DeleteDemandPopup
        demand={deleteDemand}
        isDeleting={isDeletingDemand}
        onClose={closeDeletePopup}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function DemandLevelUpdatePopup({
  demand,
  selectedLevel,
  isUpdating,
  onSelectLevel,
  onClose,
  onConfirm,
}: {
  demand: CropDemandPost | null;
  selectedLevel: DemandLevel;
  isUpdating: boolean;
  onSelectLevel: (level: DemandLevel) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { language } = useI18n();
  const t = getDemandTableText(language);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";
  const fontScopeClass = getDemandTableFontScopeClass(language);

  if (!demand) return null;

  const hasChanged = demand.demandLevel !== selectedLevel;

  return (
    <div
      className={`fixed inset-0 z-10000 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm ${fontClass} ${fontScopeClass}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="demand-level-update-title"
    >
      <div className="relative w-full max-w-120 rounded-2xl border border-light-grey bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          disabled={isUpdating}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-gray-100 hover:text-primary-heading disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={t("demandTable.closeLevel")}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 pr-10">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <RefreshCw className="h-3.5 w-3.5" />
            {t("demandTable.updateDemandLevel")}
          </p>
          <h2
            id="demand-level-update-title"
            className="mt-2 truncate text-2xl font-black text-primary-heading"
          >
            {demand.cropName}
          </h2>
          <p className="mt-1 text-sm font-medium text-secondary-body">
            {t("demandTable.chooseUrgency")}
          </p>
        </div>

        <div className="grid gap-2">
          {DEMAND_LEVEL_OPTIONS.map((level) => {
            const meta = DEMAND_LEVEL_META[level];
            const isSelected = selectedLevel === level;
            const isCurrent = demand.demandLevel === level;
            const levelLabel = t(`demandTable.demandLevel.${level}`);
            const levelDescription = t(`demandTable.demandLevelDesc.${level}`);

            return (
              <button
                key={level}
                type="button"
                onClick={() => onSelectLevel(level)}
                disabled={isUpdating || isCurrent}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                  isSelected
                    ? `${meta.panelClass} ring-2 ring-primary/10`
                    : "border-light-grey bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.dotClass}`}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2 text-sm font-black uppercase tracking-wider">
                    <span>{levelLabel}</span>
                    {isCurrent ? (
                      <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary ring-1 ring-primary/15">
                        {t("demandTable.current")}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-xs font-medium opacity-75">
                    {levelDescription}
                  </span>
                </span>
                {isSelected ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="rounded-xl border border-light-grey bg-white px-5 py-3 text-sm font-bold text-secondary-body transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("demandTable.cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isUpdating || !hasChanged}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("demandTable.updating")}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                {t("demandTable.updateLevel")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteDemandPopup({
  demand,
  isDeleting,
  onClose,
  onConfirm,
}: {
  demand: CropDemandPost | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { language } = useI18n();
  const tt = getDemandTableText(language);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";
  const fontScopeClass = getDemandTableFontScopeClass(language);

  if (!demand) return null;

  return (
    <div
      className={`fixed inset-0 z-10000 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm ${fontClass} ${fontScopeClass}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-demand-title"
    >
      <div className="relative w-full max-w-110 rounded-2xl border border-light-grey bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-gray-100 hover:text-primary-heading disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={tt("demandTable.closeDelete")}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 pr-10">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600">
            <Trash2 className="h-3.5 w-3.5" />
            {tt("demandTable.deleteDemand")}
          </p>
          <h2
            id="delete-demand-title"
            className="mt-2 truncate text-2xl font-black text-primary-heading"
          >
            {demand.cropName}
          </h2>
          <p className="mt-2 text-sm font-medium leading-relaxed text-secondary-body">
            {tt("demandTable.deleteDesc")}
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-light-grey bg-white px-5 py-3 text-sm font-bold text-secondary-body transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {tt("demandTable.cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {tt("demandTable.deleting")}
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                {tt("demandTable.deleteDemand")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. BADGE COMPONENT UTILS (UNIFORM SIZING)
// ==========================================
function DemandLevelBadge({
  level,
  t,
}: {
  level: string;
  t: ReturnType<typeof getDemandTableText>;
}) {
  const meta = DEMAND_LEVEL_META[level as DemandLevel] ?? DEMAND_LEVEL_META.LOW;
  const label = t(`demandTable.demandLevel.${level}`);

  return (
    <span
      className={`flex h-8 w-20 items-center justify-center rounded-xl border text-[10px] font-bold uppercase tracking-wider shadow-xs ${
        meta.badgeClass
      }`}
    >
      {label === `demandTable.demandLevel.${level}` ? level : label}
    </span>
  );
}

function StatusBadge({
  status,
  t,
}: {
  status: string;
  t: ReturnType<typeof getDemandTableText>;
}) {
  const visibleStatus = getVisibleStatus(status);
  const meta = STATUS_META[visibleStatus] ?? STATUS_META.OPEN;
  const label = t(`demandTable.status.${visibleStatus}`);

  return (
    <span
      className={`flex h-8 w-20 items-center justify-center rounded-xl border text-[10px] font-bold uppercase tracking-wider shadow-xs ${
        meta.badgeClass
      }`}
    >
      {label === `demandTable.status.${visibleStatus}` ? visibleStatus : label}
    </span>
  );
}
