"use client";

import React, { useEffect, useMemo, useTransition, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CropDemandPost } from "@/types/crop-demand";
import { ROLES, type UserRole } from "@/constants/role";
import SubmitOfferModal, {
  OfferFormValues,
} from "../_components/listing-crop/FormFarmerOfferComponent";
import FarmerCardOfferComponent from "./FarmerCardOfferComponent";
import {
  createFarmerOfferAction,
  deleteFarmerOfferAction,
  updateFarmerOfferAction,
} from "@/action/farmer-offer.action";
import { deleteCropDemandAction } from "@/action/crop-demand.action";
import { fetchTranslations } from "@/action/translation.action";
import { showApiError, showApiSuccess, showApiToast } from "@/lib/apiToast";
import {
  BadgeInfo,
  MessageSquarePlus,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import type { FarmerOfferItem } from "@/types/farmer-offer";
import type { Pagination } from "@/types/crop-demand";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import BreadcrumbNav from "@/components/navigation/BreadcrumbNav";
import { getFileUrl } from "@/utils/getFileUrl";
import { useI18n } from "@/lib/i18n/I18nContext";
import PaginationComponent from "@/components/action-components/PaginationComponent";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CropDemandDetailsProps {
  data: CropDemandPost;
  role?: UserRole | null;
  currentUserId?: string | null;
  farmerOffers?: FarmerOfferItem[];
  offerPagination?: Pagination;
  myOffer?: FarmerOfferItem | null;
  isVerifiedIdentity?: boolean;
  verificationStatus?: string;
  rejectionReason?: string | null;
}

type EndpointLanguage = "eng" | "kh";

const DYNAMIC_DEMAND_DETAILS_TRANSLATION_CACHE = new Map<string, string>();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
  "Yellow Maize": { en: "Yellow Maize", kh: "ពោតលឿង" },
  Soybean: { en: "Soybean", kh: "សណ្តែកសៀង" },
  Sugarcane: { en: "Sugarcane", kh: "អំពៅ" },
  Rubber: { en: "Rubber", kh: "កៅស៊ូ" },
  "Arabica Coffee": { en: "Arabica Coffee", kh: "កាហ្វេអារ៉ាប៊ីកា" },
  "Jasmine Rice": { en: "Jasmine Rice", kh: "ស្រូវផ្កាម្លិះ" },
  "Brown Rice": { en: "Brown Rice", kh: "អង្ករសម្រូប" },
  "Sen Kra Ob Rice": { en: "Sen Kra Ob Rice", kh: "ស្រូវសែនក្រអូប" },
  "Phka Rumduol Rice": { en: "Phka Rumduol Rice", kh: "ស្រូវផ្ការំដួល" },
  "Phkar Romdoul": { en: "Phkar Romdoul", kh: "ផ្ការំដួល" },
  "Phka Romdoul": { en: "Phka Romdoul", kh: "ផ្ការំដួល" },
  Cassava: { en: "Cassava", kh: "ដំឡូងមី" },
  Taro: { en: "Taro", kh: "ដំឡូងតារ៉ូ" },
  Garlic: { en: "Garlic", kh: "ខ្ទឹមស" },
  Turmeric: { en: "Turmeric", kh: "រមៀត" },
} as const;

const DEMAND_DETAILS_TEXT = {
  "demandDetails.notAvailable": { en: "N/A", kh: "មិនមាន" },

  "demandDetails.cropDemands": { en: "Crop Demands", kh: "តម្រូវការកសិផល" },
  "demandDetails.loading": { en: "Loading...", kh: "កំពុងផ្ទុក..." },
  "demandDetails.cropDemandImage": {
    en: "Crop Demand image",
    kh: "រូបភាពតម្រូវការកសិផល",
  },
  "demandDetails.cropPreview": {
    en: "Crop preview {index}",
    kh: "រូបភាពមើលជាមុនទី {index}",
  },
  "demandDetails.offerProposed": {
    en: "Offer proposed",
    kh: "សំណើត្រូវបានដាក់",
  },
  "demandDetails.offerUpdated": {
    en: "Offer updated",
    kh: "សំណើត្រូវបានកែប្រែ",
  },
  "demandDetails.offerSent": {
    en: "Your offer has been sent.",
    kh: "សំណើរបស់អ្នកត្រូវបានផ្ញើរួចហើយ។",
  },
  "demandDetails.offerUpdatedMessage": {
    en: "Your offer has been updated.",
    kh: "សំណើរបស់អ្នកត្រូវបានកែប្រែរួចហើយ។",
  },
  "demandDetails.offerDeleted": { en: "Offer deleted", kh: "សំណើត្រូវបានលុប" },
  "demandDetails.offerDeletedMessage": {
    en: "Your offer has been removed.",
    kh: "សំណើរបស់អ្នកត្រូវបានលុបរួចហើយ។",
  },
  "demandDetails.cropDemandDeleted": {
    en: "Crop demand deleted",
    kh: "តម្រូវការកសិផលត្រូវបានលុប",
  },
  "demandDetails.cropDemandDeletedMessage": {
    en: "The demand post has been removed.",
    kh: "ប្រកាសតម្រូវការត្រូវបានលុបរួចហើយ។",
  },
  "demandDetails.deleteFailed": { en: "Delete failed", kh: "ការលុបបរាជ័យ" },
  "demandDetails.offerDeleteFailed": {
    en: "Failed to delete offer.",
    kh: "មិនអាចលុបសំណើបានទេ។",
  },
  "demandDetails.cropDemandDeleteFailed": {
    en: "Failed to delete crop demand.",
    kh: "មិនអាចលុបតម្រូវការកសិផលបានទេ។",
  },
  "demandDetails.offerUpdateFailed": {
    en: "Failed to update farmer offer.",
    kh: "មិនអាចកែប្រែសំណើរបស់កសិករបានទេ។",
  },
  "demandDetails.offerCreateFailed": {
    en: "Failed to propose farmer offer.",
    kh: "មិនអាចដាក់សំណើរបស់កសិករបានទេ។",
  },
  "demandDetails.noOfferId": {
    en: "No offer id found.",
    kh: "រកមិនឃើញលេខសម្គាល់សំណើទេ។",
  },
  "demandDetails.noDemandId": {
    en: "No demand id found for this post.",
    kh: "រកមិនឃើញលេខសម្គាល់តម្រូវការសម្រាប់ប្រកាសនេះទេ។",
  },
  "demandDetails.noDemandPostId": {
    en: "No demand post id found for this post.",
    kh: "រកមិនឃើញលេខសម្គាល់ប្រកាសតម្រូវការនេះទេ។",
  },
  "demandDetails.status.OPEN": { en: "OPEN", kh: "បើក" },
  "demandDetails.status.MATCHED": { en: "MATCHED", kh: "បានផ្គូផ្គង" },
  "demandDetails.status.CLOSED": { en: "CLOSED", kh: "បានបិទ" },
  "demandDetails.status.EXPIRED": { en: "EXPIRED", kh: "ផុតកំណត់" },
  "demandDetails.demandLevel.HIGH": { en: "HIGH DEMAND", kh: "តម្រូវការខ្ពស់" },
  "demandDetails.demandLevel.MODERATE": {
    en: "MODERATE DEMAND",
    kh: "តម្រូវការមធ្យម",
  },
  "demandDetails.demandLevel.LOW": { en: "LOW DEMAND", kh: "តម្រូវការទាប" },
  "demandDetails.unit.KG": { en: "KG", kh: "គីឡូក្រាម" },
  "demandDetails.unit.TON": { en: "TON", kh: "តោន" },
  "demandDetails.unit.TONS": { en: "TON", kh: "តោន" },
  "demandDetails.cropType.Rice Crops": { en: "Rice Crops", kh: "ដំណាំស្រូវ" },
  "demandDetails.cropType.Fruits": { en: "Fruits", kh: "ផ្លែឈើ" },
  "demandDetails.cropType.Fruit": { en: "Fruit", kh: "ផ្លែឈើ" },
  "demandDetails.cropType.Vegetables": { en: "Vegetables", kh: "បន្លែ" },
  "demandDetails.cropType.Vegetable": { en: "Vegetable", kh: "បន្លែ" },
  "demandDetails.cropType.Grains": { en: "Grains", kh: "ធញ្ញជាតិ" },
  "demandDetails.cropType.Grain": { en: "Grain", kh: "ធញ្ញជាតិ" },
  "demandDetails.cropType.Root Crops": { en: "Root Crops", kh: "ដំណាំមើម" },
  "demandDetails.cropType.Root Crop": { en: "Root Crop", kh: "ដំណាំមើម" },
  "demandDetails.cropType.Industrial Crops": { en: "Industrial Crops", kh: "ដំណាំឧស្សាហកម្ម"},
  "demandDetails.cropType.Fiber Crops": {en: "Fiber Crops", kh: "ដំណាំសរសៃ"},
  "demandDetails.cropType.Herbs": { en: "Herbs", kh: "រុក្ខជាតិឱសថ" },
  "demandDetails.cropType.Herb": { en: "Herb", kh: "រុក្ខជាតិឱសថ" },
  "demandDetails.cropType.Spices": { en: "Spices", kh: "គ្រឿងទេស" },
  "demandDetails.cropType.Spice": { en: "Spice", kh: "គ្រឿងទេស" },
  "demandDetails.cropType.Nuts": { en: "Nuts", kh: "គ្រាប់ធញ្ញជាតិ" },
  "demandDetails.cropType.Nut": { en: "Nut", kh: "គ្រាប់ធញ្ញជាតិ" },
  "demandDetails.cropType.Legumes": { en: "Legumes", kh: "ដំណាំសណ្តែក" },
  "demandDetails.cropType.Legume": { en: "Legume", kh: "ដំណាំសណ្តែក" },
  "demandDetails.premiumBuyer": { en: "Premium Buyer", kh: "អ្នកទិញពិសេស" },
  "demandDetails.rejectWithReason": {
    en: "Your identity document was rejected: {reason}. Please upload again and wait for approval.",
    kh: "ឯកសារអត្តសញ្ញាណរបស់អ្នកត្រូវបានបដិសេធ៖ {reason}។ សូមបង្ហោះម្តងទៀត ហើយរង់ចាំការអនុម័ត។",
  },
  "demandDetails.rejectedApply": {
    en: "Your identity document was rejected. Please upload again and wait for approval.",
    kh: "ឯកសារអត្តសញ្ញាណរបស់អ្នកត្រូវបានបដិសេធ។ សូមបង្ហោះម្តងទៀត ហើយរង់ចាំការអនុម័ត។",
  },
  "demandDetails.pendingApply": {
    en: "Your identity document is under review. Please wait for approval before applying.",
    kh: "ឯកសារអត្តសញ្ញាណរបស់អ្នកកំពុងត្រូវបានពិនិត្យ។ សូមរង់ចាំការអនុម័ត មុនពេលដាក់សំណើ។",
  },
  "demandDetails.verifyApply": {
    en: "Please verify your identity document before applying to demands.",
    kh: "សូមផ្ទៀងផ្ទាត់ឯកសារអត្តសញ្ញាណរបស់អ្នក មុនពេលដាក់សំណើទៅតម្រូវការ។",
  },
  "demandDetails.rejectContactWithReason": {
    en: "Your identity document was rejected: {reason}. Please upload again before contacting a farmer.",
    kh: "ឯកសារអត្តសញ្ញាណរបស់អ្នកត្រូវបានបដិសេធ៖ {reason}។ សូមបង្ហោះម្តងទៀត មុនពេលទាក់ទងកសិករ។",
  },
  "demandDetails.rejectedContact": {
    en: "Your identity document was rejected. Please upload again before contacting a farmer.",
    kh: "ឯកសារអត្តសញ្ញាណរបស់អ្នកត្រូវបានបដិសេធ។ សូមបង្ហោះម្តងទៀត មុនពេលទាក់ទងកសិករ។",
  },
  "demandDetails.pendingContact": {
    en: "Your identity document is under review. Please wait before contacting a farmer.",
    kh: "ឯកសារអត្តសញ្ញាណរបស់អ្នកកំពុងត្រូវបានពិនិត្យ។ សូមរង់ចាំ មុនពេលទាក់ទងកសិករ។",
  },
  "demandDetails.verifyContact": {
    en: "Please verify your identity document before contacting a farmer.",
    kh: "សូមផ្ទៀងផ្ទាត់ឯកសារអត្តសញ្ញាណរបស់អ្នក មុនពេលទាក់ទងកសិករ។",
  },
  "demandDetails.cropName": { en: "Crop Name", kh: "ឈ្មោះដំណាំ" },
  "demandDetails.cropType": { en: "Crop Type", kh: "ប្រភេទដំណាំ" },
  "demandDetails.price": { en: "Price", kh: "តម្លៃ" },
  "demandDetails.quantityNeeded": {
    en: "Quantity Needed",
    kh: "បរិមាណត្រូវការ",
  },
  "demandDetails.expectedDeliveryDate": {
    en: "Expected Delivery Date",
    kh: "កាលបរិច្ឆេទដឹកជញ្ជូនរំពឹងទុក",
  },
  "demandDetails.locationPreference": {
    en: "Location Preference",
    kh: "ទីតាំងដែលចង់បាន",
  },
  "demandDetails.updateFailed": {
    en: "Update failed",
    kh: "កែប្រែមិនបានសម្រេច",
  },
  "demandDetails.proposeFailed": {
    en: "Propose failed",
    kh: "ដាក់សំណើមិនបានសម្រេច",
  },
  "demandDetails.home": { en: "Home", kh: "ទំព័រដើម" },
  "demandDetails.title": { en: "Demand Details", kh: "លម្អិតតម្រូវការ" },
  "demandDetails.postedBy": { en: "Posted by:", kh: "បានប្រកាសដោយ៖" },
  "demandDetails.postedOn": { en: "Posted on:", kh: "បានប្រកាសនៅ៖" },
  "demandDetails.descriptionRequirement": {
    en: "Description & Requirement",
    kh: "ការពិពណ៌នា និងតម្រូវការ",
  },
  "demandDetails.noDescription": {
    en: "No description provided.",
    kh: "មិនមានការពិពណ៌នា។",
  },
  "demandDetails.updateDemand": { en: "Update Demand", kh: "កែប្រែតម្រូវការ" },
  "demandDetails.deleteDemand": { en: "Delete Demand", kh: "លុបតម្រូវការ" },
  "demandDetails.deleting": { en: "Deleting...", kh: "កំពុងលុប..." },
  "demandDetails.proposeCropOffer": {
    en: "Propose Crop Offer",
    kh: "ដាក់សំណើដំណាំ",
  },
  "demandDetails.closedMessage": {
    en: "This crop demand has been closed or matched. No new proposals are permitted.",
    kh: "តម្រូវការដំណាំនេះត្រូវបានបិទ ឬផ្គូផ្គងរួចហើយ។ មិនអនុញ្ញាតឱ្យដាក់សំណើថ្មីទេ។",
  },
  "demandDetails.yourOffered": { en: "Your Offered", kh: "សំណើរបស់អ្នក" },
  "demandDetails.submitted": { en: "Submitted", kh: "បានដាក់ស្នើ" },
  "demandDetails.myOfferDesc": {
    en: "Review the proposal you submitted for this crop demand.",
    kh: "ពិនិត្យសំណើដែលអ្នកបានដាក់សម្រាប់តម្រូវការដំណាំនេះ។",
  },
  "demandDetails.updateOffer": { en: "Update Offer", kh: "កែប្រែសំណើ" },
  "demandDetails.deleteOffer": { en: "Delete Offer", kh: "លុបសំណើ" },
  "demandDetails.incomingOffers": {
    en: "Incoming Farmer Offers",
    kh: "សំណើពីកសិករ",
  },
  "demandDetails.incomingDesc": {
    en: "Compare harvest proposals and proceed with secure contract discussions.",
    kh: "ប្រៀបធៀបសំណើប្រមូលផល ហើយបន្តពិភាក្សាកិច្ចសន្យាដោយសុវត្ថិភាព។",
  },
  "demandDetails.offerReceived": { en: "offer received", kh: "សំណើបានទទួល" },
  "demandDetails.offersReceived": { en: "offers received", kh: "សំណើបានទទួល" },
  "demandDetails.noOffers": {
    en: "No offers received yet.",
    kh: "មិនទាន់មានសំណើទេ។",
  },
  "demandDetails.showing": {
    en: "Showing {start}-{end} of {total}",
    kh: "បង្ហាញ {start}-{end} នៃ {total}",
  },
  "demandDetails.previous": { en: "Previous", kh: "មុន" },
  "demandDetails.next": { en: "Next", kh: "បន្ទាប់" },
  "demandDetails.cancel": { en: "Cancel", kh: "បោះបង់" },
  "demandDetails.deleteDemandTitle": {
    en: "Delete this demand?",
    kh: "លុបតម្រូវការនេះឬ?",
  },
  "demandDetails.deleteDemandDesc": {
    en: "This action cannot be undone. Farmers will no longer be able to view or submit offers for this crop demand.",
    kh: "សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។ កសិករនឹងមិនអាចមើល ឬដាក់សំណើសម្រាប់តម្រូវការនេះទៀតទេ។",
  },
  "demandDetails.deleteOfferTitle": {
    en: "Delete this offer?",
    kh: "លុបសំណើនេះឬ?",
  },
  "demandDetails.deleteOfferDesc": {
    en: "Your proposal for {cropName} will be removed permanently. This action cannot be undone.",
    kh: "សំណើរបស់អ្នកសម្រាប់ {cropName} នឹងត្រូវបានលុបជាអចិន្ត្រៃយ៍។ សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។",
  },
  "demandDetails.delete": { en: "Delete", kh: "លុប" },
  "demandDetails.close": { en: "Close", kh: "បិទ" },
  "demandDetails.closeDeleteOffer": {
    en: "Close delete offer confirmation",
    kh: "បិទការបញ្ជាក់លុបសំណើ",
  },
} as const;

function getDemandDetailsText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  return (key: string, values?: Record<string, string | number>): string => {
    let text: string =
      DEMAND_DETAILS_TEXT[key as keyof typeof DEMAND_DETAILS_TEXT]?.[lang] ??
      key;

    if (values) {
      Object.entries(values).forEach(([name, value]) => {
        text = text.replaceAll(`{${name}}`, String(value));
      });
    }

    return text;
  };
}


function translateCropName(cropName?: string | null, language = "en") {
  if (!cropName) return "";

  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  return (
    CROP_NAME_TEXT[cropName as keyof typeof CROP_NAME_TEXT]?.[lang] ?? cropName
  );
}

function hasCropNameTranslation(cropName?: string | null) {
  if (!cropName) return false;

  return cropName in CROP_NAME_TEXT;
}

function translateDynamicText(
  t: (key: string, values?: Record<string, string | number>) => string,
  prefix: string,
  value?: string | null,
) {
  if (!value) return t("demandDetails.notAvailable");

  const key = `${prefix}.${value}`;
  const translated = t(key);

  return translated === key ? value : translated;
}

function translateUnit(
  t: (key: string, values?: Record<string, string | number>) => string,
  unit?: string | null,
) {
  return translateDynamicText(t, "demandDetails.unit", unit);
}

function translateCropType(
  t: (key: string, values?: Record<string, string | number>) => string,
  cropType?: string | null,
) {
  return translateDynamicText(t, "demandDetails.cropType", cropType);
}

const DECORATIVE_IMAGE_PATHS = new Set([
  "/assets/srov.png",
  "/assets/srov2.png",
]);

function toImageSrc(url: string) {
  return getFileUrl(url);
}

function isDemandGalleryImage(url: string) {
  try {
    const parsedUrl = new URL(url, "http://local");
    return !DECORATIVE_IMAGE_PATHS.has(parsedUrl.pathname);
  } catch {
    return !DECORATIVE_IMAGE_PATHS.has(url);
  }
}

function normalizeImageUrls(imageUrls?: string | string[]) {
  const urls = Array.isArray(imageUrls)
    ? imageUrls
    : imageUrls
      ? [imageUrls]
      : [];
  const validUrls = urls
    .map((url) => (typeof url === "string" ? url.trim() : ""))
    .filter((url) => url.length > 0)
    .map(toImageSrc)
    .filter((url) => url && isDemandGalleryImage(url));
  return validUrls.length > 0 ? validUrls : [FALLBACK_CROP_IMAGE];
}

function formatLocationName(
  location?: string,
  fallback = "N/A",
  language = "en",
) {
  const locationName = location?.trim();

  if (!locationName) return fallback;

  const PROVINCE_TEXT: Record<string, { en: string; kh: string }> = {
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
  };

  const lang = language === "kh" ? "kh" : "en";

  return locationName
    .split(",")
    .map((part) => {
      const key = part.trim().toUpperCase().replaceAll(" ", "_");
      return PROVINCE_TEXT[key]?.[lang] ?? part.trim();
    })
    .filter(Boolean)
    .join(", ");
}

function formatDate(dateValue?: string, language = "en", fallback = "N/A") {
  if (!dateValue) return fallback;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat(language === "kh" ? "km-KH" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
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

function useDynamicDemandDetailsTranslations(
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
        !DYNAMIC_DEMAND_DETAILS_TRANSLATION_CACHE.has(
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
              DYNAMIC_DEMAND_DETAILS_TRANSLATION_CACHE.set(
                cacheKey,
                translatedValue,
              );
            }

            return [key, translatedValue] as const;
          } catch (error) {
            console.error("Failed to translate crop demand details text:", error);
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
      const cachedValue = DYNAMIC_DEMAND_DETAILS_TRANSLATION_CACHE.get(cacheKey);
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CropDemandDetails({
  data,
  role,
  currentUserId = null,
  farmerOffers = [],
  offerPagination,
  myOffer = null,
  isVerifiedIdentity = false,
  verificationStatus,
  rejectionReason,
}: CropDemandDetailsProps) {
  const router = useRouter();
  const { language } = useI18n();
  const t = getDemandDetailsText(language);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOfferOpen, setIsDeleteOfferOpen] = useState(false);
  const [isDeletingOffer, setIsDeletingOffer] = useState(false);
  const [isDeleteDemandOpen, setIsDeleteDemandOpen] = useState(false);
  const [isDeletingDemand, setIsDeletingDemand] = useState(false);
  const [isOfferRefreshPending, startOfferRefreshTransition] = useTransition();

  const imageGallery = normalizeImageUrls(data?.imageUrls);
  // Replace the existing activeImage state
  const [galleryOrder, setGalleryOrder] = useState<string[]>(imageGallery);

  const handleThumbnailClick = (clickedImg: string) => {
    setGalleryOrder((prev) => {
      const newOrder = [...prev];
      const clickedIndex = newOrder.indexOf(clickedImg);
      // Swap clicked image with the first (main) image
      [newOrder[0], newOrder[clickedIndex]] = [
        newOrder[clickedIndex],
        newOrder[0],
      ];
      return newOrder;
    });
  };

  const rawTitle = data.title?.trim() || t("demandDetails.title");
  const rawDescription = data.description?.trim() || "";
  const rawBuyerName =
    data.buyerName?.trim() || data.createdBy?.trim() || t("demandDetails.premiumBuyer");
  const rawCropName = data.cropName?.trim() || "";
  const rawCropType =
    data.cropTypeName?.trim() || data.cropType?.trim() || t("demandDetails.notAvailable");
  const rawLocationPreference = data.locationPreferences?.trim() || "";

  const fallbackCropName = translateCropName(rawCropName, language);
  const fallbackCropType = translateCropType(t, rawCropType);
  const fallbackLocationPreference = formatLocationName(
    rawLocationPreference,
    t("demandDetails.notAvailable"),
    language,
  );

  const dynamicTranslationMessages = useMemo(
    () =>
      compactTranslationMessages({
        title: rawTitle,
        description: rawDescription,
        buyerName: rawBuyerName,
        cropName: rawCropName,
        cropType: rawCropType,
        locationPreference: rawLocationPreference,
      }),
    [
      rawBuyerName,
      rawCropName,
      rawCropType,
      rawDescription,
      rawLocationPreference,
      rawTitle,
    ],
  );
  const dynamicTranslations = useDynamicDemandDetailsTranslations(
    dynamicTranslationMessages,
    language,
  );

  const title = dynamicTranslations.title || rawTitle;
  const description = dynamicTranslations.description || rawDescription;
  const buyerName = dynamicTranslations.buyerName || rawBuyerName;
  const cropName = hasCropNameTranslation(rawCropName)
    ? fallbackCropName
    : dynamicTranslations.cropName || fallbackCropName;
  const cropType = dynamicTranslations.cropType || fallbackCropType;
  const locationPreference =
    dynamicTranslations.locationPreference || fallbackLocationPreference;
  // Government acts as a buyer on crop demands: it can post demands, review
  // incoming farmer offers, and contact farmers via those offers.
  const isBuyer = role === ROLES.BUYER || role === ROLES.GOVERNMENT;
  const isFarmer = role === ROLES.FARMER;
  const isOwner =
    isBuyer &&
    Boolean(currentUserId) &&
    [data.buyerId, data.userId, data.createdById, data.createdBy].some(
      (id) => id && id === currentUserId,
    );
  const isOpen = data.status === "OPEN";
  const remainingQuantity = Math.max(0, data.quantityNeeded ?? 0);
  const unitLabel = translateUnit(t, data.unitType);
  const canReceiveOffers = isOpen && remainingQuantity > 0;
  const normalizedVerificationStatus = String(
    verificationStatus ?? "",
  ).toUpperCase();

  const verificationMessage =
    normalizedVerificationStatus === "REJECTED"
      ? rejectionReason
        ? t("demandDetails.rejectWithReason", { reason: rejectionReason })
        : t("demandDetails.rejectedApply")
      : normalizedVerificationStatus === "PENDING"
        ? t("demandDetails.pendingApply")
        : t("demandDetails.verifyApply");

  const chatLockedMessage =
    normalizedVerificationStatus === "REJECTED"
      ? rejectionReason
        ? t("demandDetails.rejectContactWithReason", {
            reason: rejectionReason,
          })
        : t("demandDetails.rejectedContact")
      : normalizedVerificationStatus === "PENDING"
        ? t("demandDetails.pendingContact")
        : t("demandDetails.verifyContact");

  const demandId = data.cropDemandPostId || data.postId || "";
  const demandPostId = data.postId || undefined;
  const offerId = myOffer?.farmerOfferId;
  const hasMyOffer = Boolean(offerId);
  const offerPage = offerPagination?.page ?? 1;
  const offerTotalPages = Math.max(1, offerPagination?.totalPages ?? 1);
  const offerTotalElements =
    offerPagination?.totalElements ?? farmerOffers.length;

  const handleOfferPageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("offersPage", String(page));
    router.push(`?${params.toString()}`, { scroll: false });
  };

  useBodyScrollLock(isModalOpen || isDeleteDemandOpen || isDeleteOfferOpen);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="animate-pulse text-lg font-bold text-muted">
          {t("demandDetails.loading")}
        </p>
      </div>
    );
  }

  const statusClass =
    data.status === "CLOSED"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-emerald-50 text-primary border-emerald-200";

  const demandLevelClass =
    data.demandLevel === "HIGH"
      ? "bg-red-50 text-red-700 border-red-200"
      : data.demandLevel === "MODERATE"
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : "bg-gray-100 text-gray-700 border-gray-200";

  const detailRows = [
    {
      label: t("demandDetails.cropName"),
      value: cropName || t("demandDetails.notAvailable"),
      highlight: true,
    },
    { label: t("demandDetails.cropType"), value: cropType, highlight: true },
    {
      label: t("demandDetails.price"),
      value: `${data.currencyCode === "KHR" ? "KHR " : "$ "}${(
        data.maxPricePerUnit ?? 0
      ).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      suffix: `/${unitLabel}`,
      highlight: true,
      large: true,
    },
    {
      label: t("demandDetails.quantityNeeded"),
      value: `${remainingQuantity.toLocaleString()}`,
      suffix: unitLabel,
      highlight: true,
    },
    {
      label: t("demandDetails.expectedDeliveryDate"),
      value: formatDate(
        data.expectedDeliveryDate,
        language,
        t("demandDetails.notAvailable"),
      ),
      highlight: true,
    },
    {
      label: t("demandDetails.locationPreference"),
value: locationPreference,
      highlight: true,
    },
  ];

  const existingOfferData: Partial<OfferFormValues> = {
    currencyCode: (myOffer?.currencyCode ?? data.currencyCode ?? "KHR") as
      "KHR" | "USD",
    proposedPrice: myOffer?.proposedPricePerUnit ?? data.maxPricePerUnit,
    offeredQuantity: myOffer?.offeredQuantity ?? remainingQuantity,
    unitType: data.unitType === "TONS" ? "TON" : "KG",
    deliveryDate: myOffer?.estimatedDeliveryDate
      ? myOffer.estimatedDeliveryDate.split("T")[0]
      : data.expectedDeliveryDate
        ? data.expectedDeliveryDate.split("T")[0]
        : "",
    message: myOffer?.message ?? "",
  };

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleUpdateSubmission = async (formData: OfferFormValues) => {
    if (!demandId) {
      showApiError(new Error(t("demandDetails.noDemandId")));
      return;
    }

    const payload = {
      currencyCode: formData.currencyCode,
      proposedPricePerUnit: formData.proposedPrice,
      offeredQuantity: formData.offeredQuantity,
      estimatedDeliveryDate: formData.deliveryDate,
      message: formData.message ?? "",
    };

    const result = offerId
      ? await updateFarmerOfferAction(offerId, payload, demandId)
      : await createFarmerOfferAction(demandId, payload);

    if (!result.success) {
      showApiToast(result, {
        successTitle: offerId
          ? t("demandDetails.offerUpdated")
          : t("demandDetails.offerProposed"),
        errorTitle: offerId
          ? t("demandDetails.updateFailed")
          : t("demandDetails.proposeFailed"),
        errorMessage: offerId
          ? t("demandDetails.offerUpdateFailed")
          : t("demandDetails.offerCreateFailed"),
      });
      return;
    }

    showApiSuccess(
      offerId
        ? t("demandDetails.offerUpdated")
        : t("demandDetails.offerProposed"),
      offerId
        ? t("demandDetails.offerUpdatedMessage")
        : t("demandDetails.offerSent"),
    );
    setIsModalOpen(false);
    startOfferRefreshTransition(() => {
      router.refresh();
    });
  };

  const handleDeleteOffer = async () => {
    if (!offerId) {
      showApiError(new Error(t("demandDetails.noOfferId")));
      return;
    }
    setIsDeletingOffer(true);
    const result = await deleteFarmerOfferAction(offerId, demandId);
    setIsDeletingOffer(false);

    if (!result.success) {
      showApiToast(result, {
        successTitle: t("demandDetails.offerDeleted"),
        errorTitle: t("demandDetails.deleteFailed"),
        errorMessage: t("demandDetails.offerDeleteFailed"),
      });
      return;
    }

    showApiSuccess(
      t("demandDetails.offerDeleted"),
      t("demandDetails.offerDeletedMessage"),
    );
    setIsDeleteOfferOpen(false);
    startOfferRefreshTransition(() => {
      router.refresh();
    });
  };

  const handleDeleteDemand = async () => {
    if (!demandPostId) {
      showApiError(new Error(t("demandDetails.noDemandPostId")));
      setIsDeleteDemandOpen(false);
      return;
    }

    setIsDeletingDemand(true);
    const result = await deleteCropDemandAction(demandPostId);
    setIsDeletingDemand(false);
    setIsDeleteDemandOpen(false);
    if (!result.success) {
      showApiToast(result, {
        successTitle: t("demandDetails.cropDemandDeleted"),
        errorTitle: t("demandDetails.deleteFailed"),
        errorMessage: t("demandDetails.cropDemandDeleteFailed"),
      });
      return;
    }

    showApiSuccess(
      t("demandDetails.cropDemandDeleted"),
      t("demandDetails.cropDemandDeletedMessage"),
    );
    router.push("/crop-demands-management");
    router.refresh();
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div
      className={`relative min-h-screen overflow-x-hidden bg-[#fbf6e9] pb-14 pt-4 sm:pb-20 sm:pt-6 ${fontClass}`}
    >
      <div className="pointer-events-none absolute right-0 top-[10%] z-0 h-[clamp(240px,32vw,480px)] w-[clamp(240px,32vw,480px)] translate-x-1/2 rounded-full bg-amber-300 opacity-15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[4%] left-0 z-0 h-[clamp(240px,32vw,480px)] w-[clamp(240px,32vw,480px)] -translate-x-1/2 rounded-full bg-yellow-300 opacity-15 blur-3xl" />
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

      <div className="relative z-10 mx-auto max-w-6xl px-3 py-5 sm:px-4 sm:py-6">
        <BreadcrumbNav
          className="mb-6 max-w-none py-0 font-semibold sm:mb-8"
          currentClassName="max-w-full truncate font-semibold text-emerald-800 sm:max-w-80"
          items={[
            { label: t("demandDetails.home"), href: "/" },
            {
              label: t("demandDetails.cropDemands"),
              href: "/listing-crop-demands",
            },
            { label: title },
          ]}
        />

        {/* Header */}
        <div className="mb-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass}`}
            >
              {translateDynamicText(t, "demandDetails.status", data.status)}
            </span>

            {data.demandLevel && (
              <span
                className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${demandLevelClass}`}
              >
                {translateDynamicText(
                  t,
                  "demandDetails.demandLevel",
                  data.demandLevel,
                )}
              </span>
            )}
          </div>

          <h1 className="max-w-5xl text-2xl font-bold leading-tight tracking-tight text-primary-heading sm:text-3xl">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-[#667085]">
            <span>{t("demandDetails.postedBy")}</span>
            <span className="font-semibold text-[#667085]">{buyerName}</span>
            <span className="hidden sm:inline">&bull;</span>
            <span>{t("demandDetails.postedOn")}</span>
            <span className="font-semibold text-[#667085]">
              {formatDate(
                data.createdAt,
                language,
                t("demandDetails.notAvailable"),
              )}
            </span>
          </div>

          <div className="hidden flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-muted">
            <span>{t("demandDetails.postedBy")}</span>
            <span className="font-semibold text-dark-grey">{buyerName}</span>
            <span className="hidden sm:inline">•</span>
            <span>{t("demandDetails.postedOn")}</span>
            <span className="font-semibold text-dark-grey">
              {formatDate(
                data.createdAt,
                language,
                t("demandDetails.notAvailable"),
              )}
            </span>
          </div>
        </div>

        {/* Content split */}
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* Left panel */}
          <div className="space-y-5">
            {/* Main image — always galleryOrder[0] */}
            <div className="relative aspect-[16/9] min-h-48 overflow-hidden rounded-lg bg-white shadow-sm sm:aspect-[16/8.2] sm:min-h-60">
              <Image
                src={galleryOrder[0]}
                alt={cropName || t("demandDetails.cropDemandImage")}
                fill
                sizes="(max-width: 1024px) 100vw, 760px"
                className="object-cover object-center"
                priority
              />
            </div>

            {/* Thumbnail strip */}
            {galleryOrder.length > 1 && (
              <div className="grid h-18 grid-cols-4 gap-2 sm:h-28 sm:gap-3">
                {galleryOrder.slice(1).map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    onClick={() => handleThumbnailClick(img)}
                    className="relative overflow-hidden rounded-md bg-white shadow-sm transition-all hover:ring-2 hover:ring-primary/20 active:scale-95"
                  >
                    <Image
                      src={img}
                      alt={t("demandDetails.cropPreview", { index: index + 1 })}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="rounded-lg bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-3 flex items-center gap-2">
                <BadgeInfo size={17} className="text-primary" />
                <h2 className="text-base font-bold text-primary-heading">
                  {t("demandDetails.descriptionRequirement")}
                </h2>
              </div>

              <p className="whitespace-pre-line text-sm leading-relaxed text-secondary-body sm:text-[15px]">
                {description || t("demandDetails.noDescription")}
              </p>
            </div>

            {/* Action buttons */}
            {(isOwner || isFarmer) &&
              !(isFarmer && (hasMyOffer || isOfferRefreshPending)) && (
                <div className="flex w-full flex-col gap-3 sm:flex-row">
                  {isOwner && canReceiveOffers ? (
                    <>
                      <Link
                        href={
                          demandPostId
                            ? `/crop-demands-edit/${demandPostId}`
                            : "/crop-demands-management"
                        }
                        className="flex w-full flex-1 items-center justify-center rounded-xl bg-secondary px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-dark-grey shadow-sm transition-all duration-300 hover:bg-secondary/90 active:scale-95"
                      >
                        {t("demandDetails.updateDemand")}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setIsDeleteDemandOpen(true)}
                        disabled={isDeletingDemand}
                        className="w-full flex-1 rounded-xl border border-[#B81C1C]/25 bg-[#B81C1C] py-3.5 text-center text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all duration-300 hover:bg-[#9F1717] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isDeletingDemand
                          ? t("demandDetails.deleting")
                          : t("demandDetails.deleteDemand")}
                      </button>
                    </>
                  ) : isOwner ? (
                    <div className="flex w-full items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <p className="text-[12px] font-bold leading-relaxed text-amber-800">
                        {t("demandDetails.closedMessage")}
                      </p>
                    </div>
                  ) : isFarmer && !isVerifiedIdentity ? (
                    <div className="flex w-full items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <p className="text-[12px] font-bold leading-relaxed text-amber-800">
                        {verificationMessage}
                      </p>
                    </div>
                  ) : isFarmer && canReceiveOffers && !hasMyOffer ? (
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[12px] font-extrabold uppercase tracking-wider text-white shadow-md shadow-primary/15 transition hover:bg-primary/90 active:scale-[0.98] sm:w-auto sm:min-w-70"
                    >
                      <MessageSquarePlus className="h-4 w-4" />{" "}
                      {t("demandDetails.proposeCropOffer")}
                    </button>
                  ) : (
                    <div className="flex w-full items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <p className="text-[12px] font-bold leading-relaxed text-amber-800">
                        {t("demandDetails.closedMessage")}
                      </p>
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* Right panel — Specifications sidebar */}
          <aside className="w-full min-w-0 shrink-0 rounded-2xl bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-6">
            <h2 className="mb-3 text-base font-bold text-primary-heading">
              {t("demandDetails.title")}
            </h2>

            <div className="divide-y divide-light-grey">
              {detailRows.map((row) => (
                <div key={row.label} className="py-4 first:pt-2 last:pb-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    {row.label}
                  </p>
                  <p
                    className={`mt-1 break-words leading-tight ${
                      row.highlight ? "text-primary" : "text-primary-heading"
                    } ${row.large ? "text-xl font-black" : "text-sm font-semibold"}`}
                  >
                    {row.value}
                    {row.suffix ? (
                      <span className="ml-1 text-xs font-medium uppercase text-muted">
                        {row.suffix}
                      </span>
                    ) : null}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>

        {/* My offer section */}
        {isFarmer && (myOffer || isOfferRefreshPending) && (
          <section
            id="farmer-offers"
            className="mt-10 space-y-5 border-t border-border pt-10"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-primary-heading">
                  {t("demandDetails.yourOffered")}
                </h2>
                <p className="mt-1 text-sm font-medium text-muted">
                  {t("demandDetails.myOfferDesc")}
                </p>
              </div>

              <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-primary">
                {t("demandDetails.submitted")}
              </span>
            </div>
            <div className="max-w-2xl">
              {isOfferRefreshPending || !myOffer ? (
                <OfferCardSkeleton />
              ) : (
                <>
                  <FarmerCardOfferComponent
                    offer={myOffer}
                    showActions={false}
                  />
                  <div className="mt-4 flex w-full flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="flex flex-1 items-center justify-center rounded-xl bg-secondary px-4 py-3.5 text-[12px] font-bold uppercase tracking-wider text-dark-grey shadow-sm transition hover:bg-secondary/90 active:scale-[0.98]"
                    >
                      {t("demandDetails.updateOffer")}
                    </button>
                    <button
                      type="button"
                      disabled={isDeletingOffer}
                      onClick={() => setIsDeleteOfferOpen(true)}
                      className="flex flex-1 items-center justify-center rounded-xl border border-[#B81C1C]/25 bg-[#B81C1C] px-4 py-3.5 text-[12px] font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#9F1717] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isDeletingOffer
                        ? t("demandDetails.deleting")
                        : t("demandDetails.deleteOffer")}
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* Incoming offers — owner only */}
        {isOwner && (
          <section
            id="farmer-offers"
            className="mt-10 space-y-5 border-t border-border pt-10"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-primary-heading">
                  {t("demandDetails.incomingOffers")}
                </h2>
                <p className="mt-1 text-sm font-medium text-muted">
                  {t("demandDetails.incomingDesc")}
                </p>
              </div>

              <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-primary">
                {offerTotalElements}{" "}
                {offerTotalElements === 1
                  ? t("demandDetails.offerReceived")
                  : t("demandDetails.offersReceived")}
              </span>
            </div>

            {farmerOffers.length === 0 ? (
              <p className="rounded-xl border border-border bg-white px-6 py-8 text-center text-sm font-medium text-muted">
                {t("demandDetails.noOffers")}
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {farmerOffers.map((offer, index) => (
                    <FarmerCardOfferComponent
                      key={offer.farmerOfferId}
                      offer={offer}
                      demandPostId={demandPostId}
                      isRecommended={
                        (offerPage - 1) *
                          (offerPagination?.size ?? farmerOffers.length) +
                          index <
                        3
                      }
                      isVerifiedIdentity={isVerifiedIdentity}
                      lockedMessage={chatLockedMessage}
                    />
                  ))}
                </div>

                {offerTotalPages > 1 && (
                  <PaginationComponent
                    currentPage={offerPage}
                    totalItems={offerTotalElements}
                    pageSize={offerPagination?.size ?? 4}
                    onPageChange={handleOfferPageChange}
                    size="sm"
                    pageBase={1}
                  />
                )}
              </>
            )}
          </section>
        )}
      </div>

      {isDeleteDemandOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#B81C1C]/10 text-[#B81C1C]">
              <ShieldAlert size={22} />
            </div>

            <h2 className="text-lg font-bold text-primary-heading">
              {t("demandDetails.deleteDemandTitle")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#667085]">
              {t("demandDetails.deleteDemandDesc")}
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsDeleteDemandOpen(false)}
                disabled={isDeletingDemand}
                className="rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-semibold text-[#344054] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {t("demandDetails.cancel")}
              </button>
              <button
                type="button"
                onClick={handleDeleteDemand}
                disabled={isDeletingDemand}
                className="rounded-xl bg-[#B81C1C] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#9F1717] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isDeletingDemand
                  ? t("demandDetails.deleting")
                  : t("demandDetails.deleteDemand")}
              </button>
            </div>
          </div>
        </div>
      )}

      <SubmitOfferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleUpdateSubmission}
        initialData={existingOfferData}
        isUpdating={hasMyOffer}
      />

      {/* Delete confirm modal */}
      {isDeleteOfferOpen && (
        <div
          className="fixed inset-0 z-9000 flex items-center justify-center bg-black/45 px-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-offer-title"
          aria-describedby="delete-offer-description"
        >
          <button
            type="button"
            aria-label={t("demandDetails.closeDeleteOffer")}
            className="absolute inset-0 cursor-default"
            onClick={
              isDeletingOffer ? undefined : () => setIsDeleteOfferOpen(false)
            }
          />

          <div className="relative z-10 w-full max-w-105 overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/20">
            <button
              type="button"
              onClick={() => setIsDeleteOfferOpen(false)}
              disabled={isDeletingOffer}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={t("demandDetails.close")}
            >
              <XCircle className="h-4 w-4" />
            </button>

            <div className="px-6 pt-6">
              <div className="flex items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#B81C1C]/10 text-[#B81C1C] ring-8 ring-[#B81C1C]/5">
                  <ShieldAlert className="h-6 w-6" />
                </div>
              </div>

              <h2
                id="delete-offer-title"
                className="mt-5 text-[22px] font-bold text-primary-heading"
              >
                {t("demandDetails.deleteOfferTitle")}
              </h2>
              <p
                id="delete-offer-description"
                className="mt-2 text-[15px] leading-6 text-description-text"
              >
                {t("demandDetails.deleteOfferDesc", {
                  cropName: cropName || data.cropName || t("demandDetails.notAvailable"),
                })}
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsDeleteOfferOpen(false)}
                disabled={isDeletingOffer}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-[14px] font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t("demandDetails.cancel")}
              </button>
              <button
                type="button"
                onClick={handleDeleteOffer}
                disabled={isDeletingOffer}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#B81C1C] px-5 text-[14px] font-semibold text-white transition hover:bg-[#9F1717] disabled:cursor-wait disabled:opacity-70"
              >
                {isDeletingOffer
                  ? t("demandDetails.deleting")
                  : t("demandDetails.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function OfferCardSkeleton() {
  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex animate-pulse items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-3">
          <div className="h-13 w-13 shrink-0 rounded-full bg-gray-200" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-40 rounded-full bg-gray-200" />
            <div className="h-3 w-28 rounded-full bg-gray-100" />
            <div className="h-3 w-36 rounded-full bg-gray-100" />
          </div>
        </div>
        <div className="h-7 w-24 rounded-full bg-gray-100" />
      </div>

      <div className="mt-4 grid animate-pulse grid-cols-3 gap-2 rounded-[10px] bg-[#FBF7EC] px-4 py-3">
        <div className="space-y-2">
          <div className="h-3 w-16 rounded-full bg-gray-200" />
          <div className="h-4 w-20 rounded-full bg-gray-100" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-16 rounded-full bg-gray-200" />
          <div className="h-4 w-20 rounded-full bg-gray-100" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-20 rounded-full bg-gray-200" />
          <div className="h-4 w-24 rounded-full bg-gray-100" />
        </div>
      </div>

      <div className="mt-3.5 animate-pulse rounded-[10px] bg-[#FBF7EC] p-4">
        <div className="h-3 w-20 rounded-full bg-gray-200" />
        <div className="mt-3 h-3 w-full rounded-full bg-gray-100" />
        <div className="mt-2 h-3 w-2/3 rounded-full bg-gray-100" />
      </div>
    </div>
  );
}

function SpecRow({
  label,
  value,
  accent,
}: {
  label: string;
  value?: string | null;
  accent?: boolean;
}) {
  return (
    <div className="py-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
        {label}
      </p>
      <p
        className={`mt-1 text-[14px] font-extrabold ${accent ? "text-primary" : "text-primary-heading"}`}
      >
        {value ?? "—"}
      </p>
    </div>
  );
}
