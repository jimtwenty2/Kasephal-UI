"use client";

import React, {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import Image from "next/image";
import {
  Search,
  Edit,
  Eye,
  Trash2,
  CirclePlus,
  ArrowLeftIcon,
  Package,
  X,
  CheckCircle2,
  ChevronsUpDown,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { CropProductPost } from "@/types/crop-product";
import Link from "next/link";
import { StatusBadge } from "../FilterDropdownComponent";
import { CustomFilterSelect } from "../../../(crop-demands)/_components/CustomFilterSelect";
import {
  deleteCropProductAction,
  getOwnCropProductsAction,
  updateCropProductQuantityAction,
} from "@/action/crop-product.action";
import { showApiSuccess, showApiToast } from "@/lib/apiToast";
import PaginationComponent from "@/components/action-components/PaginationComponent";
import { CropType } from "@/types/cropType";
import type { AdministrativeLocation } from "@/services/locationFilter.service";
import { getCropTypeFilterOptions } from "@/lib/cropTypeOptions";
import { getLocationFilterOptions } from "@/lib/locationOptions";
import type { IdentityVerificationState } from "@/lib/identityVerification";
import { useI18n } from "@/lib/i18n/I18nContext";
import { getFileUrl } from "@/utils/getFileUrl";

type ProductFilters = {
  search: string;
  cropType: string;
  region: string;
  status: string;
};

const DEFAULT_FILTERS: ProductFilters = {
  search: "",
  cropType: "All",
  region: "All",
  status: "All",
};
const PRODUCT_IMAGE_FALLBACK = "/assets/image/no-product.jpg";


const CROP_PRODUCT_TABLE_TEXT = {
  "cropProductTable.toast.productsLoaded": {
    en: "Crop products loaded",
    kh: "បានផ្ទុកផលិតផលដំណាំ",
  },
  "cropProductTable.toast.loadFailed": {
    en: "Load failed",
    kh: "ការផ្ទុកបរាជ័យ",
  },
  "cropProductTable.toast.loadFailedMessage": {
    en: "Failed to load crop products.",
    kh: "មិនអាចផ្ទុកផលិតផលដំណាំបានទេ។",
  },
  "cropProductTable.toast.productDeleted": {
    en: "Crop product deleted",
    kh: "បានលុបផលិតផលដំណាំ",
  },
  "cropProductTable.toast.deleteFailed": {
    en: "Delete failed",
    kh: "ការលុបបរាជ័យ",
  },
  "cropProductTable.toast.deleteFailedMessage": {
    en: "Failed to delete crop product.",
    kh: "មិនអាចលុបផលិតផលដំណាំបានទេ។",
  },
  "cropProductTable.toast.productRemoved": {
    en: "The product listing has been removed.",
    kh: "បញ្ជីផលិតផលនេះត្រូវបានដកចេញហើយ។",
  },
  "cropProductTable.toast.invalidStock": {
    en: "Invalid stock amount",
    kh: "ចំនួនស្តុកមិនត្រឹមត្រូវ",
  },
  "cropProductTable.toast.stockAtLeastOne": {
    en: "Stock amount must be at least 1.",
    kh: "ចំនួនស្តុកត្រូវតែយ៉ាងហោចណាស់ 1។",
  },
  "cropProductTable.toast.stockAdded": {
    en: "Stock added",
    kh: "បានបន្ថែមស្តុក",
  },
  "cropProductTable.toast.updateFailed": {
    en: "Update failed",
    kh: "ការធ្វើបច្ចុប្បន្នភាពបរាជ័យ",
  },
  "cropProductTable.toast.addStockFailed": {
    en: "Failed to add crop product stock.",
    kh: "មិនអាចបន្ថែមស្តុកផលិតផលដំណាំបានទេ។",
  },
  "cropProductTable.toast.stockUpdated": {
    en: "The crop product stock was updated.",
    kh: "ស្តុកផលិតផលដំណាំត្រូវបានធ្វើបច្ចុប្បន្នភាពហើយ។",
  },
  "cropProductTable.locked.rejectedWithReason": {
    en: "Your identity document was rejected: {reason}. Please upload again and wait for approval before managing crop products.",
    kh: "ឯកសារផ្ទៀងផ្ទាត់អត្តសញ្ញាណរបស់អ្នកត្រូវបានបដិសេធ៖ {reason}។ សូមបង្ហោះម្តងទៀត ហើយរង់ចាំការអនុម័ត មុនពេលគ្រប់គ្រងផលិតផលដំណាំ។",
  },
  "cropProductTable.locked.rejected": {
    en: "Your identity document was rejected. Please upload again and wait for approval before managing crop products.",
    kh: "ឯកសារផ្ទៀងផ្ទាត់អត្តសញ្ញាណរបស់អ្នកត្រូវបានបដិសេធ។ សូមបង្ហោះម្តងទៀត ហើយរង់ចាំការអនុម័ត មុនពេលគ្រប់គ្រងផលិតផលដំណាំ។",
  },
  "cropProductTable.locked.pending": {
    en: "Your identity document is under review. Please wait for approval before managing crop products.",
    kh: "ឯកសារផ្ទៀងផ្ទាត់អត្តសញ្ញាណរបស់អ្នកកំពុងត្រូវបានពិនិត្យ។ សូមរង់ចាំការអនុម័ត មុនពេលគ្រប់គ្រងផលិតផលដំណាំ។",
  },
  "cropProductTable.locked.required": {
    en: "Please verify your identity document before managing crop products.",
    kh: "សូមផ្ទៀងផ្ទាត់ឯកសារអត្តសញ្ញាណរបស់អ្នក មុនពេលគ្រប់គ្រងផលិតផលដំណាំ។",
  },
  "cropProductTable.locked.unlocked": {
    en: "Feature unlocked",
    kh: "មុខងារត្រូវបានបើក",
  },
  "cropProductTable.locked.requiredTitle": {
    en: "Identity verification required",
    kh: "ត្រូវការផ្ទៀងផ្ទាត់អត្តសញ្ញាណ",
  },
  "cropProductTable.heroAlt": {
    en: "Hero Background",
    kh: "ផ្ទៃខាងក្រោយផ្នែក Hero",
  },
  "cropProductTable.productAlt": {
    en: "Crop Product",
    kh: "ផលិតផលដំណាំ",
  },
  "cropProductTable.sortBy": {
    en: "Sort by {label}",
    kh: "តម្រៀបតាម {label}",
  },
  "cropProductTable.addStock": {
    en: "Add Stock",
    kh: "បន្ថែមស្តុក",
  },
  "cropProductTable.stockToAdd": {
    en: "Stock to Add",
    kh: "ស្តុកដែលត្រូវបន្ថែម",
  },
  "cropProductTable.closeQuantity": {
    en: "Close stock update",
    kh: "បិទការធ្វើបច្ចុប្បន្នភាពស្តុក",
  },
  "cropProductTable.currentQuantity": {
    en: "Current stock: {quantity} {unit}",
    kh: "ស្តុកបច្ចុប្បន្ន៖ {quantity} {unit}",
  },
  "cropProductTable.deleteProduct": {
    en: "Delete Product",
    kh: "លុបផលិតផល",
  },
  "cropProductTable.deleteDescription": {
    en: "This crop product will be removed from your listings. This action cannot be undone.",
    kh: "ផលិតផលដំណាំនេះនឹងត្រូវបានដកចេញពីបញ្ជីរបស់អ្នក។ សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានទេ។",
  },
  "cropProductTable.deleting": {
    en: "Deleting",
    kh: "កំពុងលុប",
  },
  "cropProductTable.cambodia": {
    en: "Cambodia",
    kh: "កម្ពុជា",
  },
  "cropProductTable.unitTon": {
    en: "Ton",
    kh: "តោន",
  },
  "cropProductTable.unitTons": {
    en: "Tons",
    kh: "តោន",
  },
  "cropProductTable.unit.KG": { en: "KG", kh: "គីឡូក្រាម" },
  "cropProductTable.unit.TON": { en: "TON", kh: "តោន" },
  "cropProductTable.unit.TONS": { en: "TON", kh: "តោន" },
  "cropProductTable.cropType.Rice Crops": { en: "Rice Crops", kh: "ដំណាំស្រូវ" },
  "cropProductTable.cropType.Fruits": { en: "Fruits", kh: "ផ្លែឈើ" },
  "cropProductTable.cropType.Fruit": { en: "Fruit", kh: "ផ្លែឈើ" },
  "cropProductTable.cropType.Vegetables": { en: "Vegetables", kh: "បន្លែ" },
  "cropProductTable.cropType.Vegetable": { en: "Vegetable", kh: "បន្លែ" },
  "cropProductTable.cropType.Grain": { en: "Grain", kh: "ធញ្ញជាតិ" },
  "cropProductTable.cropType.Grains": { en: "Grains", kh: "ធញ្ញជាតិ" },
  "cropProductTable.cropType.Fiber Crop": { en: "Fiber Crop", kh: "ដំណាំសរសៃ" },
  "cropProductTable.cropType.Fiber Crops": { en: "Fiber Crops", kh: "ដំណាំសរសៃ" },
  "cropProductTable.cropType.Root Crops": { en: "Root Crops", kh: "ដំណាំមើម" },
  "cropProductTable.cropType.Industrial Crops": {
    en: "Industrial Crops",
    kh: "ដំណាំឧស្សាហកម្ម",
  },
  "cropProductTable.cropType.Herbs": { en: "Herbs", kh: "រុក្ខជាតិឱសថ" },
  "cropProductTable.cropType.Spices": { en: "Spices", kh: "គ្រឿងទេស" },
  "cropProductTable.cropType.Nuts": { en: "Nuts", kh: "គ្រាប់ធញ្ញជាតិ" },
  "cropProductTable.cropType.Legumes": { en: "Legumes", kh: "ដំណាំសណ្តែក" },
  "cropProductTable.cropName.Cotton": { en: "Cotton", kh: "កប្បាស" },
  "cropProductTable.cropName.Orange": { en: "Orange", kh: "ក្រូច" },
  "cropProductTable.cropName.Watermelon": { en: "Watermelon", kh: "ផ្លែឪឡឹក" },
  "cropProductTable.cropName.Strawberry": { en: "Strawberry", kh: "ផ្លែស្ត្របឺរី" },
  "cropProductTable.cropName.Grape": { en: "Grape", kh: "ផ្លែទំពាំងបាយជូរ" },
  "cropProductTable.cropName.Mango": { en: "Mango", kh: "ផ្លែស្វាយ" },
  "cropProductTable.cropName.Durian": { en: "Durian", kh: "ផ្លែធុរេន" },
  "cropProductTable.cropName.Keo Romeat Mango": {
    en: "Keo Romeat Mango",
    kh: "ស្វាយកែវរមៀត",
  },
  "cropProductTable.cropName.Avocado": { en: "Avocado", kh: "ផ្លែប័រ" },
  "cropProductTable.cropName.Lychee": { en: "Lychee", kh: "ផ្លៃគូលែន" },
  "cropProductTable.cropName.Jackfruit": { en: "Jackfruit", kh: "ផ្លែខ្នុរ" },
  "cropProductTable.cropName.Banana": { en: "Banana", kh: "ផ្លែចេក" },
  "cropProductTable.cropName.Star Fruit": { en: "Star Fruit", kh: "ផ្លែស្ពឺ" },
  "cropProductTable.cropName.Apple": { en: "Apple", kh: "ផ្លែប៉ោម" },
  "cropProductTable.cropName.Wheat": { en: "Wheat", kh: "ស្រូវសាលី" },
  "cropProductTable.cropName.Rice": { en: "Rice", kh: "ស្រូវ" },
  "cropProductTable.cropName.Oat": { en: "Oat", kh: "ស្រូវអូត" },
  "cropProductTable.cropName.Black Pepper": { en: "Black Pepper", kh: "ម្រេច" },
  "cropProductTable.cropName.Yellow Maize": { en: "Yellow Maize", kh: "ពោតលឿង" },
  "cropProductTable.cropName.Soybean": { en: "Soybean", kh: "សណ្តែកសៀង" },
  "cropProductTable.cropName.Sugarcane": { en: "Sugarcane", kh: "អំពៅ" },
  "cropProductTable.cropName.Rubber": { en: "Rubber", kh: "កៅស៊ូ" },
  "cropProductTable.cropName.Arabica Coffee": {
    en: "Arabica Coffee",
    kh: "កាហ្វេអារ៉ាប៊ីកា",
  },
  "cropProductTable.cropName.Jasmine Rice": {
    en: "Jasmine Rice",
    kh: "ស្រូវផ្កាម្លិះ",
  },
  "cropProductTable.cropName.Brown Rice": { en: "Brown Rice", kh: "អង្ករសម្រូប" },
  "cropProductTable.cropName.Sen Kra Ob Rice": {
    en: "Sen Kra Ob Rice",
    kh: "ស្រូវសែនក្រអូប",
  },
  "cropProductTable.cropName.Phka Rumduol Rice": {
    en: "Phka Rumduol Rice",
    kh: "ស្រូវផ្ការំដួល",
  },
  "crop.common.no": { en: "No", kh: "លេខរៀង" },
  "crop.common.image": { en: "Image", kh: "រូបភាព" },
  "crop.common.cropName": { en: "Crop Name", kh: "ឈ្មោះដំណាំ" },
  "crop.common.region": { en: "Region", kh: "តំបន់" },
  "crop.common.price": { en: "Price", kh: "តម្លៃ" },
  "crop.common.status": { en: "Status", kh: "ស្ថានភាព" },
  "crop.common.action": { en: "Action", kh: "សកម្មភាព" },
  "cropProductTable.cropName.Cassava": { en: "Cassava", kh: "ដំឡូងមី" },
  "cropProductTable.cropName.Taro": { en: "Taro", kh: "ត្រាវ" },
  "cropProductTable.cropName.Garlic": { en: "Garlic", kh: "ខ្ទឹមស" },
  "cropProductTable.cropName.Turmeric": { en: "Turmeric", kh: "រមៀត" },
  "cropProductTable.location.BANTEAY_MEANCHEY": {
    en: "Banteay Meanchey",
    kh: "បន្ទាយមានជ័យ",
  },
  "cropProductTable.location.BATTAMBANG": { en: "Battambang", kh: "បាត់ដំបង" },
  "cropProductTable.location.KAMPONG_CHAM": { en: "Kampong Cham", kh: "កំពង់ចាម" },
  "cropProductTable.location.KAMPONG_CHHNANG": {
    en: "Kampong Chhnang",
    kh: "កំពង់ឆ្នាំង",
  },
  "cropProductTable.location.KAMPONG_SPEU": { en: "Kampong Speu", kh: "កំពង់ស្ពឺ" },
  "cropProductTable.location.KAMPONG_THOM": { en: "Kampong Thom", kh: "កំពង់ធំ" },
  "cropProductTable.location.KAMPOT": { en: "Kampot", kh: "កំពត" },
  "cropProductTable.location.KANDAL": { en: "Kandal", kh: "កណ្តាល" },
  "cropProductTable.location.KEP": { en: "Kep", kh: "កែប" },
  "cropProductTable.location.KOH_KONG": { en: "Koh Kong", kh: "កោះកុង" },
  "cropProductTable.location.KRATIE": { en: "Kratie", kh: "ក្រចេះ" },
  "cropProductTable.location.MONDULKIRI": { en: "Mondul Kiri", kh: "មណ្ឌលគិរី" },
  "cropProductTable.location.ODDAR_MEANCHEY": {
    en: "Otdar Meanchey",
    kh: "ឧត្តរមានជ័យ",
  },
  "cropProductTable.location.PAILIN": { en: "Pailin", kh: "ប៉ៃលិន" },
  "cropProductTable.location.PHNOM_PENH": {
    en: "Phnom Penh",
    kh: "រាជធានីភ្នំពេញ",
  },
  "cropProductTable.location.PREAH_SIHANOUK": {
    en: "Sihanoukville",
    kh: "ព្រះសីហនុ",
  },
  "cropProductTable.location.PREAH_VIHEAR": { en: "Preah Vihear", kh: "ព្រះវិហារ" },
  "cropProductTable.location.PREY_VENG": { en: "Prey Veng", kh: "ព្រៃវែង" },
  "cropProductTable.location.PURSAT": { en: "Pursat", kh: "ពោធិ៍សាត់" },
  "cropProductTable.location.RATANAKIRI": { en: "Ratanak Kiri", kh: "រតនគិរី" },
  "cropProductTable.location.SIEM_REAP": { en: "Siemreap", kh: "សៀមរាប" },
  "cropProductTable.location.STUNG_TRENG": { en: "Stung Treng", kh: "ស្ទឹងត្រែង" },
  "cropProductTable.location.SVAY_RIENG": { en: "Svay Rieng", kh: "ស្វាយរៀង" },
  "cropProductTable.location.TAKEO": { en: "Takeo", kh: "តាកែវ" },
  "cropProductTable.location.TBOUNG_KHMUM": {
    en: "Tboung Khmum",
    kh: "ត្បូងឃ្មុំ",
  },
} as const;

function getCropProductTableText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  return (key: string, values?: Record<string, string | number>): string => {
    let text: string =
      CROP_PRODUCT_TABLE_TEXT[key as keyof typeof CROP_PRODUCT_TABLE_TEXT]?.[
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

function getCropProductTableFontScopeClass(language: string) {
  return language === "kh"
    ? "!font-khmer [&_*]:!font-khmer [&_.title]:!font-khmer [&_.sub-title]:!font-khmer [&_.heading]:!font-khmer [&_.table-title]:!font-khmer [&_.description]:!font-khmer [&_.crop-product-listing-text]:!text-[14px] [&_.crop-product-listing-text_*]:!text-[14px]"
    : "!font-thicccboi [&_*]:!font-thicccboi [&_.title]:!font-thicccboi [&_.sub-title]:!font-thicccboi [&_.heading]:!font-thicccboi [&_.table-title]:!font-thicccboi [&_.description]:!font-thicccboi";
}

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
    cropName: {
      LYCHEE: "Lychee",
    },
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

function translateProductTableValue(
  t: ReturnType<typeof getCropProductTableText>,
  namespace: string,
  value?: string,
) {
  if (!value) return "";

  for (const candidate of getTranslationCandidateValues(namespace, value)) {
    const key = `cropProductTable.${namespace}.${candidate}`;
    const translated = t(key);

    if (translated !== key) return translated;
  }

  return value;
}

function translateCropName(
  product: CropProductPost,
  t: ReturnType<typeof getCropProductTableText>,
) {
  return translateProductTableValue(t, "cropName", product.cropName) || product.title || "";
}

function translateCropType(
  cropType: string | undefined,
  t: ReturnType<typeof getCropProductTableText>,
) {
  return translateProductTableValue(t, "cropType", cropType);
}

function translateUnitType(
  unitType: string | undefined,
  t: ReturnType<typeof getCropProductTableText>,
) {
  return translateProductTableValue(t, "unit", unitType) || "KG";
}

function formatProductLocationName(
  location: string | undefined,
  t: ReturnType<typeof getCropProductTableText>,
) {
  const locationParts = (location ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const province = locationParts[locationParts.length - 1];

  if (!province) return t("cropProductTable.cambodia");

  const locationKey = normalizeLocationKey(province);
  const translatedLocation = t(`cropProductTable.location.${locationKey}`);

  if (translatedLocation !== `cropProductTable.location.${locationKey}`) {
    return translatedLocation;
  }

  return formatTitleCase(province);
}

type HeaderSortColumn = "cropName" | "price" | "quantity" | "stockLeft";
type HeaderSortDirection = "asc" | "desc";

function renderCurrencyLabel(currencyCode?: string) {
  if (currencyCode === "USD") return "$";
  if (currencyCode === "KHR") {
    return <span className="align-baseline text-xl leading-none">៛</span>;
  }
  if (currencyCode === "__KHR_DISABLED__") {
    return <span className="align-baseline text-xl leading-none">៛</span>;
  }
  return currencyCode ? `${currencyCode} ` : "";
}

interface CropProductListingsPageProps {
  products: CropProductPost[];
  pagination?: {
    page?: number;
    size?: number;
    totalElements?: number;
    totalPages?: number;
  };
  useEndpointPagination?: boolean;
  initialCropTypes: CropType[];
  initialProvinces: AdministrativeLocation[];
  identityVerification: IdentityVerificationState;
}

export default function CropProductListingsPage({
  products,
  pagination,
  useEndpointPagination = false,
  initialCropTypes,
  initialProvinces,
  identityVerification,
}: CropProductListingsPageProps) {
  const router = useRouter();
  const { t, language } = useI18n();
  const tt = useMemo(() => getCropProductTableText(language), [language]);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";
  const fontScopeClass = getCropProductTableFontScopeClass(language);
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [localProducts, setLocalProducts] = useState(products);
  const [paginationState, setPaginationState] = useState({
    page: pagination?.page ?? 1,
    size: pagination?.size ?? 10,
    totalElements: pagination?.totalElements ?? products.length,
    totalPages: pagination?.totalPages ?? 1,
  });
  const [isPagePending, startPageTransition] = useTransition();
  const isVerifiedIdentity = identityVerification.isVerified;

  const [headerSort, setHeaderSort] = useState<{
    column: HeaderSortColumn;
    direction: HeaderSortDirection;
  } | null>(null);
  const [quantityProduct, setQuantityProduct] = useState<CropProductPost | null>(
    null,
  );
  const [deleteProduct, setDeleteProduct] = useState<CropProductPost | null>(
    null,
  );
  const [nextQuantity, setNextQuantity] = useState("");
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  useEffect(() => {
    if (!quantityProduct) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [quantityProduct]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = paginationState.size;
  const activePage = useEndpointPagination
    ? paginationState.page
    : currentPage;

  const cropTypeOptions = useMemo(
    () => getCropTypeFilterOptions(initialCropTypes),
    [initialCropTypes],
  );
  const regionOptions = useMemo(
    () => getLocationFilterOptions(initialProvinces),
    [initialProvinces],
  );

  const fetchProducts = useCallback(
    (page: number, nextFilters: ProductFilters) => {
      if (!useEndpointPagination) {
        setCurrentPage(page);
        return;
      }

      startPageTransition(async () => {
        const result = await getOwnCropProductsAction(
          page,
          paginationState.size,
          nextFilters,
        );

        if (result.error) {
          showApiToast(
            { success: false, error: result.error },
            {
              successTitle: tt("cropProductTable.toast.productsLoaded"),
              errorTitle: tt("cropProductTable.toast.loadFailed"),
              errorMessage: tt("cropProductTable.toast.loadFailedMessage"),
            },
          );
          return;
        }

        setLocalProducts(result.data);
        setPaginationState({
          page:
            result.pagination?.page && result.pagination.page > 0
              ? result.pagination.page
              : page,
          size: result.pagination?.size ?? paginationState.size,
          totalElements: result.pagination?.totalElements ?? result.data.length,
          totalPages: result.pagination?.totalPages ?? 1,
        });
      });
    },
    [paginationState.size, tt, useEndpointPagination],
  );

  const updateFilter = <Key extends keyof ProductFilters>(
    key: Key,
    value: ProductFilters[Key],
  ) => {
    const nextFilters = { ...filters, [key]: value };

    setFilters(nextFilters);
    setHeaderSort(null);
    fetchProducts(1, nextFilters);
  };

  const handleSearchSubmit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    updateFilter("search", searchValue.trim());
  };

  useEffect(() => {
    const nextSearch = searchValue.trim();

    if (nextSearch === filters.search) return;

    const timeoutId = window.setTimeout(() => {
      const nextFilters = { ...filters, search: nextSearch };

      setFilters(nextFilters);
      setHeaderSort(null);
      fetchProducts(1, nextFilters);
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [fetchProducts, filters, searchValue]);

  const handleDelete = async () => {
    if (!deleteProduct) return;

    const cropProductId =
      deleteProduct.cropProductPostId ||
      deleteProduct.cropProductId ||
      deleteProduct.postId;

    setIsDeletingProduct(true);
    const result = await deleteCropProductAction(cropProductId);
    setIsDeletingProduct(false);

    if (!result.success) {
      showApiToast(result, {
        successTitle: tt("cropProductTable.toast.productDeleted"),
        errorTitle: tt("cropProductTable.toast.deleteFailed"),
        errorMessage: tt("cropProductTable.toast.deleteFailedMessage"),
      });
      return;
    }

    showApiSuccess(
      tt("cropProductTable.toast.productDeleted"),
      tt("cropProductTable.toast.productRemoved"),
    );
    setDeleteProduct(null);
    setLocalProducts((currentProducts) =>
      currentProducts.filter(
        (product) =>
          (product.cropProductPostId || product.cropProductId || product.postId) !==
          cropProductId,
      ),
    );
    router.refresh();
  };

  const openQuantityPopup = (product: CropProductPost) => {
    setQuantityProduct(product);
    setNextQuantity("1");
  };

  const closeQuantityPopup = () => {
    if (isUpdatingQuantity) return;

    setQuantityProduct(null);
  };

  const closeDeletePopup = () => {
    if (isDeletingProduct) return;

    setDeleteProduct(null);
  };

  const requestDelete = (product: CropProductPost) => {
    setDeleteProduct(product);
  };

  const handleQuantityUpdate = async () => {
    if (!quantityProduct) return;

    const quantity = Number(nextQuantity);

    if (!Number.isFinite(quantity) || quantity < 1) {
      showApiToast(
        { success: false, error: tt("cropProductTable.toast.stockAtLeastOne") },
        {
          successTitle: tt("cropProductTable.toast.stockAdded"),
          errorTitle: tt("cropProductTable.toast.invalidStock"),
          errorMessage: tt("cropProductTable.toast.stockAtLeastOne"),
        },
      );
      return;
    }

    const productId =
      quantityProduct.cropProductPostId ||
      quantityProduct.cropProductId ||
      quantityProduct.postId;

    setIsUpdatingQuantity(true);
    const result = await updateCropProductQuantityAction(productId, quantity);
    setIsUpdatingQuantity(false);

    if (!result.success) {
      showApiToast(result, {
        successTitle: tt("cropProductTable.toast.stockAdded"),
        errorTitle: tt("cropProductTable.toast.updateFailed"),
        errorMessage: tt("cropProductTable.toast.addStockFailed"),
      });
      return;
    }

    setLocalProducts((currentProducts) =>
      currentProducts.map((product) =>
        (product.cropProductPostId || product.cropProductId || product.postId) ===
          productId
          ? {
              ...product,
              ...result.data,
              totalQuantity:
                result.data?.totalQuantity ?? (product.totalQuantity ?? 0) + quantity,
              stockLeft:
                result.data?.stockLeft ?? (product.stockLeft ?? 0) + quantity,
            }
          : product,
      ),
    );
    showApiSuccess(
      tt("cropProductTable.toast.stockAdded"),
      tt("cropProductTable.toast.stockUpdated"),
    );
    setQuantityProduct(null);
    router.refresh();
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
    setCurrentPage(1);
  };

  const getPrimaryImageSrc = (imageUrls?: string | string[]) => {
    const image = Array.isArray(imageUrls) ? imageUrls[0] : imageUrls;

    return getFileUrl(image) || PRODUCT_IMAGE_FALLBACK;
  };

  const filteredProducts = useMemo(() => {
    if (!headerSort) return localProducts;

    const sortedProducts = [...localProducts].sort((a, b) => {
      const direction = headerSort.direction === "asc" ? 1 : -1;

      if (headerSort.column === "price") {
        return (a.pricePerUnit - b.pricePerUnit) * direction;
      }

      if (headerSort.column === "quantity") {
        return (a.totalQuantity - b.totalQuantity) * direction;
      }

      if (headerSort.column === "stockLeft") {
        return (a.stockLeft - b.stockLeft) * direction;
      }

      return (a.cropName ?? a.title ?? "").localeCompare(
        b.cropName ?? b.title ?? "",
      ) * direction;
    });

    return sortedProducts;
  }, [localProducts, headerSort]);

  const totalItems = useEndpointPagination
    ? paginationState.totalElements
    : filteredProducts.length;
  const totalPages = useEndpointPagination
    ? Math.max(1, paginationState.totalPages)
    : Math.ceil(filteredProducts.length / itemsPerPage) || 1;

  const paginatedProducts = useMemo(() => {
    if (useEndpointPagination) {
      return filteredProducts;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage, useEndpointPagination]);

  const renderSortHeader = (label: string, column: HeaderSortColumn) => {
    const isActive = headerSort?.column === column;

    return (
      <button
        type="button"
        onClick={() => toggleHeaderSort(column)}
        className={`group flex w-full items-center justify-between gap-1 text-left font-bold uppercase tracking-wider transition-colors hover:text-primary ${
          isActive ? "text-primary" : "text-muted"
        }`}
        aria-label={tt("cropProductTable.sortBy", { label })}
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

  const goToPage = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);

    if (!useEndpointPagination) {
      setCurrentPage(nextPage);
      return;
    }

    if (nextPage === activePage) {
      return;
    }

    fetchProducts(nextPage, filters);
  };

  const resetAllFilters = () => {
    setSearchValue("");
    setFilters(DEFAULT_FILTERS);
    setHeaderSort(null);
    fetchProducts(1, DEFAULT_FILTERS);
  };

  const getLockedMessage = () => {
    const status = String(identityVerification.status ?? "").toUpperCase();

    if (status === "REJECTED") {
      return identityVerification.rejectionReason
        ? tt("cropProductTable.locked.rejectedWithReason", {
            reason: identityVerification.rejectionReason,
          })
        : tt("cropProductTable.locked.rejected");
    }

    if (status === "PENDING") {
      return tt("cropProductTable.locked.pending");
    }

    return tt("cropProductTable.locked.required");
  };

  const explainLockedFeature = () => {
    showApiToast(
      { success: false, error: getLockedMessage() },
      {
        successTitle: tt("cropProductTable.locked.unlocked"),
        errorTitle: tt("cropProductTable.locked.requiredTitle"),
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

  return (
    <div className={`min-h-screen bg-background ${fontClass} ${fontScopeClass}`}>
      <div className="mt-6 min-w-full px-3 sm:px-6">
        <div className="relative z-0 -mt-20 h-70 w-full overflow-hidden rounded-[20px] sm:-mt-25 sm:h-75 sm:rounded-[28px]">
          <Image
            src="/assets/nav-bar/navbar_bg_image.png"
            alt={tt("cropProductTable.heroAlt")}
            fill
            className="object-cover"
            priority
          />

          <div className="relative z-10 mt-10 px-5 py-8 text-white sm:px-8 md:px-20">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>

            <div className="mt-5">
              <h1 className="text-[24px] font-bold uppercase text-white">
                {t("cropProducts.management")}
              </h1>

              <h2 className="mt-1 text-3xl font-bold leading-none text-secondary sm:text-[48px]">
                {t("cropProducts.management")}
              </h2>

              <p className="mt-5 max-w-175 text-sm font-medium sm:text-[15px]">
                {t("cropProducts.managementDescription")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-y-4 overflow-x-hidden p-4 md:p-8">
        <nav className="mb-2 flex w-full min-w-0 items-center gap-2 text-xs text-muted md:text-sm">
          <Link href="/" className="hover:underline">
            {t("crop.common.home")}
          </Link>
          <span>&rsaquo;</span>
          <Link href="/listing-product" className="hover:underline">
            {t("cropProducts.breadcrumb")}
          </Link>
          <span>&rsaquo;</span>
          <span className="font-medium text-secondary-body">
            {t("cropProducts.productManagement")}
          </span>
        </nav>

        <header className="mb-6 flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold tracking-tight text-primary-heading sm:text-2xl md:text-4xl">
            {t("cropProducts.listings")}
          </h1>

          <div className="flex w-full min-w-0 flex-col items-stretch gap-2.5 sm:w-auto sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => goToTrustedFeature("/crop-product-edit")}
              className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md uppercase bg-secondary px-5 py-3 text-center text-sm font-semibold text-primary-heading shadow-xs transition-all hover:brightness-95 active:scale-98 sm:w-auto"
            >
              <CirclePlus className="h-4 w-4 shrink-0" />
              <span>{t("cropProducts.createNew")}</span>
            </button>
          </div>
        </header>

        <section className="grid w-full min-w-0 grid-cols-1  items-end gap-4 lg:grid-cols-12">
          <form
            onSubmit={handleSearchSubmit}
            className="flex w-full min-w-0 flex-col gap-4 lg:col-span-6"
          >
            <label className="text-[14px] font-medium uppercase tracking-wider text-muted sub-title">
              {t("crop.common.search")}
            </label>

            <div className="relative w-full min-w-0">
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={t("crop.common.searchByCropName")}
                className="flex h-12 w-full items-center justify-between rounded-xl border border-light-grey bg-white px-4 shadow-xs transition-all duration-200 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/10 text-left"
              />

              <button
                type="submit"
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:bg-primary/10 hover:text-primary"
                aria-label={t("cropProducts.searchAria")}
              >
                <Search className="h-5 w-5 opacity-70" />
              </button>
            </div>
          </form>

          <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-6">
            {[
              {
                label: t("crop.common.cropType"),
                value: filters.cropType,
                key: "cropType" as const,
                options: cropTypeOptions,
              },
              {
                label: t("crop.common.region"),
                value: filters.region,
                key: "region" as const,
                options: regionOptions,
              },
              {
                label: t("crop.common.status"),
                value: filters.status,
                key: "status" as const,
                options: ["All", "AVAILABLE", "UNAVAILABLE"],
              },
            ].map((filter) => (
              <div key={filter.label} className="w-full min-w-0">
                <CustomFilterSelect
                  label={filter.label}
                  labelClassName={
                    filter.key === "cropType" || filter.key === "region"
                      ? "text-muted"
                      : undefined
                  }
                  options={filter.options}
                  selected={filter.value}
                  onChange={(val) => {
                    updateFilter(filter.key, val);
                  }}
                />
              </div>
            ))}
          </div>

          <button
            onClick={resetAllFilters}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-light-grey bg-gray-100 py-3 text-xs font-semibold uppercase tracking-wider text-dark-grey transition-colors hover:bg-gray-200 lg:hidden"
          >
            <RotateCcw className="h-4 w-4" />
            {t("crop.common.resetFilters")}
          </button>
        </section>

        {/* <div className="hidden justify-end lg:flex">
          <button
            type="button"
            onClick={resetAllFilters}
            disabled={isPagePending}
            className="inline-flex items-center gap-2 rounded-xl border border-light-grey bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-secondary-body shadow-xs transition-colors hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Filters
          </button>
        </div> */}

        <div className="crop-product-listing-text hidden w-full overflow-x-auto rounded-xl border border-light-grey bg-white shadow-xs lg:block">
          <table className="min-w-290 w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-light-grey bg-gray-50/70 text-xs uppercase tracking-wider text-muted">
                <th className="w-14 px-5 py-4 text-center font-bold text-[14px]">{tt("crop.common.no")}</th>
                <th className="w-20 px-4 py-4 font-bold text-[14px]">{tt("crop.common.image")}</th>

                <th className="min-w-46.25 px-4 py-4">
                  {renderSortHeader(tt("crop.common.cropName"), "cropName")}
                </th>

                <th className="min-w-33.75 px-4 py-4 font-bold text-[14px]">
                  {tt("crop.common.region")}
                </th>

                <th className="min-w-35 px-4 py-4">
                  {renderSortHeader(tt("crop.common.price"), "price")}
                </th>

                <th className="min-w-32.5 px-4 py-4">
                  {renderSortHeader(t("cropProducts.qty"), "quantity")}
                </th>

                <th className="min-w-38.75 px-4 py-4">
                  {renderSortHeader(t("cropProducts.stockLeft"), "stockLeft")}
                </th>

                <th className="px-4 py-4 font-bold text-[14px]">{tt("crop.common.status")}</th>
                <th className="w-40 px-6 py-4 text-center font-bold text-[14px]">{tt("crop.common.action")}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-light-grey text-sm font-medium text-dark-grey">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((item, index) => {
                  const detailId =
                    item.cropProductPostId || item.cropProductId || item.postId;
                  const editId =
                    item.cropProductId || item.cropProductPostId || item.postId;
                  const displayCropName = translateCropName(item, tt);
                  const displayCropType = translateCropType(
                    item.cropTypeName ?? item.cropType,
                    tt,
                  );
                  const displayLocation = formatProductLocationName(
                    item.farmerLocation || item.location,
                    tt,
                  );
                  const displayUnit = translateUnitType(item.unitType, tt);

                  return (
                  <tr
                    key={detailId}
                    onClick={() => router.push(`/listing-product/${detailId}`)}
                    className="group cursor-pointer transition-colors hover:bg-gray-50/40"
                  >
                    <td className="px-5 py-4 text-center text-muted">
                      {(activePage - 1) * itemsPerPage + index + 1}
                    </td>

                    <td className="px-4 py-3">
                      <div className="relative h-12 w-12">
                        <Image
                          src={getPrimaryImageSrc(item.imageUrls)}
                          alt={displayCropName || tt("cropProductTable.productAlt")}
                          fill
                          sizes="48px"
                          className="rounded-md border border-light-grey bg-gray-100 object-cover"
                        />
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-base font-bold text-primary-heading transition-colors group-hover:text-primary">
                        {displayCropName}
                      </div>
                      <div className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-muted">
                        {displayCropType}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-secondary-body">
                      {displayLocation}
                    </td>

                    <td className="px-4 py-4 text-base font-bold text-primary">
                      {renderCurrencyLabel(item.currencyCode)}
                      {item.pricePerUnit.toFixed(2)}
                    </td>

                    <td className="px-4 py-4 text-secondary-body">
                      <span className="font-semibold text-primary-heading">
                        {item.totalQuantity}{" "}
                        {displayUnit}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-secondary-body">
                      <div className="grid min-w-42.5 grid-cols-[minmax(68px,1fr)_94px] items-center gap-2">
                        <span className="truncate">
                          {item.stockLeft} {displayUnit}
                        </span>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (isVerifiedIdentity) {
                              openQuantityPopup(item);
                            } else {
                              explainLockedFeature();
                            }
                          }}
                          className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-secondary px-2.5 py-1.5 text-xs font-semibold text-primary-heading transition-colors hover:bg-secondary/90"
                        >
                          <CirclePlus className="h-3.5 w-3.5" />
                          {tt("cropProductTable.addStock")}
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            router.push(`/listing-product/${detailId}`);
                          }}
                          className="rounded-md border border-light-grey bg-white p-2 text-secondary-body transition-colors hover:bg-gray-100 hover:text-dark-grey"
                          aria-label={t("cropProducts.viewAria")}
                          title={t("crop.common.view")}
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            goToTrustedFeature(
                              `/crop-product-edit/${editId}`,
                            );
                          }}
                          className="rounded-md border border-amber-200 bg-amber-50/50 p-2 text-amber-500 transition-colors hover:bg-amber-100"
                          aria-label={t("cropProducts.updateAria")}
                          title={t("crop.common.update")}
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (isVerifiedIdentity) {
                              requestDelete(item);
                            } else {
                              explainLockedFeature();
                            }
                          }}
                          className="rounded-md border border-rose-200 bg-rose-50/50 p-2 text-rose-500 transition-colors hover:bg-rose-100"
                          aria-label={t("cropProducts.deleteAria")}
                          title={t("crop.common.delete")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="bg-gray-50/20 py-12 text-center font-medium text-muted">
                    {t("cropProducts.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="crop-product-listing-text grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
          {paginatedProducts.map((item, index) => {
            const detailId = item.cropProductPostId || item.cropProductId || item.postId;
            const editId = item.cropProductId || item.cropProductPostId || item.postId;
            const displayCropName = translateCropName(item, tt);
            const displayCropType = translateCropType(
              item.cropTypeName ?? item.cropType,
              tt,
            );
            const displayLocation = formatProductLocationName(
              item.farmerLocation || item.location,
              tt,
            );
            const displayUnit = translateUnitType(item.unitType, tt);

            return (
            <div
              key={detailId}
              role="link"
              tabIndex={0}
              onClick={() => router.push(`/listing-product/${detailId}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  router.push(`/listing-product/${detailId}`);
                }
              }}
              className="relative flex w-full min-w-0 cursor-pointer gap-4 rounded-xl border border-light-grey bg-white p-4 shadow-2xs transition-colors hover:bg-gray-50/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <span className="absolute right-3 top-3 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-muted">
                #{(activePage - 1) * itemsPerPage + index + 1}
              </span>

              <div className="relative h-20 w-20 shrink-0">
                <Image
                  src={getPrimaryImageSrc(item.imageUrls)}
                  alt={displayCropName || tt("cropProductTable.productAlt")}
                  fill
                  sizes="80px"
                  className="rounded-md border border-light-grey bg-gray-100 object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <StatusBadge status={item.status} />

                <h3 className="truncate text-base font-bold text-primary-heading">
                  {displayCropName}
                </h3>

                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                  {displayCropType}
                </p>
                <p className="mb-2 truncate text-xs font-semibold text-secondary-body">
                  {displayLocation}
                </p>

                <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 border-t border-gray-100 pt-2 text-xs">
                  <div>
                    <span className="block text-muted">{tt("crop.common.price")}:</span>
                    <span className="text-sm font-bold text-primary">
                      {renderCurrencyLabel(item.currencyCode)}
                      {item.pricePerUnit}
                    </span>
                  </div>

                  <div>
                    <span className="block text-muted">{t("cropProducts.stockLeft")}:</span>
                    <span className="font-semibold text-secondary-body">
                      {item.stockLeft} / {item.totalQuantity} {displayUnit}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-end gap-1.5 border-t border-gray-100 pt-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (isVerifiedIdentity) {
                        openQuantityPopup(item);
                      } else {
                        explainLockedFeature();
                      }
                    }}
                    className="whitespace-nowrap rounded-md bg-secondary px-2.5 py-1.5 text-xs font-semibold text-primary-heading"
                  >
                    {tt("cropProductTable.addStock")}
                  </button>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      router.push(`/listing-product/${detailId}`);
                    }}
                    className="rounded-md border border-light-grey px-2.5 py-1.5 text-xs font-semibold text-secondary-body"
                  >
                    {t("crop.common.view")}
                  </button>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      goToTrustedFeature(
                              `/crop-product-edit/${editId}`,
                      );
                    }}
                    className="rounded-md border border-amber-200 bg-amber-50/50 px-2.5 py-1.5 text-xs font-semibold text-amber-600"
                  >
                    {t("crop.common.edit")}
                  </button>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (isVerifiedIdentity) {
                        requestDelete(item);
                      } else {
                        explainLockedFeature();
                      }
                    }}
                    className="rounded-md border border-rose-200 bg-rose-50/50 px-2.5 py-1.5 text-xs font-semibold text-rose-600"
                  >
                    {t("crop.common.delete")}
                  </button>
                </div>
              </div>
            </div>
          );
          })}
        </div>

        <footer className="mt-4 border-t border-light-grey/60 pt-4">
          <PaginationComponent
            currentPage={activePage}
            totalItems={totalItems}
            pageSize={itemsPerPage}
            onPageChange={goToPage}
            pageBase={1}
            size="sm"
            className="border-0 shadow-none"
            disabled={isPagePending}
          />
        </footer>
      </div>

      <QuantityUpdatePopup
        product={quantityProduct}
        quantity={nextQuantity}
        isUpdating={isUpdatingQuantity}
        onQuantityChange={setNextQuantity}
        onClose={closeQuantityPopup}
        onConfirm={handleQuantityUpdate}
        t={t}
        tt={tt}
        fontClass={fontClass}
        fontScopeClass={fontScopeClass}
      />
      <DeleteProductPopup
        product={deleteProduct}
        isDeleting={isDeletingProduct}
        onClose={closeDeletePopup}
        onConfirm={handleDelete}
        t={t}
        tt={tt}
        fontClass={fontClass}
        fontScopeClass={fontScopeClass}
      />
    </div>
  );
}

function QuantityUpdatePopup({
  product,
  quantity,
  isUpdating,
  onQuantityChange,
  onClose,
  onConfirm,
  t,
  tt,
  fontClass,
  fontScopeClass,
}: {
  product: CropProductPost | null;
  quantity: string;
  isUpdating: boolean;
  onQuantityChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  t: (key: string, params?: Record<string, string>) => string;
  tt: (key: string, values?: Record<string, string | number>) => string;
  fontClass: string;
  fontScopeClass: string;
}) {
  if (!product) return null;

  const currentStock = product.stockLeft ?? 0;
  const unit = translateUnitType(product.unitType, tt);
  const displayCropName = translateCropName(product, tt);
  const addQuantity = Number(quantity);
  const canSubmit = Number.isFinite(addQuantity) && addQuantity >= 1;

  return (
    <div
      className={`fixed inset-0 z-10000 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm ${fontClass} ${fontScopeClass}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-product-title"
    >
      <div className="relative w-full max-w-110 overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-2xl shadow-slate-900/20">
        <button
          type="button"
          onClick={onClose}
          disabled={isUpdating}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={tt("cropProductTable.closeQuantity")}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 pb-6 pt-7">
          <div className="mb-6 pr-10">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                <Package className="h-3.5 w-3.5" />
                {tt("cropProductTable.addStock")}
              </p>
              <h2
                id="quantity-update-title"
                className="mt-1 truncate text-2xl font-black text-primary-heading"
              >
                {displayCropName}
              </h2>
              <p className="mt-1 text-sm font-medium text-secondary-body">
                {tt("cropProductTable.currentQuantity", {
                  quantity: String(currentStock),
                  unit,
                })}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted">
              {tt("cropProductTable.stockToAdd")}
            </label>
            <div className="flex overflow-hidden rounded-2xl border border-light-grey bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9.]*"
                min="1"
                step="1"
                value={quantity}
                onChange={(event) => onQuantityChange(event.target.value)}
                className="h-13 min-w-0 flex-1 px-4 text-base font-bold text-primary-heading outline-none"
              />
              <span className="flex h-13 items-center border-l border-light-grey px-4 text-sm font-bold text-muted">
                {unit}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("crop.common.cancel")}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isUpdating || !canSubmit || quantity === ""}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("crop.common.updating")}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {tt("cropProductTable.addStock")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeleteProductPopup({
  product,
  isDeleting,
  onClose,
  onConfirm,
  t,
  tt,
  fontClass,
  fontScopeClass,
}: {
  product: CropProductPost | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
  t: (key: string, params?: Record<string, string>) => string;
  tt: (key: string, values?: Record<string, string | number>) => string;
  fontClass: string;
  fontScopeClass: string;
}) {
  if (!product) return null;

  const displayCropName = translateCropName(product, tt);

  return (
    <div
      className={`fixed inset-0 z-10000 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm ${fontClass} ${fontScopeClass}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-product-title"
    >
      <div className="relative w-full max-w-110 overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-2xl shadow-slate-900/20">
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={t("cropProducts.deleteAria")}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 pb-6 pt-7">
          <div className="mb-6 pr-10">
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-rose-600">
              <Trash2 className="h-3.5 w-3.5" />
              {tt("cropProductTable.deleteProduct")}
            </p>
            <h2
              id="delete-product-title"
              className="mt-1 truncate text-2xl font-black text-primary-heading"
            >
              {displayCropName}
            </h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-secondary-body">
              {tt("cropProductTable.deleteDescription")}
            </p>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("crop.common.cancel")}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {tt("cropProductTable.deleting")}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  {t("crop.common.delete")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
