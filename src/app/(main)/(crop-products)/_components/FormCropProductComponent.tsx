"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Controller,
  useForm,
  useWatch,
  type FieldErrors,
  type Path,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronRight, HelpCircle, ImagePlus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  cropProductSchema,
  type CropProductFormInput,
  type CropProductFormValues,
} from "../../../../lib/schema";

import type { CropProductPost } from "@/types/crop-product";
import { Crop, CropType } from "@/types/cropType";

import {
  createCropProductAction,
  updateCropProductAction,
} from "@/action/crop-product.action";
import { getUsdToKhrRateAction } from "@/action/currency-rate.action";

import { deleteFilesAction, uploadAttachmentAction } from "@/action/upload.action";
import { showApiError, showApiSuccess, showApiToast } from "@/lib/apiToast";
import { useDismissibleDropdown } from "@/hooks/useDismissibleDropdown";
import { getFileUrl, getStoredFileName } from "@/utils/getFileUrl";
import { useI18n } from "@/lib/i18n/I18nContext";
import {
  convertMarketCurrencyAmount,
  convertMarketPricePerUnit,
  convertMarketQuantity,
  roundMarketCurrency,
  roundMarketQuantity,
  toMarketUnit,
  type MarketCurrency,
  type MarketUnit,
} from "@/utils/unitCurrencyConversion";

type ImageItem = {
  previewUrl: string;
  imageUrl?: string;
  file?: File;
};

type Props = {
  product?: CropProductPost;
  crops: Crop[];
  cropTypes: CropType[];
};

type SelectOption = {
  value: string;
  label: string;
};

const FALLBACK_PRODUCT_IMAGE = "/assets/image/no-product.jpg";

const PRODUCT_FORM_TEXT = {
  "productForm.home": { en: "Home", kh: "ទំព័រដើម" },
  "productForm.cropProducts": { en: "Crop Products", kh: "ផលិតផលដំណាំ" },
  "productForm.management": { en: "Management", kh: "ការគ្រប់គ្រង" },
  "productForm.editCropProduct": { en: "Edit Crop Product", kh: "កែប្រែផលិតផលដំណាំ" },
  "productForm.createNewListing": { en: "Create New Listing", kh: "បង្កើតបញ្ជីថ្មី" },
  "productForm.editCropListing": { en: "Edit Crop Listing", kh: "កែប្រែបញ្ជីដំណាំ" },
  "productForm.createNewCropListing": { en: "Create New Crop Listing", kh: "បង្កើតបញ្ជីដំណាំថ្មី" },
  "productForm.description": { en: "Expand your Cambodian produce to the digital marketplace.", kh: "ពង្រីកផលិតផលកម្ពុជារបស់អ្នកទៅកាន់ទីផ្សារឌីជីថល។" },
  "productForm.productMedia": { en: "Product Media", kh: "មេឌៀផលិតផល" },
  "productForm.primaryPreview": { en: "Primary preview", kh: "មើលជាមុនចម្បង" },
  "productForm.preview": { en: "Preview", kh: "មើលជាមុន" },
  "productForm.addPhotos": { en: "Add Photos", kh: "បន្ថែមរូបថត" },
  "productForm.uploadHint": { en: "Drag and drop PNG/JPG here or click to upload. Maximum 5 images.", kh: "អូស និងទម្លាក់ PNG/JPG នៅទីនេះ ឬចុចដើម្បីបង្ហោះ។ អតិបរមា ៥ រូបភាព។" },
  "productForm.proTip": { en: "Pro Tip", kh: "គន្លឹះ" },
  "productForm.proTipDesc": { en: "Listings with high-quality photos and detailed descriptions receive more buyer inquiries.", kh: "បញ្ជីដែលមានរូបថតគុណភាពខ្ពស់ និងការពិពណ៌នាលម្អិត ទទួលបានការសួរពីអ្នកទិញច្រើនជាងមុន។" },
  "productForm.basicInformation": { en: "Basic Information", kh: "ព័ត៌មានមូលដ្ឋាន" },
  "productForm.title": { en: "Title", kh: "ចំណងជើង" },
  "productForm.titlePlaceholder": { en: "e.g. Premium Kampot Durian Bulk Sale", kh: "ឧ. ការលក់ទុរេនកំពតគុណភាពខ្ពស់ចំនួនច្រើន" },
  "productForm.cropType": { en: "Crop Type", kh: "ប្រភេទដំណាំ" },
  "productForm.cropName": { en: "Crop Name", kh: "ឈ្មោះដំណាំ" },
  "productForm.all": { en: "All", kh: "ទាំងអស់" },
  "productForm.selectCrop": { en: "Select crop", kh: "ជ្រើសរើសដំណាំ" },
  "productForm.pricingInventory": { en: "Pricing & Inventory", kh: "តម្លៃ និងស្តុក" },
  "productForm.totalQuantity": { en: "Total Quantity", kh: "បរិមាណសរុប" },
  "productForm.unitType": { en: "Unit Type", kh: "ប្រភេទឯកតា" },
  "productForm.unit.KG": { en: "KG", kh: "គីឡូក្រាម" },
  "productForm.unit.TON": { en: "TON", kh: "តោន" },
  "productForm.unit.TONS": { en: "TON", kh: "តោន" },
  "productForm.pricePerUnit": { en: "Price Per Unit", kh: "តម្លៃក្នុងមួយឯកតា" },
  "productForm.currency": { en: "Currency", kh: "រូបិយប័ណ្ណ" },
  "productForm.details": { en: "Details", kh: "លម្អិត" },
  "productForm.optional": { en: "(optional)", kh: "(មិនចាំបាច់)" },
  "productForm.descPlaceholder": { en: "Describe product characteristics...", kh: "ពិពណ៌នាអំពីលក្ខណៈផលិតផល..." },
  "productForm.cancel": { en: "Cancel", kh: "បោះបង់" },
  "productForm.saving": { en: "Saving...", kh: "កំពុងរក្សាទុក..." },
  "productForm.updateProduct": { en: "Update Product", kh: "កែប្រែផលិតផល" },
  "productForm.createProduct": { en: "Create Product", kh: "បង្កើតផលិតផល" },
  "productForm.heroBackground": { en: "Hero Background", kh: "ផ្ទៃខាងក្រោយ Hero" },
  "productForm.cropType.Rice Crops": { en: "Rice Crops", kh: "ដំណាំស្រូវ" },
  "productForm.cropType.Fruits": { en: "Fruits", kh: "ផ្លែឈើ" },
  "productForm.cropType.Fruit": { en: "Fruit", kh: "ផ្លែឈើ" },
  "productForm.cropType.Vegetables": { en: "Vegetables", kh: "បន្លែ" },
  "productForm.cropType.Vegetable": { en: "Vegetable", kh: "បន្លែ" },
  "productForm.cropType.Grain": { en: "Grain", kh: "ធញ្ញជាតិ" },
  "productForm.cropType.Grains": { en: "Grains", kh: "ធញ្ញជាតិ" },
  "productForm.cropType.Fiber Crop": { en: "Fiber Crop", kh: "ដំណាំសរសៃ" },
  "productForm.cropType.Fiber Crops": { en: "Fiber Crops", kh: "ដំណាំសរសៃ" },
  "productForm.cropType.Root Crops": { en: "Root Crops", kh: "ដំណាំមើម" },
  "productForm.cropType.Industrial Crops": { en: "Industrial Crops", kh: "ដំណាំឧស្សាហកម្ម" },
  "productForm.cropType.Herbs": { en: "Herbs", kh: "រុក្ខជាតិឱសថ" },
  "productForm.cropType.Spices": { en: "Spices", kh: "គ្រឿងទេស" },
  "productForm.cropType.Nuts": { en: "Nuts", kh: "គ្រាប់ធញ្ញជាតិ" },
  "productForm.cropType.Legumes": { en: "Legumes", kh: "ដំណាំសណ្តែក" },
  "productForm.cropName.Cotton": { en: "Cotton", kh: "កប្បាស" },
  "productForm.cropName.Orange": { en: "Orange", kh: "ក្រូច" },
  "productForm.cropName.Watermelon": { en: "Watermelon", kh: "ផ្លែឪឡឹក" },
  "productForm.cropName.Strawberry": { en: "Strawberry", kh: "ផ្លែស្ត្របឺរី" },
  "productForm.cropName.Grape": { en: "Grape", kh: "ផ្លែទំពាំងបាយជូរ" },
  "productForm.cropName.Mango": { en: "Mango", kh: "ផ្លែស្វាយ" },
  "productForm.cropName.Durian": { en: "Durian", kh: "ផ្លែធុរេន" },
  "productForm.cropName.Keo Romeat Mango": { en: "Keo Romeat Mango", kh: "ស្វាយកែវរមៀត" },
  "productForm.cropName.Avocado": { en: "Avocado", kh: "ផ្លែប័រ" },
  "productForm.cropName.Lychee": { en: "Lychee", kh: "ផ្លៃគូលែន" },
  "productForm.cropName.Jackfruit": { en: "Jackfruit", kh: "ផ្លែខ្នុរ" },
  "productForm.cropName.Banana": { en: "Banana", kh: "ផ្លែចេក" },
  "productForm.cropName.Star Fruit": { en: "Star Fruit", kh: "ផ្លែស្ពឺ" },
  "productForm.cropName.Apple": { en: "Apple", kh: "ផ្លែប៉ោម" },
  "productForm.cropName.Wheat": { en: "Wheat", kh: "ស្រូវសាលី" },
  "productForm.cropName.Rice": { en: "Rice", kh: "ស្រូវ" },
  "productForm.cropName.Oat": { en: "Oat", kh: "ស្រូវអូត" },
  "productForm.cropName.Black Pepper": { en: "Black Pepper", kh: "ម្រេច" },
  "productForm.cropName.Yellow Maize": { en: "Yellow Maize", kh: "ពោតលឿង" },
  "productForm.cropName.Soybean": { en: "Soybean", kh: "សណ្តែកសៀង" },
  "productForm.cropName.Sugarcane": { en: "Sugarcane", kh: "អំពៅ" },
  "productForm.cropName.Rubber": { en: "Rubber", kh: "កៅស៊ូ" },
  "productForm.cropName.Arabica Coffee": { en: "Arabica Coffee", kh: "កាហ្វេអារ៉ាប៊ីកា" },
  "productForm.cropName.Jasmine Rice": { en: "Jasmine Rice", kh: "ស្រូវផ្កាម្លិះ" },
  "productForm.cropName.Brown Rice": { en: "Brown Rice", kh: "អង្ករសម្រូប" },
  "productForm.cropName.Sen Kra Ob Rice": { en: "Sen Kra Ob Rice", kh: "ស្រូវសែនក្រអូប" },
  "productForm.cropName.Phka Rumduol Rice": { en: "Phka Rumduol Rice", kh: "ស្រូវផ្ការំដួល" },
  "productForm.cropName.Cassava": { en: "Cassava", kh: "ដំឡូងមី" },
  "productForm.cropName.Taro": { en: "Taro", kh: "ត្រាវ" },
  "productForm.cropName.Garlic": { en: "Garlic", kh: "ខ្ទឹមស" },
  "productForm.cropName.Turmeric": { en: "Turmeric", kh: "រមៀត" },
  "productForm.error.titleMin": { en: "Please enter a product title with at least 5 characters.", kh: "សូមបញ្ចូលចំណងជើងផលិតផលយ៉ាងហោចណាស់ 5 តួអក្សរ។" },
  "productForm.error.titleMax": { en: "Title must not exceed 255 characters.", kh: "ចំណងជើងមិនត្រូវលើសពី 255 តួអក្សរទេ។" },
  "productForm.error.titlePattern": { en: "Title must contain only letters, numbers, and spaces.", kh: "ចំណងជើងត្រូវមានតែអក្សរ លេខ និងចន្លោះប៉ុណ្ណោះ។" },
  "productForm.error.cropRequired": { en: "Please select a crop type first, then choose a crop name.", kh: "សូមជ្រើសរើសប្រភេទដំណាំជាមុន បន្ទាប់មកជ្រើសរើសឈ្មោះដំណាំ។" },
  "productForm.error.numberOnly": { en: "Please input number only", kh: "សូមបញ្ចូលតែលេខប៉ុណ្ណោះ។" },
  "productForm.error.quantityPositive": { en: "Please enter a quantity greater than 0.", kh: "សូមបញ្ចូលបរិមាណធំជាង 0។" },
  "productForm.error.pricePositive": { en: "Please enter a price greater than 0.", kh: "សូមបញ្ចូលតម្លៃធំជាង 0។" },
  "productForm.error.descriptionMax": { en: "Description must not exceed 500 characters.", kh: "ការពិពណ៌នាមិនត្រូវលើសពី 500 តួអក្សរទេ។" },
  "productForm.error.imageRequired": { en: "Please upload at least one product photo.", kh: "សូមបង្ហោះរូបថតផលិតផលយ៉ាងហោចណាស់មួយ។" },
  "productForm.error.khrDivisible": { en: "Price in KHR must be divisible by 100", kh: "តម្លៃជារៀលត្រូវតែចែកដាច់នឹង 100។" },
  "productForm.error.tonDecimal": { en: "Quantity must have at most 2 decimal places for TON", kh: "បរិមាណជាតោនត្រូវមានខ្ទង់ទសភាគយ៉ាងច្រើន 2 ខ្ទង់។" },
  "productForm.toast.fileRejected": { en: 'File "{fileName}" is rejected. Only PNG and JPG formats are permitted.', kh: 'ឯកសារ "{fileName}" ត្រូវបានបដិសេធ។ អនុញ្ញាតតែទ្រង់ទ្រាយ PNG និង JPG ប៉ុណ្ណោះ។' },
  "productForm.toast.imageUploaded": { en: "Image uploaded", kh: "បានបង្ហោះរូបភាព" },
  "productForm.toast.uploadFailed": { en: "Upload failed", kh: "ការបង្ហោះបរាជ័យ" },
  "productForm.toast.uploadFailedMessage": { en: "Failed to upload product image.", kh: "មិនអាចបង្ហោះរូបភាពផលិតផលបានទេ។" },
  "productForm.toast.productSaved": { en: "Crop product saved", kh: "បានរក្សាទុកផលិតផលដំណាំ" },
  "productForm.toast.saveFailed": { en: "Save failed", kh: "ការរក្សាទុកបរាជ័យ" },
  "productForm.toast.saveFailedMessage": { en: "Failed to save crop product.", kh: "មិនអាចរក្សាទុកផលិតផលដំណាំបានទេ។" },
  "productForm.toast.productUpdated": { en: "Crop product updated", kh: "បានកែប្រែផលិតផលដំណាំ" },
  "productForm.toast.productCreated": { en: "Crop product created", kh: "បានបង្កើតផលិតផលដំណាំ" },
  "productForm.toast.productUpdatedMessage": { en: "Your product listing has been updated successfully.", kh: "បញ្ជីផលិតផលរបស់អ្នកត្រូវបានកែប្រែដោយជោគជ័យ។" },
  "productForm.toast.productCreatedMessage": { en: "Your product listing has been created successfully.", kh: "បញ្ជីផលិតផលរបស់អ្នកត្រូវបានបង្កើតដោយជោគជ័យ។" },
  "productForm.toast.submitFailed": { en: "Failed to submit crop product.", kh: "មិនអាចដាក់ស្នើផលិតផលដំណាំបានទេ។" },
} as const;

function getProductFormText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  return (key: string) =>
    PRODUCT_FORM_TEXT[key as keyof typeof PRODUCT_FORM_TEXT]?.[lang] ?? key;
}

function formatProductFormText(
  t: (key: string) => string,
  key: string,
  values?: Record<string, string | number>,
) {
  let text = t(key);

  if (values) {
    Object.entries(values).forEach(([name, value]) => {
      text = text.replaceAll(`{${name}}`, String(value));
    });
  }

  return text;
}

function translateProductFormValue(
  t: (key: string) => string,
  prefix: "cropName" | "cropType",
  value?: string,
) {
  if (!value) return "";

  const key = `productForm.${prefix}.${value}`;
  const translated = t(key);

  return translated === key ? value : translated;
}

function translateProductFormUnit(t: (key: string) => string, unit?: string) {
  if (!unit) return "";

  const key = `productForm.unit.${unit}`;
  const translated = t(key);

  return translated === key ? unit : translated;
}

function translateProductFormError(
  t: (key: string) => string,
  message?: string,
) {
  if (!message) return "";

  const errorKeyByMessage: Record<string, string> = {
    "Please enter a product title with at least 5 characters.": "productForm.error.titleMin",
    "Title must not exceed 255 characters.": "productForm.error.titleMax",
    "Title must contain only letters, numbers, and spaces.": "productForm.error.titlePattern",
    "Please select a crop type first, then choose a crop name.": "productForm.error.cropRequired",
    "Please input number only": "productForm.error.numberOnly",
    "Please enter a quantity greater than 0.": "productForm.error.quantityPositive",
    "Please enter a price greater than 0.": "productForm.error.pricePositive",
    "Description must not exceed 500 characters.": "productForm.error.descriptionMax",
    "Please upload at least one product photo.": "productForm.error.imageRequired",
    "Price in KHR must be divisible by 100": "productForm.error.khrDivisible",
    "Quantity must have at most 2 decimal places for TON": "productForm.error.tonDecimal",
  };
  const key = errorKeyByMessage[message];

  return key ? t(key) : message;
}

function getProductFormFontScopeClass(language: string) {
  return language === "kh"
    ? "[&_*]:!font-khmer [&_.title]:!font-khmer [&_.sub-title]:!font-khmer [&_.heading]:!font-khmer [&_.description]:!font-khmer"
    : "";
}

function normalizeSelectOption(option: string | SelectOption): SelectOption {
  return typeof option === "string" ? { value: option, label: option } : option;
}

function getImageFileName(value: string) {
  return getStoredFileName(value) || value;
}

// Local previews (newly picked files) resolve directly; stored references are
// resolved to the bucket URL the same way the detail page does (via getFileUrl).
function resolvePreviewUrl(value: string) {
  if (value.startsWith("blob:") || value.startsWith("data:")) return value;
  return getFileUrl(value) || value;
}

function isLocalPreview(value: string) {
  return value.startsWith("blob:") || value.startsWith("data:");
}

// Renders previews through next/image (same optimizer path as the detail page),
// so stored bucket images load server-side instead of being fetched directly by
// the browser. Local blob/data previews skip optimization.
function PreviewImage({
  src,
  alt,
  className,
  onError,
}: {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 420px"
      unoptimized={isLocalPreview(src)}
      className={className}
      onError={onError}
    />
  );
}

function getProductImageSources(product?: CropProductPost) {
  if (!product) return [];

  const source = product as CropProductPost & {
    images?: string | string[];
    post?: CropProductPost["post"] & {
      imageUrls?: string | string[];
      thumbnailUrl?: string | string[];
    };
  };

  const sources = [
    source.imageUrls,
    source.thumbnailUrl,
    source.images,
    source.post?.images,
    source.post?.imageUrls,
    source.post?.thumbnailUrl,
  ].flatMap((value) => (Array.isArray(value) ? value : value ? [value] : []));

  return Array.from(
    new Set(
      sources
        .filter((url) => url !== FALLBACK_PRODUCT_IMAGE)
        .map((url) => url.trim())
        .filter(Boolean),
    ),
  );
}

function buildImageItems(imageUrls?: string | string[]) {
  const urls = Array.isArray(imageUrls) ? imageUrls : imageUrls ? [imageUrls] : [];

  return urls
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => ({
      previewUrl: resolvePreviewUrl(url),
      imageUrl: url,
    }));
}

function getFormImageValues(images: ImageItem[]) {
  return images
    .map((image) => image.imageUrl ?? image.previewUrl)
    .map(getImageFileName)
    .filter(Boolean);
}

function getRemovedImageFileNames(originalFileNames: string[], nextFileNames: string[]) {
  const nextSet = new Set(nextFileNames);

  return originalFileNames.filter((fileName) => fileName && !nextSet.has(fileName));
}

function getCropsFromCropTypes(cropTypes: CropType[]) {
  return cropTypes.flatMap((cropType) =>
    (cropType.crops ?? []).map((crop) => ({
      ...crop,
      cropTypeName: crop.cropTypeName ?? cropType.typeName,
    })),
  );
}

function CustomFilterSelect({
  label,
  options,
  selected,
  onChange,
  disabled = false,
  placeholder,
}: {
  label: string;
  options: Array<string | SelectOption>;
  selected: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeDropdown = useCallback(() => setIsOpen(false), []);

  useDismissibleDropdown({
    open: isOpen,
    containerRef,
    onClose: closeDropdown,
  });

  const normalizedOptions = options.map(normalizeSelectOption);
  const selectedOption = normalizedOptions.find(
    (option) => option.value === selected,
  );
  const selectedLabel =
    placeholder && (!selected || selected === "All" || selected === "Select crop")
      ? placeholder
      : selectedOption?.label ?? selected;

  return (
    <div ref={containerRef} className="relative flex w-full flex-col gap-1.5">
      <label className="text-[14px] font-medium uppercase tracking-wider text-primary">
        {label}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-12 w-full items-center justify-between rounded-xl border border-light-grey px-4 text-left shadow-xs ${
          disabled
            ? "cursor-not-allowed bg-gray-100 text-gray-400"
            : "bg-white hover:border-primary/40"
        }`}
      >
        <span
          className={`truncate text-[14px] font-medium ${
            disabled ? "text-gray-400" : "text-dark-grey"
          }`}
        >
          {selectedLabel}
        </span>

        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            disabled ? "text-gray-400" : "text-muted"
          } ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute left-0 top-18.5 z-50 w-full rounded-xl border border-light-grey bg-white p-1.5 shadow-xl">
          <div className="max-h-60 overflow-y-auto">
            {normalizedOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
                  selected === option.value
                    ? "bg-primary/10 text-primary"
                    : "text-secondary-body hover:bg-light-grey/50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateCropListingForm({
  product,
  crops,
  cropTypes,
}: Props) {
 
  const router = useRouter();
  const { language } = useI18n();
  const t = getProductFormText(language);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";
  const fontScopeClass = getProductFormFontScopeClass(language);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = Boolean(product);

  const allCrops = crops.length > 0 ? crops : getCropsFromCropTypes(cropTypes);
  const initialImageSources = getProductImageSources(product);

  const [imageItems, setImageItems] = useState<ImageItem[]>(() =>
    buildImageItems(initialImageSources),
  );
  const [originalImageFileNames] = useState<string[]>(() =>
    getFormImageValues(buildImageItems(initialImageSources)),
  );
  const [failedImagePreviews, setFailedImagePreviews] = useState<Set<string>>(
    () => new Set(),
  );
  const [isDragging, setIsDragging] = useState(false);
  const lastSyncedImageKeyRef = useRef("");

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<CropProductFormInput, unknown, CropProductFormValues>({
    resolver: zodResolver(cropProductSchema),
    defaultValues: {
      title: product?.title ?? "",
      cropType: product?.cropTypeName ?? product?.cropType ?? "All",
      cropName: product?.cropName ?? "Select crop",
      cropId: product?.cropId ?? "",
      totalQuantity: product?.totalQuantity,
      unitType: product?.unitType ?? "KG",
      pricePerUnit: product?.pricePerUnit,
      currencyCode:
        product?.currencyCode === "USD" || product?.currencyCode === "KHR"
          ? product.currencyCode
          : "KHR",
      description: product?.description ?? "",
      imageUrls: getFormImageValues(buildImageItems(initialImageSources)),
    },
  });

  const watchedUnitType = useWatch({ control, name: "unitType" });
  const watchedCurrencyCode = useWatch({ control, name: "currencyCode" });
  const watchedCropType = useWatch({ control, name: "cropType" });
  const rateRequestRef = useRef<Promise<number> | null>(null);

  const selectedCropType = cropTypes.find(
    (cropType) => cropType.typeName === watchedCropType,
  );

  const cropOptions =
    watchedCropType === "All" || !selectedCropType
      ? []
      : allCrops.filter(
          (crop) => crop.cropTypeId === selectedCropType.cropTypeId,
        );

  const isCropNameDisabled = watchedCropType === "All" || !selectedCropType;
  const cropTypeOptions: SelectOption[] = [
    { value: "All", label: t("productForm.all") },
    ...cropTypes.map((cropType) => ({
      value: cropType.typeName,
      label: translateProductFormValue(t, "cropType", cropType.typeName),
    })),
  ];
  const cropNameOptions: SelectOption[] = cropOptions.map((crop) => ({
    value: crop.cropName,
    label: translateProductFormValue(t, "cropName", crop.cropName),
  }));

  useEffect(() => {
    if (!product?.cropId) return;

    const selectedCrop = allCrops.find((crop) => crop.cropId === product.cropId);
    if (!selectedCrop) return;

    setValue("cropId", selectedCrop.cropId);
    setValue("cropName", selectedCrop.cropName);
    setValue("cropType", selectedCrop.cropTypeName ?? product.cropTypeName ?? "All");
  }, [product, allCrops, setValue]);

  useEffect(() => {
    const nextImageKey = initialImageSources.join("|");

    if (!nextImageKey || nextImageKey === lastSyncedImageKeyRef.current) {
      return;
    }

    const nextImageItems = buildImageItems(initialImageSources);

    lastSyncedImageKeyRef.current = nextImageKey;
    setFailedImagePreviews(new Set());
    setImageItems(nextImageItems);
    setValue("imageUrls", getFormImageValues(nextImageItems), {
      shouldValidate: true,
    });
  }, [initialImageSources, setValue]);

  function handleCropTypeChange(value: string) {
    setValue("cropType", value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    setValue("cropName", "Select crop", {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    setValue("cropId", "", {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  function handleCropNameChange(value: string) {
    setValue("cropName", value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    const crop = cropOptions.find((item) => item.cropName === value);

    setValue("cropId", crop?.cropId ?? "", {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  async function getKhrPerUsd() {
    rateRequestRef.current ??= getUsdToKhrRateAction();

    return rateRequestRef.current;
  }

  function handleUnitTypeChange(nextUnit: MarketUnit) {
    const currentUnit = toMarketUnit(getValues("unitType"));
    if (nextUnit === currentUnit) return;

    const quantity = Number(getValues("totalQuantity") ?? 0);
    const pricePerUnit = Number(getValues("pricePerUnit") ?? 0);
    const currencyCode = getValues("currencyCode") as MarketCurrency;

    setValue("unitType", nextUnit, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setValue(
      "totalQuantity",
      roundMarketQuantity(convertMarketQuantity(quantity, currentUnit, nextUnit)),
      { shouldDirty: true, shouldTouch: true, shouldValidate: true },
    );
    setValue(
      "pricePerUnit",
      roundMarketCurrency(
        convertMarketPricePerUnit(pricePerUnit, currentUnit, nextUnit),
        currencyCode,
      ),
      { shouldDirty: true, shouldTouch: true, shouldValidate: true },
    );
  }

  async function handleCurrencyCodeChange(nextCurrency: MarketCurrency) {
    const currentCurrency = getValues("currencyCode") as MarketCurrency;
    if (nextCurrency === currentCurrency) return;

    const pricePerUnit = Number(getValues("pricePerUnit") ?? 0);
    const khrPerUsd = await getKhrPerUsd();

    setValue("currencyCode", nextCurrency, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setValue(
      "pricePerUnit",
      roundMarketCurrency(
        convertMarketCurrencyAmount(
          pricePerUnit,
          currentCurrency,
          nextCurrency,
          khrPerUsd,
        ),
        nextCurrency,
      ),
      { shouldDirty: true, shouldTouch: true, shouldValidate: true },
    );
  }

  function processFiles(files: FileList) {
    const validFiles = Array.from(files).filter((file) => {
      const isValid = file.type === "image/jpeg" || file.type === "image/png";

      if (!isValid) {
        showApiError(
          new Error(
            formatProductFormText(t, "productForm.toast.fileRejected", {
              fileName: file.name,
            }),
          ),
        );
      }

      return isValid;
    });

    if (validFiles.length === 0) return;

    const newImages: ImageItem[] = validFiles.map((file) => ({
      previewUrl: URL.createObjectURL(file),
      file,
    }));

    const updatedImages = [...imageItems, ...newImages].slice(0, 5);

    setFailedImagePreviews((current) => {
      const next = new Set(current);
      newImages.forEach((image) => next.delete(image.previewUrl));
      return next;
    });
    setImageItems(updatedImages);
    setValue("imageUrls", getFormImageValues(updatedImages), {
      shouldValidate: true,
    });
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      processFiles(event.target.files);
    }
  }

  function removeImage(index: number) {
    const removedImage = imageItems[index];
    const updatedImages = imageItems.filter((_, itemIndex) => itemIndex !== index);

    if (removedImage?.file) {
      URL.revokeObjectURL(removedImage.previewUrl);
    }

    setImageItems(updatedImages);
    setFailedImagePreviews((current) => {
      const next = new Set(current);
      next.delete(removedImage?.previewUrl ?? "");
      return next;
    });
    setValue("imageUrls", getFormImageValues(updatedImages), {
      shouldValidate: true,
    });
  }

  function getPreviewSrc(image: ImageItem) {
    return failedImagePreviews.has(image.previewUrl)
      ? FALLBACK_PRODUCT_IMAGE
      : image.previewUrl;
  }

  function markPreviewFailed(image: ImageItem) {
    setFailedImagePreviews((current) => {
      const next = new Set(current);
      next.add(image.previewUrl);
      return next;
    });
  }

  async function onSubmit(data: CropProductFormValues) {
    try {
      const uploadedUrls: string[] = [];

      for (const image of imageItems) {
        if (image.imageUrl) {
          uploadedUrls.push(getImageFileName(image.imageUrl));
          continue;
        }

        if (!image.file) continue;

        const formData = new FormData();
        formData.append("file", image.file);

        const uploadResult = await uploadAttachmentAction(formData);

        if (!uploadResult.success || !uploadResult.fileName) {
          showApiToast(uploadResult, {
            successTitle: t("productForm.toast.imageUploaded"),
            errorTitle: t("productForm.toast.uploadFailed"),
            errorMessage: t("productForm.toast.uploadFailedMessage"),
          });
          return;
        }

        uploadedUrls.push(uploadResult.fileName);
      }

      const payload = {
        title: data.title,
        description: data.description,
        cropId: data.cropId,
        unitType: data.unitType,
        currencyCode: data.currencyCode,
        pricePerUnit: data.pricePerUnit,
        totalQuantity: data.totalQuantity,
        imageUrls: uploadedUrls,
      };

      const result =
        isEditMode && product
          ? await updateCropProductAction(
              product.cropProductId || product.cropProductPostId || product.postId,
              payload,
            )
          : await createCropProductAction(payload);

      if (!result.success) {
        showApiToast(result, {
          successTitle: t("productForm.toast.productSaved"),
          errorTitle: t("productForm.toast.saveFailed"),
          errorMessage: t("productForm.toast.saveFailedMessage"),
        });
        return;
      }

      if (isEditMode) {
        const deleteResult = await deleteFilesAction(
          getRemovedImageFileNames(originalImageFileNames, uploadedUrls),
        );

        if (!deleteResult.success) {
          console.warn("Failed to delete old product images:", deleteResult.error);
        }
      }

      showApiSuccess(
        isEditMode
          ? t("productForm.toast.productUpdated")
          : t("productForm.toast.productCreated"),
        isEditMode
          ? t("productForm.toast.productUpdatedMessage")
          : t("productForm.toast.productCreatedMessage"),
      );

      router.push("/crop-product-management");
    } catch (error) {
      showApiError(error, t("productForm.toast.submitFailed"));
    }
  }

  function onInvalid(formErrors: FieldErrors<CropProductFormInput>) {
    const firstErrorName = Object.keys(formErrors)[0] as
      | Path<CropProductFormInput>
      | undefined;

    if (firstErrorName) setFocus(firstErrorName);
  }

  return (
    <div className={`bg-[#FBF6E9] ${fontClass} ${fontScopeClass} text-foreground`}>
      <section className="mt-9 w-full px-3 sm:px-6">
        <div className="relative z-0 -mt-24 h-16 w-full overflow-hidden rounded-[20px] sm:-mt-30 sm:h-20 sm:rounded-[28px]">
          <Image
            src="/assets/nav-bar/navbar_bg_image.png"
            alt={t("productForm.heroBackground")}
            fill
            priority
            className="object-cover"
          />
        </div>
      </section>

      <main className="relative min-h-screen overflow-x-hidden bg-[#FBF6E9]">
      <nav className="mx-auto max-w-6xl px-4 py-4 md:py-6">
        <ul className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
          <li>
            <Link href="/" className="hover:text-emerald-600">
              {t("productForm.home")}
            </Link>
          </li>

          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />

          <li>
            <Link href="/listing-product" className="hover:text-emerald-600">
              {t("productForm.cropProducts")}
            </Link>
          </li>

          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />

          <li>
            <Link
              href="/crop-product-management"
              className="hover:text-emerald-600"
            >
              {t("productForm.management")}
            </Link>
          </li>

          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />

          <li className="font-semibold text-emerald-700">
            {isEditMode ? t("productForm.editCropProduct") : t("productForm.createNewListing")}
          </li>
        </ul>
      </nav>

      <div className="mx-auto max-w-6xl px-4 pb-9 text-dark-grey">
        <div className="mb-8">
          <h1 className="heading text-primary-heading">
            {isEditMode ? t("productForm.editCropListing") : t("productForm.createNewCropListing")}
          </h1>

          <p className="description mt-2 text-secondary-body">
            {t("productForm.description")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          noValidate
          className="grid grid-cols-1 items-start gap-6 md:grid-cols-12 md:gap-8"
        >
          <input type="hidden" {...register("cropId")} />

          <div className="flex flex-col gap-4 md:col-span-5">
            <div className="rounded-2xl border border-light-grey bg-white p-4 shadow-sm sm:p-6">
              <h3 className="title mb-4 flex items-center gap-2 text-primary-heading">
                <ImagePlus className="h-5 w-5 text-muted" />
                {t("productForm.productMedia")}
              </h3>

              <div
                role="button"
                tabIndex={0}
                aria-label={t("productForm.addPhotos")}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);

                  if (event.dataTransfer.files.length > 0) {
                    processFiles(event.dataTransfer.files);
                  }
                }}
                className={`relative flex min-h-55 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed text-center ${
                  isDragging
                    ? "scale-[1.01] border-emerald-600 bg-emerald-50/50"
                    : "border-light-grey bg-[#fbfbfb] hover:border-primary"
                } ${imageItems[0] ? "p-0" : "p-8"}`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  multiple
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                />

                {imageItems[0] ? (
                  <>
                    <PreviewImage
                      src={getPreviewSrc(imageItems[0])}
                      alt={t("productForm.primaryPreview")}
                      className="object-cover"
                      onError={() => markPreviewFailed(imageItems[0])}
                    />
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeImage(0);
                      }}
                      className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f4f5]">
                      <ImagePlus className="h-5 w-5 text-muted" />
                    </div>

                    <p className="title mb-1">{t("productForm.addPhotos")}</p>
                    <p className="sub-title max-w-55 text-muted">
                      {t("productForm.uploadHint")}
                    </p>
                  </>
                )}
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2">
                {imageItems.slice(1).map((image, index) => {
                  const imageIndex = index + 1;

                  return (
                  <div
                    key={`${image.previewUrl}-${imageIndex}`}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-light-grey"
                  >
                    <PreviewImage
                      src={getPreviewSrc(image)}
                      alt={t("productForm.preview")}
                      className="object-cover"
                      onError={() => markPreviewFailed(image)}
                    />

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeImage(imageIndex);
                      }}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  );
                })}

                {Array.from({
                  length: Math.max(0, 4 - Math.max(0, imageItems.length - 1)),
                }).map(
                  (_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="title flex aspect-square items-center justify-center rounded-lg border border-dashed border-light-grey bg-[#fbfbfb] text-muted hover:bg-gray-50"
                    >
                      +
                    </button>
                  ),
                )}
              </div>

              {errors.imageUrls && (
                <p className="sub-title mt-2 font-medium text-red-500">
                  {translateProductFormError(t, errors.imageUrls.message)}
                </p>
              )}
            </div>

            <div className="flex gap-3 rounded-xl border border-[#d1fae5] bg-[#effaf3] p-4 text-primary-heading">
              <HelpCircle className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
              <div>
                <p className="title mb-0.5 text-primary">{t("productForm.proTip")}</p>
                <p className="sub-title leading-relaxed text-secondary-body">
                  {t("productForm.proTipDesc")}
                </p>
              </div>
            </div>
          </div>

            <div className="flex flex-col gap-6 rounded-2xl border border-light-grey bg-white p-4 shadow-sm sm:p-6 md:col-span-7">
            <div>
              <h3 className="title mb-4 text-primary-heading">
                {t("productForm.basicInformation")}
              </h3>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="sub-title mb-1 block font-bold text-muted">
                    <span className="text-red-500">*</span> {t("productForm.title")}
                  </label>

                  <input
                    type="text"
                    {...register("title")}
                    placeholder={t("productForm.titlePlaceholder")}
                    className="w-full rounded-lg border border-light-grey px-3 py-2.5 font-medium focus:border-primary focus:outline-none"
                  />

                  {errors.title && (
                    <p className="sub-title mt-1 text-red-500">
                      {translateProductFormError(t, errors.title.message)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Controller
                    name="cropType"
                    control={control}
                    render={({ field }) => (
                      <CustomFilterSelect
                        label={t("productForm.cropType")}
                        options={cropTypeOptions}
                        selected={field.value ?? "All"}
                        onChange={handleCropTypeChange}
                      />
                    )}
                  />

                  <div>
                    <Controller
                      name="cropName"
                      control={control}
                      render={({ field }) => (
                      <CustomFilterSelect
                        label={t("productForm.cropName")}
                        options={cropNameOptions}
                        selected={field.value ?? ""}
                        onChange={handleCropNameChange}
                        disabled={isCropNameDisabled}
                        placeholder={t("productForm.selectCrop")}
                      />
                      )}
                    />

                    {errors.cropId && (
                      <p className="sub-title mt-1 text-red-500">
                        {translateProductFormError(t, errors.cropId.message)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="title mb-4 text-primary-heading">
                {t("productForm.pricingInventory")}
              </h3>

              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {!isEditMode && (
                  <div>
                    <label className="sub-title mb-1 block font-bold text-primary">
                      <span className="text-red-500">*</span> {t("productForm.totalQuantity")}
                    </label>

                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9.]*"
                        step="0.01"
                        {...register("totalQuantity", { valueAsNumber: true })}
                        placeholder="00.00"
                        className="w-full rounded-lg border border-light-grey py-2.5 pl-3 pr-16 font-medium focus:border-primary focus:outline-none"
                      />

                      <span className="sub-title absolute right-3 top-1/2 -translate-y-1/2 font-semibold text-muted">
                        {translateProductFormUnit(t, watchedUnitType)}
                      </span>
                    </div>

                    {errors.totalQuantity && (
                      <p className="sub-title mt-1 text-red-500">
                        {translateProductFormError(t, errors.totalQuantity.message)}
                      </p>
                    )}
                  </div>
                )}

                {!isEditMode && (
                  <div>
                    <label className="sub-title mb-1 block font-bold text-primary">
                      {t("productForm.unitType")}
                    </label>

                    <Controller
                      name="unitType"
                      control={control}
                      render={({ field }) => (
                        <div className="flex w-full rounded-lg border border-light-grey bg-[#f4f4f5] p-1">
                          {(["KG", "TON"] as const).map((unit) => (
                            <button
                              key={unit}
                              type="button"
                              onClick={() => handleUnitTypeChange(unit)}
                              className={`sub-title flex-1 rounded-md py-1.5 font-bold ${
                                field.value === unit
                                  ? "bg-primary text-white shadow-sm"
                                  : "text-muted"
                              }`}
                            >
                              {translateProductFormUnit(t, unit)}
                            </button>
                          ))}
                        </div>
                      )}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="sub-title mb-1 block font-bold text-primary">
                    <span className="text-red-500">*</span> {t("productForm.pricePerUnit")}
                  </label>

                  <div className="relative">
                    <span className="sub-title absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-muted">
                      {watchedCurrencyCode === "USD" ? "$" : "៛"}
                    </span>

                    <input
                      type="text"
                      inputMode={watchedCurrencyCode === "KHR" ? "numeric" : "decimal"}
                      pattern={watchedCurrencyCode === "KHR" ? "[0-9]*" : "[0-9.]*"}
                      step={watchedCurrencyCode === "KHR" ? "100" : "0.01"}
                      min={watchedCurrencyCode === "KHR" ? 100 : 0.01}
                      {...register("pricePerUnit", { valueAsNumber: true })}
                      placeholder="00.00"
                      className="w-full rounded-lg border border-light-grey py-2.5 pl-7 pr-16 font-medium focus:border-primary focus:outline-none"
                    />

                    <span className="sub-title absolute right-3 top-1/2 -translate-y-1/2 font-semibold text-muted">
                      /{translateProductFormUnit(t, watchedUnitType)}
                    </span>
                  </div>

                  {errors.pricePerUnit && (
                    <p className="sub-title mt-1 text-red-500">
                      {translateProductFormError(t, errors.pricePerUnit.message)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="sub-title mb-1 block font-bold text-primary">
                    {t("productForm.currency")}
                  </label>

                  <Controller
                    name="currencyCode"
                    control={control}
                    render={({ field }) => (
                      <div className="flex w-full rounded-lg border border-light-grey bg-[#f4f4f5] p-1">
                        {(["KHR", "USD"] as const).map((code) => (
                          <button
                            key={code}
                            type="button"
                            onClick={() => void handleCurrencyCodeChange(code)}
                            className={`sub-title flex-1 rounded-md py-1.5 font-bold ${
                              field.value === code
                                ? "bg-primary text-white shadow-sm"
                                : "text-muted"
                            }`}
                          >
                            {code}
                          </button>
                        ))}
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="title mb-4 text-primary-heading">
                {t("productForm.details")} <span className="text-sm font-medium text-muted">{t("productForm.optional")}</span>
              </h3>

              <textarea
                {...register("description")}
                rows={4}
                placeholder={t("productForm.descPlaceholder")}
                className="sub-title w-full resize-none rounded-lg border border-light-grey px-3 py-2.5 font-medium focus:border-primary focus:outline-none"
              />

              {errors.description && (
                <p className="sub-title mt-1 text-red-500">
                  {translateProductFormError(t, errors.description.message)}
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-light-grey pt-4 sm:flex-row sm:justify-end">
              <Link
                href="/crop-product-management"
                className="sub-title rounded-lg border border-light-grey px-6 py-2.5 text-center font-bold uppercase tracking-wider text-secondary-body hover:bg-gray-50"
              >
                {t("productForm.cancel")}
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="sub-title cursor-pointer rounded-lg bg-secondary px-6 py-2.5 text-center font-bold uppercase tracking-wider text-black shadow-sm hover:bg-accent disabled:opacity-50"
              >
                {isSubmitting
                  ? t("productForm.saving")
                  : isEditMode
                    ? t("productForm.updateProduct")
                    : t("productForm.createProduct")}
              </button>
            </div>
          </div>
        </form>
      </div>
      </main>
    </div>
  );
}
