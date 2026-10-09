"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Controller,
  useForm,
  useWatch,
  type FieldErrors,
  type Path,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, HelpCircle, ImagePlus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  cropDemandSchema,
  type CropDemandFormValues,
  type CropDemandFormInput,
} from "../../../../../lib/cropDemand";

import type {
  CropDemandPost,
  CropDemandRequestBody,
} from "@/types/crop-demand";
import { CustomFilterSelect } from "../CustomFilterSelect";
import {
  deleteFilesAction,
  uploadAttachmentAction,
} from "@/action/upload.action";
import {
  createCropDemandAction,
  updateCropDemandAction,
} from "@/action/crop-demand.action";
import { getUsdToKhrRateAction } from "@/action/currency-rate.action";
import { Crop, CropType } from "@/types/cropType";
import { showApiError, showApiSuccess, showApiToast } from "@/lib/apiToast";
import type { AdministrativeLocation } from "@/services/locationFilter.service";
import { DatePickerComponent } from "@/components/ui/DatePickerComponent";
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

const DEMAND_FORM_TEXT = {
  "demandForm.home": { en: "Home", kh: "ទំព័រដើម" },
  "demandForm.cropDemand": { en: "Crop Demand", kh: "តម្រូវការដំណាំ" },
  "demandForm.productManagement": {
    en: "Product Management",
    kh: "ការគ្រប់គ្រងផលិតផល",
  },
  "demandForm.editDemand": {
    en: "Edit Crop Demand",
    kh: "កែប្រែតម្រូវការដំណាំ",
  },
  "demandForm.createDemandListing": {
    en: "Create Demand Listing",
    kh: "បង្កើតបញ្ជីតម្រូវការ",
  },
  "demandForm.editTitle": {
    en: "Edit Crop Demand",
    kh: "កែប្រែតម្រូវការដំណាំ",
  },
  "demandForm.createTitle": {
    en: "Create Crop Demand",
    kh: "បង្កើតតម្រូវការដំណាំ",
  },
  "demandForm.description": {
    en: "Expand your Cambodian produce to the digital marketplace.",
    kh: "ពង្រីកផលិតផលកម្ពុជារបស់អ្នកទៅកាន់ទីផ្សារឌីជីថល។",
  },
  "demandForm.locked": {
    en: "This demand is closed, so it cannot be updated. Create a new demand if you need to change the crop, price, quantity, or date.",
    kh: "តម្រូវការនេះត្រូវបានបិទ ដូច្នេះមិនអាចកែប្រែបានទេ។ សូមបង្កើតតម្រូវការថ្មី ប្រសិនបើអ្នកត្រូវការផ្លាស់ប្តូរដំណាំ តម្លៃ បរិមាណ ឬកាលបរិច្ឆេទ។",
  },
  "demandForm.productMedia": { en: "Product Media", kh: "មេឌៀផលិតផល" },
  "demandForm.primaryPreview": { en: "Primary preview", kh: "មើលជាមុនចម្បង" },
  "demandForm.preview": { en: "Preview", kh: "មើលជាមុន" },
  "demandForm.addPhotos": { en: "Add Photos", kh: "បន្ថែមរូបថត" },
  "demandForm.uploadHint": {
    en: "Drag and drop PNG/JPG here or click to upload. Maximum 5 images.",
    kh: "អូស និងទម្លាក់ PNG/JPG នៅទីនេះ ឬចុចដើម្បីបង្ហោះ។ អតិបរមា ៥ រូបភាព។",
  },
  "demandForm.proTip": { en: "Pro Tip", kh: "គន្លឹះ" },
  "demandForm.proTipDesc": {
    en: "Listing with high-quality photos and detailed expected delivery timelines receive 3x more inquiries from active supplier bases.",
    kh: "បញ្ជីដែលមានរូបថតគុណភាពខ្ពស់ និងពេលវេលាដឹកជញ្ជូនរំពឹងទុកលម្អិត ទទួលបានការសួរច្រើនជាង ៣ ដងពីអ្នកផ្គត់ផ្គង់សកម្ម។",
  },
  "demandForm.basicInformation": {
    en: "Basic Information",
    kh: "ព័ត៌មានមូលដ្ឋាន",
  },
  "demandForm.title": { en: "Title", kh: "ចំណងជើង" },
  "demandForm.titlePlaceholder": {
    en: "e.g. Premium Kampot Durian Bulk Demand",
    kh: "ឧ. តម្រូវការទុរេនកំពតគុណភាពខ្ពស់ចំនួនច្រើន",
  },
  "demandForm.cropType": { en: "Crop Type", kh: "ប្រភេទដំណាំ" },
  "demandForm.cropName": { en: "Crop Name", kh: "ឈ្មោះដំណាំ" },
  "demandForm.selectCropType": { en: "Select crop type", kh: "ជ្រើសរើសប្រភេទដំណាំ" },
  "demandForm.selectCrop": { en: "Select crop", kh: "ជ្រើសរើសដំណាំ" },
  "demandForm.quantity": { en: "Quantity", kh: "បរិមាណ" },
  "demandForm.quantityPlaceholder": { en: "e.g. 500", kh: "ឧ. 500" },
  "demandForm.unitType": { en: "Unit Type", kh: "ប្រភេទឯកតា" },
  "demandForm.unit.KG": { en: "KG", kh: "គីឡូក្រាម" },
  "demandForm.unit.TON": { en: "TON", kh: "តោន" },
  "demandForm.unit.TONS": { en: "TON", kh: "តោន" },
  "demandForm.maxPricePerUnit": {
    en: "Max Price Per Unit",
    kh: "តម្លៃឯកតាអតិបរមា",
  },
  "demandForm.currency": { en: "Currency", kh: "រូបិយប័ណ្ណ" },
  "demandForm.demandLevel": { en: "Demand Level", kh: "កម្រិតតម្រូវការ" },
  "demandForm.demandLevelHigh": { en: "High", kh: "ខ្ពស់" },
  "demandForm.demandLevelModerate": { en: "Moderate", kh: "មធ្យម" },
  "demandForm.demandLevelLow": { en: "Low", kh: "ទាប" },
  "demandForm.pricingInventory": {
    en: "Pricing & Inventory",
    kh: "តម្លៃ និងស្តុក",
  },
  "demandForm.deliveryDate": {
    en: "Delivery Date",
    kh: "កាលបរិច្ឆេទដឹកជញ្ជូន",
  },
  "demandForm.expectedDeliveryDate": {
    en: "Expected delivery date",
    kh: "កាលបរិច្ឆេទដឹកជញ្ជូនរំពឹងទុក",
  },
  "demandForm.location": { en: "Location", kh: "ទីតាំង" },
  "demandForm.selectLocation": { en: "Select location", kh: "ជ្រើសរើសទីតាំង" },
  "demandForm.details": { en: "Details", kh: "លម្អិត" },
  "demandForm.productDescription": {
    en: "Product Description",
    kh: "ការពិពណ៌នាផលិតផល",
  },
  "demandForm.descPlaceholder": {
    en: "Describe the crop demand...",
    kh: "ពិពណ៌នាអំពីតម្រូវការដំណាំ...",
  },
  "demandForm.cancel": { en: "Cancel", kh: "បោះបង់" },
  "demandForm.saving": { en: "Saving...", kh: "កំពុងរក្សាទុក..." },
  "demandForm.demandLocked": {
    en: "Demand Locked",
    kh: "តម្រូវការត្រូវបានចាក់សោ",
  },
  "demandForm.updateDemand": { en: "Update Demand", kh: "កែប្រែតម្រូវការ" },
  "demandForm.createDemand": { en: "Create Demand", kh: "បង្កើតតម្រូវការ" },
  "demandForm.heroBackground": {
    en: "Hero Background",
    kh: "ផ្ទៃខាងក្រោយ Hero",
  },
  "demandForm.minPriceKHR": {
  en: "Minimum price is ៛100",
  kh: "តម្លៃអប្បបរមាគឺ ៛១០០",
},
"demandForm.minPriceUSD": {
  en: "Minimum price is $0.01",
  kh: "តម្លៃអប្បបរមាគឺ $០.០១",
},
  "demandForm.cropName.Cotton": { en: "Cotton", kh: "កប្បាស" },
  "demandForm.cropName.Orange": { en: "Orange", kh: "ក្រូច" },
  "demandForm.cropName.Watermelon": { en: "Watermelon", kh: "ផ្លែឪឡឹក" },
  "demandForm.cropName.Strawberry": { en: "Strawberry", kh: "ផ្លែស្ត្របឺរី" },
  "demandForm.cropName.Grape": { en: "Grape", kh: "ផ្លែទំពាំងបាយជូរ" },
  "demandForm.cropName.Mango": { en: "Mango", kh: "ផ្លែស្វាយ" },
  "demandForm.cropName.Durian": { en: "Durian", kh: "ផ្លែធុរេន" },
  "demandForm.cropName.Keo Romeat Mango": { en: "Keo Romeat Mango", kh: "ស្វាយកែវរមៀត" },
  "demandForm.cropName.Avocado": { en: "Avocado", kh: "ផ្លែប័រ" },
  "demandForm.cropName.Lychee": { en: "Lychee", kh: "ផ្លៃគូលែន" },
  "demandForm.cropName.Jackfruit": { en: "Jackfruit", kh: "ផ្លែខ្នុរ" },
  "demandForm.cropName.Banana": { en: "Banana", kh: "ផ្លែចេក" },
  "demandForm.cropName.Star Fruit": { en: "Star Fruit", kh: "ផ្លែស្ពឺ" },
  "demandForm.cropName.Apple": { en: "Apple", kh: "ផ្លែប៉ោម" },
  "demandForm.cropName.Wheat": { en: "Wheat", kh: "ស្រូវសាលី" },
  "demandForm.cropName.Rice": { en: "Rice", kh: "ស្រូវ" },
  "demandForm.cropName.Oat": { en: "Oat", kh: "ស្រូវអូត" },
  "demandForm.cropName.Black Pepper": { en: "Black Pepper", kh: "ម្រេច" },
  "demandForm.cropName.Yellow Maize": { en: "Yellow Maize", kh: "ពោតលឿង" },
  "demandForm.cropName.Soybean": { en: "Soybean", kh: "សណ្តែកសៀង" },
  "demandForm.cropName.Sugarcane": { en: "Sugarcane", kh: "អំពៅ" },
  "demandForm.cropName.Rubber": { en: "Rubber", kh: "កៅស៊ូ" },
  "demandForm.cropName.Arabica Coffee": { en: "Arabica Coffee", kh: "កាហ្វេអារ៉ាប៊ីកា" },
  "demandForm.cropName.Jasmine Rice": { en: "Jasmine Rice", kh: "ស្រូវផ្កាម្លិះ" },
  "demandForm.cropName.Brown Rice": { en: "Brown Rice", kh: "អង្ករសម្រូប" },
  "demandForm.cropName.Sen Kra Ob Rice": { en: "Sen Kra Ob Rice", kh: "ស្រូវសែនក្រអូប" },
  "demandForm.cropName.Phka Rumduol Rice": { en: "Phka Rumduol Rice", kh: "ស្រូវផ្ការំដួល" },
  "demandForm.cropName.Cassava": { en: "Cassava", kh: "ដំឡូងមី" },
  "demandForm.cropName.Taro": { en: "Taro", kh: "ត្រាវ" },
  "demandForm.cropName.Garlic": { en: "Garlic", kh: "ខ្ទឹមស" },
  "demandForm.cropName.Turmeric": { en: "Turmeric", kh: "រមៀត" },
  "demandForm.error.titleMin": { en: "Please enter a product title with at least 5 characters.", kh: "សូមបញ្ចូលចំណងជើងយ៉ាងហោចណាស់ 5 តួអក្សរ។" },
  "demandForm.error.titleMax": { en: "Title must not exceed 255 characters.", kh: "ចំណងជើងមិនត្រូវលើសពី 255 តួអក្សរទេ។" },
  "demandForm.error.titlePattern": { en: "Title must contain only letters, numbers, and spaces.", kh: "ចំណងជើងត្រូវមានតែអក្សរ លេខ និងចន្លោះប៉ុណ្ណោះ។" },
  "demandForm.error.validCrop": { en: "Please select a valid crop", kh: "សូមជ្រើសរើសដំណាំដែលត្រឹមត្រូវ។" },
  "demandForm.error.numberOnly": { en: "Please input number only", kh: "សូមបញ្ចូលតែលេខប៉ុណ្ណោះ។" },
  "demandForm.error.quantityPositive": { en: "Quantity must be greater than 0", kh: "បរិមាណត្រូវតែធំជាង 0។" },
  "demandForm.error.pricePositive": { en: "Price must be greater than 0", kh: "តម្លៃត្រូវតែធំជាង 0។" },
  "demandForm.error.locationRequired": { en: "Location preference is required", kh: "ត្រូវការទីតាំង។" },
  "demandForm.error.validLocation": { en: "Please select a valid location", kh: "សូមជ្រើសរើសទីតាំងដែលត្រឹមត្រូវ។" },
  "demandForm.error.deliveryDateRequired": { en: "Expected delivery date is required", kh: "ត្រូវការកាលបរិច្ឆេទដឹកជញ្ជូនរំពឹងទុក។" },
  "demandForm.error.imageRequired": { en: "Please upload at least one demand photo", kh: "សូមបង្ហោះរូបថតតម្រូវការយ៉ាងហោចណាស់មួយ។" },
  "demandForm.error.descriptionMax": { en: "Description must not exceed 500 characters.", kh: "ការពិពណ៌នាមិនត្រូវលើសពី 500 តួអក្សរទេ។" },
  "demandForm.error.khrDivisible": { en: "Price in KHR must be divisible by 100", kh: "តម្លៃជារៀលត្រូវតែចែកដាច់នឹង 100។" },
  "demandForm.error.tonDecimal": { en: "Quantity must have at most 2 decimal places for TON", kh: "បរិមាណជាតោនត្រូវមានខ្ទង់ទសភាគយ៉ាងច្រើន 2 ខ្ទង់។" },
  "demandForm.error.noDeliveryDate": { en: "No delivery date error", kh: "មិនមានកំហុសកាលបរិច្ឆេទដឹកជញ្ជូនទេ។" },
  "demandForm.error.noLocation": { en: "No location error", kh: "មិនមានកំហុសទីតាំងទេ។" },
  "demandForm.toast.fileRejected": { en: 'File "{fileName}" is rejected. Only PNG and JPG formats are permitted.', kh: 'ឯកសារ "{fileName}" ត្រូវបានបដិសេធ។ អនុញ្ញាតតែទ្រង់ទ្រាយ PNG និង JPG ប៉ុណ្ណោះ។' },
  "demandForm.toast.lockedSubmit": { en: "Cannot update closed or expired demand. Create a new demand instead.", kh: "មិនអាចកែប្រែតម្រូវការដែលបានបិទ ឬផុតកំណត់បានទេ។ សូមបង្កើតតម្រូវការថ្មីជំនួស។" },
  "demandForm.toast.imageUploaded": { en: "Image uploaded", kh: "បានបង្ហោះរូបភាព" },
  "demandForm.toast.uploadFailed": { en: "Upload failed", kh: "ការបង្ហោះបរាជ័យ" },
  "demandForm.toast.uploadFailedMessage": { en: "Failed to upload demand image.", kh: "មិនអាចបង្ហោះរូបភាពតម្រូវការបានទេ។" },
  "demandForm.toast.demandSaved": { en: "Crop demand saved", kh: "បានរក្សាទុកតម្រូវការដំណាំ" },
  "demandForm.toast.updateFailed": { en: "Update failed", kh: "ការកែប្រែបរាជ័យ" },
  "demandForm.toast.postFailed": { en: "Post failed", kh: "ការបង្ហោះបរាជ័យ" },
  "demandForm.toast.updateFailedMessage": { en: "We couldn't update your crop demand. Please check the form and try again.", kh: "យើងមិនអាចកែប្រែតម្រូវការដំណាំរបស់អ្នកបានទេ។ សូមពិនិត្យទម្រង់ ហើយព្យាយាមម្តងទៀត។" },
  "demandForm.toast.postFailedMessage": { en: "We couldn't post your crop demand. Please check the form and try again.", kh: "យើងមិនអាចបង្ហោះតម្រូវការដំណាំរបស់អ្នកបានទេ។ សូមពិនិត្យទម្រង់ ហើយព្យាយាមម្តងទៀត។" },
  "demandForm.toast.demandUpdated": { en: "Crop demand updated", kh: "បានកែប្រែតម្រូវការដំណាំ" },
  "demandForm.toast.demandCreated": { en: "Crop demand created", kh: "បានបង្កើតតម្រូវការដំណាំ" },
  "demandForm.toast.demandUpdatedMessage": { en: "Your demand post has been updated successfully.", kh: "ប្រកាសតម្រូវការរបស់អ្នកត្រូវបានកែប្រែដោយជោគជ័យ។" },
  "demandForm.toast.demandCreatedMessage": { en: "Your demand post has been created successfully.", kh: "ប្រកាសតម្រូវការរបស់អ្នកត្រូវបានបង្កើតដោយជោគជ័យ។" },
  "demandForm.toast.saveFailed": { en: "Failed to save crop demand.", kh: "មិនអាចរក្សាទុកតម្រូវការដំណាំបានទេ។" },
  "demandForm.friendlyError.default": { en: "We couldn't post your crop demand. Please check the form and try again.", kh: "យើងមិនអាចបង្ហោះតម្រូវការដំណាំរបស់អ្នកបានទេ។ សូមពិនិត្យទម្រង់ ហើយព្យាយាមម្តងទៀត។" },
  "demandForm.friendlyError.location": { en: "We couldn't post your crop demand. Please select a valid province from the location dropdown and try again.", kh: "យើងមិនអាចបង្ហោះតម្រូវការដំណាំរបស់អ្នកបានទេ។ សូមជ្រើសរើសខេត្តដែលត្រឹមត្រូវពីបញ្ជីទីតាំង ហើយព្យាយាមម្តងទៀត។" },
  "demandForm.friendlyError.crop": { en: "We couldn't post your crop demand. Please select a crop type and crop name before trying again.", kh: "យើងមិនអាចបង្ហោះតម្រូវការដំណាំរបស់អ្នកបានទេ។ សូមជ្រើសរើសប្រភេទដំណាំ និងឈ្មោះដំណាំ មុនពេលព្យាយាមម្តងទៀត។" },
  "demandForm.friendlyError.date": { en: "We couldn't post your crop demand. Please choose a valid expected delivery date and try again.", kh: "យើងមិនអាចបង្ហោះតម្រូវការដំណាំរបស់អ្នកបានទេ។ សូមជ្រើសរើសកាលបរិច្ឆេទដឹកជញ្ជូនរំពឹងទុកដែលត្រឹមត្រូវ ហើយព្យាយាមម្តងទៀត។" },
  "demandForm.friendlyError.image": { en: "We couldn't post your crop demand. Please upload at least one PNG or JPG image and try again.", kh: "យើងមិនអាចបង្ហោះតម្រូវការដំណាំរបស់អ្នកបានទេ។ សូមបង្ហោះរូបភាព PNG ឬ JPG យ៉ាងហោចណាស់មួយ ហើយព្យាយាមម្តងទៀត។" },
  "demandForm.friendlyError.generic": { en: "We couldn't post your crop demand right now. Please check your information and try again.", kh: "យើងមិនអាចបង្ហោះតម្រូវការដំណាំរបស់អ្នកឥឡូវនេះបានទេ។ សូមពិនិត្យព័ត៌មានរបស់អ្នក ហើយព្យាយាមម្តងទៀត។" },
} as const;

function getDemandFormText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  return (key: string) =>
    DEMAND_FORM_TEXT[key as keyof typeof DEMAND_FORM_TEXT]?.[lang] ?? key;
}

function formatDemandFormText(
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

function translateDemandCropName(t: (key: string) => string, value?: string) {
  if (!value) return "";

  const key = `demandForm.cropName.${value}`;
  const translated = t(key);

  return translated === key ? value : translated;
}

function translateDemandUnit(t: (key: string) => string, unit?: string) {
  if (!unit) return "";

  const key = `demandForm.unit.${unit}`;
  const translated = t(key);

  return translated === key ? unit : translated;
}

function translateDemandFormError(
  t: (key: string) => string,
  message?: string,
) {
  if (!message) return "";

  const errorKeyByMessage: Record<string, string> = {
    "Please enter a product title with at least 5 characters.": "demandForm.error.titleMin",
    "Title must not exceed 255 characters.": "demandForm.error.titleMax",
    "Title must contain only letters, numbers, and spaces.": "demandForm.error.titlePattern",
    "Please select a valid crop": "demandForm.error.validCrop",
    "Please input number only": "demandForm.error.numberOnly",
    "Quantity must be greater than 0": "demandForm.error.quantityPositive",
    "Price must be greater than 0": "demandForm.error.pricePositive",
    "Location preference is required": "demandForm.error.locationRequired",
    "Please select a valid location": "demandForm.error.validLocation",
    "Expected delivery date is required": "demandForm.error.deliveryDateRequired",
    "Please upload at least one demand photo": "demandForm.error.imageRequired",
    "Description must not exceed 500 characters.": "demandForm.error.descriptionMax",
    "Price in KHR must be divisible by 100": "demandForm.error.khrDivisible",
    "Quantity must have at most 2 decimal places for TON": "demandForm.error.tonDecimal",
  };
  const key = errorKeyByMessage[message];

  return key ? t(key) : message;
}

function getDemandFormFontScopeClass(language: string) {
  return language === "kh"
    ? "[&_*]:!font-khmer [&_.title]:!font-khmer [&_.sub-title]:!font-khmer [&_.heading]:!font-khmer [&_.description]:!font-khmer"
    : "";
}

type Props = {
  demand?: CropDemandPost;
  demandId?: string;
  initialCropTypes?: CropType[];
  initialCrops?: Crop[];
  initialProvinces?: AdministrativeLocation[];
};

type ImageItem = {
  previewUrl: string;
  imageUrl?: string;
  file?: File;
};

type LocationOption = {
  label: string;
  value: string;
};

function toLocationCode(locationName: string) {
  return locationName
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
}

function getLocationOptions(provinces: AdministrativeLocation[]) {
  const seen = new Set<string>();

  return provinces.reduce<LocationOption[]>((options, province) => {
    const label = province.nameEn.trim();
    if (!label) return options;

    const value = toLocationCode(label);
    if (!value || seen.has(value)) return options;

    seen.add(value);
    options.push({ label, value });

    return options;
  }, []);
}

function getValidLocationPreference(
  location: string | undefined,
  options: LocationOption[],
) {
  if (location) {
    const locationCode = toLocationCode(location);
    const option = options.find(
      (item) => item.value === location || item.value === locationCode,
    );

    if (option) return option.value;
  }

  return options[0]?.value ?? "";
}

function getValidUnitType(unitType?: string) {
  if (unitType === "TONS") return "TON";

  return unitType === "KG" || unitType === "TON" ? unitType : "KG";
}

function getImageFileName(value: string) {
  return getStoredFileName(value) || value;
}

function buildImageItem(url: string): ImageItem {
  const fileName = getImageFileName(url);

  return {
    previewUrl: getFileUrl(fileName) || url,
    imageUrl: fileName,
  };
}

function getFormImageValues(images: ImageItem[]) {
  return images
    .map((image) => image.imageUrl ?? image.previewUrl)
    .map(getImageFileName)
    .filter(Boolean);
}

function getRemovedImageFileNames(
  originalFileNames: string[],
  nextFileNames: string[],
) {
  const nextSet = new Set(nextFileNames);

  return originalFileNames.filter(
    (fileName) => fileName && !nextSet.has(fileName),
  );
}

function isExpiredDate(date?: string) {
  if (!date) return false;

  const deliveryDate = new Date(date);
  if (Number.isNaN(deliveryDate.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deliveryDate.setHours(0, 0, 0, 0);

  return deliveryDate < today;
}

function getFriendlyCropDemandErrorMessage(
  t: (key: string) => string,
  error?: string,
) {
  if (!error)
    return t("demandForm.friendlyError.default");

  const normalizedError = error.toLowerCase();

  if (
    normalizedError.includes("must be one of") &&
    normalizedError.includes("phnom_penh")
  ) {
    return t("demandForm.friendlyError.location");
  }

  if (
    normalizedError.includes("cropid") ||
    normalizedError.includes("crop id") ||
    normalizedError.includes("valid crop")
  ) {
    return t("demandForm.friendlyError.crop");
  }

  if (
    normalizedError.includes("expecteddeliverydate") ||
    normalizedError.includes("expected delivery date")
  ) {
    return t("demandForm.friendlyError.date");
  }

  if (normalizedError.includes("image")) {
    return t("demandForm.friendlyError.image");
  }

  return t("demandForm.friendlyError.generic");
}

export default function CreateCropDemandForm({
  demand,
  demandId,
  initialCropTypes = [],
  initialCrops = [],
  initialProvinces = [],
}: Props) {
  const router = useRouter();
  const { language } = useI18n();
  const t = getDemandFormText(language);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";
  const fontScopeClass = getDemandFormFontScopeClass(language);
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);
  const [imageItems, setImageItems] = useState<ImageItem[]>(() => {
    if (!demand?.imageUrls) return [];

    const urls =
      typeof demand.imageUrls === "string"
        ? [demand.imageUrls]
        : demand.imageUrls;

    return urls
      .filter((url) => typeof url === "string" && url.length > 0)
      .map(buildImageItem);
  });
  const [originalImageFileNames] = useState<string[]>(() =>
    getFormImageValues(imageItems),
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropTypes = initialCropTypes;
  const crops = initialCrops;
  const locationOptions = useMemo(
    () => getLocationOptions(initialProvinces),
    [initialProvinces],
  );
  const defaultLocation = locationOptions[0]?.value ?? "";

  const isEditMode = Boolean(demand);
  const isLockedDemand =
    isEditMode &&
    Boolean(
      demand?.status === "CLOSED" ||
      isExpiredDate(demand?.expectedDeliveryDate),
    );

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    setFocus,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CropDemandFormInput, object, CropDemandFormValues>({
    resolver: zodResolver(cropDemandSchema),
    defaultValues: {
      title: demand?.title ?? "",
      cropName: "",
      cropType: "",
      cropId: "",
      buyerName: "",
      buyerProfileUrl: "",
      quantityNeeded: 0,
      unitType: "KG",
      maxPricePerUnit: 0,
      currencyCode: "KHR",
      locationPreferences: defaultLocation,
      expectedDeliveryDate: "",
      demandLevel: demand?.demandLevel ?? "HIGH",
      status: "OPEN",
      isOffered: false,
      imageUrls: [],
      description: "",
    },
  });

  const watchedUnitType = useWatch({ control, name: "unitType" });
  const watchedCurrencyCode = useWatch({ control, name: "currencyCode" });
  const watchedCropType = useWatch({ control, name: "cropType" });
  const watchedCropName = useWatch({ control, name: "cropName" });
  const rateRequestRef = useRef<Promise<number> | null>(null);

  const selectedCropType = cropTypes.find(
    (cropType) => cropType.typeName === watchedCropType,
  );

  const cropOptions = useMemo(() => {
    if (!selectedCropType) return [];

    return crops.filter(
      (crop) => crop.cropTypeId === selectedCropType.cropTypeId,
    );
  }, [crops, selectedCropType]);
  const cropNameOptions = useMemo(
    () =>
      cropOptions.map((crop) => ({
        value: crop.cropName,
        label: translateDemandCropName(t, crop.cropName),
      })),
    [cropOptions, t],
  );

  useEffect(() => {
    if (!watchedCropName) return;

    const selectedCrop = crops.find(
      (crop) =>
        crop.cropName === watchedCropName &&
        (!selectedCropType || crop.cropTypeId === selectedCropType.cropTypeId),
    );

    if (!selectedCrop) return;

    setValue("cropId", selectedCrop.cropId, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }, [crops, selectedCropType, setValue, watchedCropName]);

  useEffect(() => {
    if (!demand) return;

    const imageList =
      typeof demand.imageUrls === "string"
        ? [demand.imageUrls]
        : (demand.imageUrls ?? []);
    const validImageList = imageList.filter(
      (url) => typeof url === "string" && url.length > 0,
    );

    reset({
      title: demand.title ?? "",
      cropType: demand.cropTypeName ?? demand.cropType ?? "",
      cropName: demand.cropName ?? "",
      cropId: demand.cropId ?? "",
      buyerName: demand.buyerName ?? "",
      buyerProfileUrl: demand.buyerProfileUrl ?? "",
      quantityNeeded: demand.quantityNeeded ?? 0,
      unitType: getValidUnitType(demand.unitType),
      maxPricePerUnit: demand.maxPricePerUnit ?? 0,
      currencyCode:
        demand.currencyCode === "KHR" || demand.currencyCode === "USD"
          ? demand.currencyCode
          : "KHR",
      locationPreferences: getValidLocationPreference(
        demand.locationPreferences,
        locationOptions,
      ),
      expectedDeliveryDate: demand.expectedDeliveryDate?.split("T")[0] ?? "",
      demandLevel: demand.demandLevel ?? "HIGH",
      status: demand.status ?? "OPEN",
      isOffered: demand.isOffered ?? false,
      description: demand.description ?? "",
      imageUrls: validImageList.map(getImageFileName).filter(Boolean),
    });
  }, [demand, locationOptions, reset]);

  async function getKhrPerUsd() {
    rateRequestRef.current ??= getUsdToKhrRateAction();

    return rateRequestRef.current;
  }

  function handleUnitTypeChange(nextUnit: MarketUnit) {
    const currentUnit = toMarketUnit(getValues("unitType"));
    if (nextUnit === currentUnit) return;

    const quantity = Number(getValues("quantityNeeded") ?? 0);
    const pricePerUnit = Number(getValues("maxPricePerUnit") ?? 0);
    const currencyCode = getValues("currencyCode") as MarketCurrency;

    setValue("unitType", nextUnit, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setValue(
      "quantityNeeded",
      roundMarketQuantity(
        convertMarketQuantity(quantity, currentUnit, nextUnit),
      ),
      { shouldDirty: true, shouldTouch: true, shouldValidate: true },
    );
    setValue(
      "maxPricePerUnit",
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

    const pricePerUnit = Number(getValues("maxPricePerUnit") ?? 0);
    const khrPerUsd = await getKhrPerUsd();

    setValue("currencyCode", nextCurrency, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setValue(
      "maxPricePerUnit",
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

  // Handle validating and processing file uploads (Strict PNG/JPG filters)
  const processFiles = (files: FileList) => {
    const filesArray = Array.from(files);

    const validFiles = filesArray.filter((file) => {
      const isValid = file.type === "image/jpeg" || file.type === "image/png";
      if (!isValid) {
        showApiError(
          new Error(
            formatDemandFormText(t, "demandForm.toast.fileRejected", {
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

    setImageItems(updatedImages);
    setValue("imageUrls", getFormImageValues(updatedImages), {
      shouldValidate: true,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const removedImage = imageItems[index];
    const updatedImages = imageItems.filter((_, i) => i !== index);

    if (removedImage?.file) {
      URL.revokeObjectURL(removedImage.previewUrl);
    }

    setImageItems(updatedImages);
    setValue("imageUrls", getFormImageValues(updatedImages), {
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: CropDemandFormValues) => {
    try {
      if (isLockedDemand) {
        showApiError(
          new Error(t("demandForm.toast.lockedSubmit")),
        );
        return;
      }

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
            successTitle: t("demandForm.toast.imageUploaded"),
            errorTitle: t("demandForm.toast.uploadFailed"),
            errorMessage: t("demandForm.toast.uploadFailedMessage"),
          });
          return;
        }

        uploadedUrls.push(uploadResult.fileName);
      }

      const payload: CropDemandRequestBody = {
        title: data.title,
        description: data.description,
        cropId: data.cropId,
        unitType: data.unitType,
        currencyCode: data.currencyCode,
        maxPricePerUnit: data.maxPricePerUnit,
        quantityNeeded: data.quantityNeeded,
        locationPreferences: data.locationPreferences,
        expectedDeliveryDate: data.expectedDeliveryDate,
        demandLevel: data.demandLevel,
        imageUrls: uploadedUrls,
      };

      const editPostId =
        demandId ?? demand?.postId ?? demand?.cropDemandPostId ?? "";
      const result =
        isEditMode && demand
          ? await updateCropDemandAction(editPostId, payload)
          : await createCropDemandAction(payload);

      if (!result.success) {
        showApiToast(
          {
            ...result,
            error: getFriendlyCropDemandErrorMessage(t, result.error),
          },
          {
            successTitle: t("demandForm.toast.demandSaved"),
            errorTitle: isEditMode
              ? t("demandForm.toast.updateFailed")
              : t("demandForm.toast.postFailed"),
            errorMessage: isEditMode
              ? t("demandForm.toast.updateFailedMessage")
              : t("demandForm.toast.postFailedMessage"),
          },
        );
        return;
      }

      if (isEditMode) {
        const deleteResult = await deleteFilesAction(
          getRemovedImageFileNames(originalImageFileNames, uploadedUrls),
        );

        if (!deleteResult.success) {
          console.warn(
            "Failed to delete old demand images:",
            deleteResult.error,
          );
        }
      }

      showApiSuccess(
        isEditMode
          ? t("demandForm.toast.demandUpdated")
          : t("demandForm.toast.demandCreated"),
        isEditMode
          ? t("demandForm.toast.demandUpdatedMessage")
          : t("demandForm.toast.demandCreatedMessage"),
      );

      if (!isEditMode) {
        reset();
        imageItems.forEach((image) => {
          if (image.file) URL.revokeObjectURL(image.previewUrl);
        });
        setImageItems([]);
      }

      router.push("/crop-demands-management");
    } catch (err) {
      console.error("Submission error:", err);
      showApiError(err, t("demandForm.toast.saveFailed"));
    }
  };

  const onInvalid = (formErrors: FieldErrors<CropDemandFormInput>) => {
    const firstErrorName = Object.keys(formErrors)[0] as
      | Path<CropDemandFormInput>
      | undefined;

    if (firstErrorName) setFocus(firstErrorName);
  };

  return (
    <div className={`bg-[#FBF6E9] ${fontClass} ${fontScopeClass} text-foreground`}>
      <section className="mt-9 w-full px-6">
        <div className="relative z-0 -mt-30 h-20 w-full overflow-hidden rounded-[28px]">
          <Image
            src="/assets/nav-bar/navbar_bg_image.png"
            alt={t("demandForm.heroBackground")}
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
              <Link
                href="/"
                className="transition-colors hover:text-emerald-600"
              >
                {t("demandForm.home")}
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <li>
              <Link
                href="/listing-crop-demands"
                className="transition-colors hover:text-emerald-600"
              >
                {t("demandForm.cropDemand")}
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <li>
              <Link
                href="/crop-demands-management"
                className="transition-colors hover:text-emerald-600"
              >
                {t("demandForm.productManagement")}
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <li className="truncate font-semibold text-emerald-700">
              {isEditMode
                ? t("demandForm.editDemand")
                : t("demandForm.createDemandListing")}
            </li>
          </ul>
        </nav>

        <div className="mx-auto max-w-6xl px-4 pb-9 text-dark-grey">
          <div className="mb-8">
            <h1 className="heading text-primary-heading">
              {isEditMode
                ? t("demandForm.editDemand")
                : t("demandForm.createDemandListing")}
            </h1>
            <p className="description mt-2 text-secondary-body">
              {t("demandForm.description")}
            </p>
          </div>

          {isLockedDemand && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              {t("demandForm.locked")}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            noValidate
            className="grid grid-cols-1 items-start gap-8 md:grid-cols-12"
          >
            <input type="hidden" {...register("cropId")} />
            {/* ── Left Column: Media & {t("demandForm.proTip")}s ───────────────────────── */}
            <div className="flex flex-col gap-4 md:col-span-5">
              <div className="rounded-2xl border border-light-grey bg-white p-6 shadow-sm">
                <h3 className="title mb-4 flex items-center gap-2 text-primary-heading">
                  <ImagePlus className="h-5 w-5 text-muted" />
                  {t("demandForm.productMedia")}
                </h3>

                {/* Dynamic Drag and Drop Container Interface */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={t("demandForm.addPhotos")}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (
                      e.dataTransfer.files &&
                      e.dataTransfer.files.length > 0
                    ) {
                      processFiles(e.dataTransfer.files);
                    }
                  }}
                  className={`relative flex min-h-55 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed text-center transition-all ${
                    isDragging
                      ? "border-emerald-600 bg-emerald-50/50 scale-[1.01]"
                      : "border-light-grey bg-[#fbfbfb] hover:border-primary"
                  } ${imageItems[0] ? "p-0" : "p-8"}`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    disabled={isLockedDemand}
                    multiple
                    accept=".png,.jpg,.jpeg"
                    className="hidden"
                  />

                  {imageItems[0] ? (
                    <>
                      <Image
                        src={imageItems[0].previewUrl}
                        alt={t("demandForm.primaryPreview")}
                        fill
                        sizes="(max-width: 768px) 100vw, 420px"
                        className="object-cover"
                      />
                      {isLockedDemand ? null : (
                        <button
                          type="button"
                          disabled={isLockedDemand}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(0);
                          }}
                          className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f4f5]">
                        <ImagePlus className="h-5 w-5 text-muted" />
                      </div>

                      <p className="title mb-1">{t("demandForm.addPhotos")}</p>
                      <p className="sub-title max-w-55 text-muted">
                        {t("demandForm.uploadHint")}
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
                        <Image
                          src={image.previewUrl}
                          alt={t("demandForm.preview")}
                          width={200}
                          height={200}
                          sizes="(max-width: 768px) 50vw, 200px"
                          className="h-full w-full object-cover"
                        />

                        {isLockedDemand ? null : (
                          <button
                            type="button"
                            disabled={isLockedDemand}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(imageIndex);
                            }}
                            className="absolute right-1 top-1 z-10 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {Array.from({
                    length: Math.max(0, 4 - Math.max(0, imageItems.length - 1)),
                  }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={t("demandForm.addPhotos")}
                      onClick={() => fileInputRef.current?.click()}
                      className="title flex aspect-square cursor-pointer items-center justify-center rounded-lg border border-dashed border-light-grey bg-[#fbfbfb] text-muted hover:bg-gray-50"
                    >
                      +
                    </button>
                  ))}
                </div>

                {errors.imageUrls && (
                  <p className="sub-title mt-2 font-medium text-red-500">
                    {translateDemandFormError(t, errors.imageUrls.message)}
                  </p>
                )}
              </div>

              <div className="flex gap-3 rounded-xl border border-[#d1fae5] bg-[#effaf3] p-4 text-primary-heading">
                <HelpCircle className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
                <div>
                  <p className="title mb-0.5 text-primary">
                    {t("demandForm.proTip")}
                  </p>
                  <p className="sub-title leading-relaxed text-secondary-body">
                    {t("demandForm.proTipDesc")}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Right Column: Core Input Information Workspace ─────── */}
            <div className="flex flex-col gap-6 rounded-2xl border border-light-grey bg-white p-6 shadow-sm md:col-span-7">
              <div>
                <h3 className="title mb-4 text-primary-heading">
                  {t("demandForm.basicInformation")}
                </h3>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="sub-title mb-1 block font-bold text-muted">
                      <span className="text-red-500">*</span>{" "}
                      {t("demandForm.title")}
                    </label>
                    <input
                      type="text"
                      {...register("title")}
                      disabled={isLockedDemand}
                      placeholder={t("demandForm.titlePlaceholder")}
                      className="w-full rounded-lg border border-light-grey px-3 py-2.5 font-medium focus:border-primary focus:outline-none"
                    />
                    {errors.title && (
                      <p className="sub-title mt-1 text-red-500">
                        {translateDemandFormError(t, errors.title.message)}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Controller
                        name="cropType"
                        control={control}
                        render={({ field }) => (
                          <CustomFilterSelect
                            label={t("demandForm.cropType")}
                            options={cropTypes.map(
                              (cropType) => cropType.typeName,
                            )}
                            selected={field.value ?? ""}
                            disabled={isLockedDemand}
                            placeholder={t("demandForm.selectCropType")}
                            onChange={(value) => {
                              field.onChange(value);
                              setValue("cropName", "");
                              setValue("cropId", "", {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                              });
                            }}
                          />
                        )}
                      />
                      {errors.cropType && (
                        <p className="sub-title mt-1 text-red-500">
                          {translateDemandFormError(t, errors.cropType.message)}
                        </p>
                      )}
                    </div>

                    <div>
                      <Controller
                        name="cropName"
                        control={control}
                        render={({ field }) => (
                          <CustomFilterSelect
                            label={t("demandForm.cropName")}
                            options={cropNameOptions}
                            selected={field.value ?? ""}
                            placeholder={t("demandForm.selectCrop")}
                            disabled={!selectedCropType || isLockedDemand}
                            onChange={(value) => {
                              field.onChange(value);
                              const crop = crops.find(
                                (item) =>
                                  item.cropName === value &&
                                  (!selectedCropType ||
                                    item.cropTypeId ===
                                      selectedCropType.cropTypeId),
                              );
                              setValue("cropId", crop?.cropId ?? "", {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                              });
                            }}
                          />
                        )}
                      />
                      {errors.cropId && (
                        <p className="sub-title mt-1 text-red-500">
                          {translateDemandFormError(t, errors.cropId.message)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="sub-title mb-1 block font-bold text-primary">
                        <span className="text-red-500">*</span>{" "}
                        {t("demandForm.quantity")}
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        disabled={isLockedDemand}
                        pattern="[0-9.]*"
                        step="0.01"
                        {...register("quantityNeeded", { valueAsNumber: true })}
                        placeholder={t("demandForm.quantityPlaceholder")}
                        className="w-full rounded-lg border border-light-grey px-3 py-2.5 font-medium focus:border-primary focus:outline-none"
                      />
                      {errors.quantityNeeded && (
                        <p className="sub-title mt-1 text-red-500">
                          {translateDemandFormError(t, errors.quantityNeeded.message)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="sub-title mb-1 block font-bold text-primary">
                        <span className="text-red-500">*</span>{" "}
                        {t("demandForm.unitType")}
                      </label>
                      <Controller
                        name="unitType"
                        control={control}
                        render={({ field }) => (
                          <div className="flex w-full justify-between rounded-lg border border-light-grey bg-[#f4f4f5] p-1">
                            {(["KG", "TON"] as const).map((unit) => (
                              <button
                                key={unit}
                                disabled={isLockedDemand}
                                type="button"
                                onClick={() => handleUnitTypeChange(unit)}
                                className={`sub-title flex-1 rounded-md py-1.5 font-bold transition-all ${
                                  field.value === unit
                                    ? "bg-primary text-white shadow-sm"
                                    : "text-muted"
                                }`}
                              >
                                {translateDemandUnit(t, unit)}
                              </button>
                            ))}
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="sub-title mb-1 block font-bold text-primary">
                        <span className="text-red-500">*</span>{" "}
                        {t("demandForm.maxPricePerUnit")}
                      </label>
                      <div className="relative">
                        <span className="sub-title absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-muted">
                          {watchedCurrencyCode === "USD" ? "$" : "៛"}
                        </span>
                        <input
                          type="text"
                          inputMode={
                            watchedCurrencyCode === "USD"
                              ? "decimal"
                              : "numeric"
                          }
                          disabled={isLockedDemand}
                          pattern={
                            watchedCurrencyCode === "USD" ? "[0-9.]*" : "[0-9]*"
                          }
                          step={watchedCurrencyCode === "KHR" ? 100 : 0.01}
                          {...register("maxPricePerUnit", {
                            valueAsNumber: true,
                            min: {
                              value: watchedCurrencyCode === "KHR" ? 100 : 0.01,
                              message:
                                watchedCurrencyCode === "KHR"
                                  ? t("demandForm.minPriceKHR") // "Minimum price is ៛100"
                                  : t("demandForm.minPriceUSD"),
                            },
                          })}
                          placeholder={
                            watchedCurrencyCode === "USD" ? "0.00" : "0"
                          }
                          className="w-full rounded-lg border border-light-grey py-2.5 pl-7 pr-16 font-medium focus:border-primary focus:outline-none"
                        />
                        <span className="sub-title absolute right-3 top-1/2 -translate-y-1/2 font-semibold text-muted">
                          /{translateDemandUnit(t, watchedUnitType)}
                        </span>
                      </div>
                      {errors.maxPricePerUnit && (
                        <p className="sub-title mt-1 text-red-500">
                          {translateDemandFormError(t, errors.maxPricePerUnit.message)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="sub-title mb-1 block font-bold text-primary">
                        <span className="text-red-500">*</span>{" "}
                        {t("demandForm.currency")}
                      </label>
                      <Controller
                        name="currencyCode"
                        control={control}
                        render={({ field }) => (
                          <div className="flex w-full justify-between rounded-lg border border-light-grey bg-[#f4f4f5] p-1">
                            {(["USD", "KHR"] as const).map((code) => (
                              <button
                                key={code}
                                type="button"
                                disabled={isLockedDemand}
                                onClick={() =>
                                  void handleCurrencyCodeChange(code)
                                }
                                className={`sub-title flex-1 rounded-md py-1.5 font-bold transition-all ${
                                  field.value === code
                                    ? "bg-primary text-white shadow-sm"
                                    : "text-muted"
                                }`}
                              >
                                {code === "USD" ? "$ USD" : "៛ KHR"}
                              </button>
                            ))}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                  {/* Demand Level — only when creating a new demand, not editing */}
                  {!isEditMode && (
                    <div>
                      <label className="sub-title mb-1 block font-bold text-primary">
                        <span className="text-red-500">*</span>{" "}
                        {t("demandForm.demandLevel")}
                      </label>
                      <Controller
                        name="demandLevel"
                        control={control}
                        render={({ field }) => (
                          <div className="flex w-full justify-between gap-1 rounded-lg border border-light-grey bg-[#f4f4f5] p-1">
                            {(
                              [
                                ["HIGH", "demandForm.demandLevelHigh"],
                                ["MODERATE", "demandForm.demandLevelModerate"],
                                ["LOW", "demandForm.demandLevelLow"],
                              ] as const
                            ).map(([level, labelKey]) => (
                              <button
                                key={level}
                                type="button"
                                onClick={() => field.onChange(level)}
                                className={`sub-title flex-1 rounded-md py-1.5 font-bold transition-all ${
                                  field.value === level
                                    ? "bg-primary text-white shadow-sm"
                                    : "text-muted"
                                }`}
                              >
                                {t(labelKey)}
                              </button>
                            ))}
                          </div>
                        )}
                      />
                      {errors.demandLevel && (
                        <p className="sub-title mt-1 text-red-500">
                          {translateDemandFormError(t, errors.demandLevel.message)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="title mb-4 text-primary-heading">
                  {t("demandForm.pricingInventory")}
                </h3>

                <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                  {/* {t("demandForm.deliveryDate")} Field */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="expected-delivery-date"
                      className="sub-title mb-1.5 block font-bold text-muted"
                    >
                      <span className="text-red-500">*</span>{" "}
                      {t("demandForm.deliveryDate")}
                    </label>
                    <Controller
                      name="expectedDeliveryDate"
                      control={control}
                      render={({ field }) => (
                        <DatePickerComponent
                          key={field.value ?? "empty-delivery-date"}
                          id="expected-delivery-date"
                          label={t("demandForm.expectedDeliveryDate")}
                          value={field.value ?? ""}
                          minDate={today}
                          disabled={isLockedDemand}
                          invalid={Boolean(errors.expectedDeliveryDate)}
                          onBlur={field.onBlur}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    <p
                      className={`sub-title mt-1 min-h-5 text-[13px] ${
                        errors.expectedDeliveryDate
                          ? "text-red-500"
                          : "invisible"
                      }`}
                    >
                      {errors.expectedDeliveryDate
                        ? translateDemandFormError(
                            t,
                            errors.expectedDeliveryDate.message,
                          )
                        : t("demandForm.error.noDeliveryDate")}
                    </p>
                  </div>

                  {/* {t("demandForm.location")} Field - UNCHANGED dropdown component styling */}
                  <div className="flex flex-col">
                    <label className="sub-title mb-1.5 block font-bold text-muted">
                      <span className="text-red-500">*</span>{" "}
                      {t("demandForm.location")}
                    </label>
                    {/* The negative margin wrapper cancels out the hidden empty label space inside the custom component */}
                    <div className="-mt-1">
                      <Controller
                        name="locationPreferences"
                        control={control}
                        render={({ field }) => (
                          <CustomFilterSelect
                            label=""
                            options={locationOptions}
                            disabled={isLockedDemand}
                            selected={field.value ?? ""}
                            placeholder={t("demandForm.selectLocation")}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                    <p
                      className={`sub-title mt-1 min-h-5 text-[13px] ${
                        errors.locationPreferences
                          ? "text-red-500"
                          : "invisible"
                      }`}
                    >
                      {errors.locationPreferences
                        ? translateDemandFormError(
                            t,
                            errors.locationPreferences.message,
                          )
                        : t("demandForm.error.noLocation")}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="title mb-4 text-primary-heading">
                  {t("demandForm.details")}
                </h3>
                <label className="sub-title mb-1 block font-bold text-primary">
                  {t("demandForm.productDescription")}
                </label>
                <textarea
                  {...register("description")}
                  disabled={isLockedDemand}
                  rows={5}
                  placeholder={t("demandForm.descPlaceholder")}
                  className="sub-title w-full resize-none rounded-lg border border-light-grey px-3 py-2.5 font-medium focus:border-primary focus:outline-none"
                />
                {errors.description && (
                  <p className="sub-title mt-1 text-red-500">
                    {translateDemandFormError(t, errors.description.message)}
                  </p>
                )}
              </div>

              {/* Footer Form Action Buttons Group Wrapper */}
              <div className="flex justify-end gap-3 border-t border-light-grey pt-4">
                <Link
                  href="/crop-demands-management"
                  className="sub-title rounded-lg border border-light-grey px-6 py-2.5 font-bold uppercase tracking-wider text-secondary-body hover:bg-gray-50"
                >
                  {t("demandForm.cancel")}
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || isLockedDemand}
                  className="sub-title cursor-pointer rounded-lg bg-secondary px-6 py-2.5 font-bold uppercase tracking-wider text-black shadow-sm transition-colors hover:bg-accent disabled:opacity-50"
                >
                  {isSubmitting
                    ? t("demandForm.saving")
                    : isLockedDemand
                      ? t("demandForm.demandLocked")
                      : isEditMode
                        ? t("demandForm.updateDemand")
                        : t("demandForm.createDemand")}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
