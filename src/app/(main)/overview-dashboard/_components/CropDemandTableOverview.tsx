"use client";

import Image from "next/image";
import Link from "next/link";
import { CropDemandItem } from "@/services/crop-demand.service";
import type { CropProductPost } from "@/types/crop-product";
import type { CropProduct } from "@/services/crop-product.service";
import { useI18n } from "@/lib/i18n/I18nContext";
import {
  getCropProductImages,
  normalizeCropProductImageUrl,
} from "@/lib/cropProductImage";

type UserRole = "BUYER" | "FARMER";
type ProductRow = CropProduct | CropProductPost;

type Props = {
  role: UserRole;
  cropDemands: CropDemandItem[];
  cropProducts?: ProductRow[];
};

const FALLBACK_IMAGE = "/image-demand/product1.jpg";

function resolveImage(url?: string | null): string {
  return url ? normalizeCropProductImageUrl(url) : FALLBACK_IMAGE;
}

function formatPrice(amount?: number, currency?: string) {
  const safeAmount = Number(amount ?? 0);
  if (currency === "USD") return `$${safeAmount.toFixed(2)}`;
  if (currency === "KHR") return `${safeAmount.toLocaleString()}៛`;
  return `${safeAmount.toLocaleString()} ${currency ?? ""}`;
}

function formatQty(qty?: number, unit?: string) {
  return `${Number(qty ?? 0).toLocaleString()} ${unit ?? ""}`;
}

function getStatusClass(status?: string) {
  if (status === "UNAVAILABLE" || status === "CLOSED")
    return "bg-red-100 text-red-600";
  if (status === "MATCHED") return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-primary";
}

function getProductId(product: ProductRow) {
  if ("cropProductPostId" in product && product.cropProductPostId)
    return product.cropProductPostId;
  if ("postId" in product && product.postId) return product.postId;
  return crypto.randomUUID();
}

function getProductImage(product: ProductRow) {
  return getCropProductImages(product.imageUrls)[0] ?? FALLBACK_IMAGE;
}

// ✅ Add this translation map
const TABLE_TEXT = {
  inventory: { en: "Inventory", kh: "សារពើភ័ណ្ឌ" },
  demand: { en: "Demand", kh: "តម្រូវការ" },
  cropPostsTitle: {
    en: "Your Crop Posts Overview",
    kh: "ទិដ្ឋភាពរួមនៃការផ្សាយដំណាំរបស់អ្នក",
  },
  demandTitle: {
    en: "Your Crop Demand Overview",
    kh: "ទិដ្ឋភាពរួមនៃតម្រូវការដំណាំរបស់អ្នក",
  },
  seeAll: { en: "See All", kh: "មើលទាំងអស់" },
  colNo: { en: "No", kh: "លរ" },
  colImage: { en: "Image", kh: "រូបភាព" },
  colCropName: { en: "Crop Name", kh: "ឈ្មោះដំណាំ" },
  colPrice: { en: "Price", kh: "តម្លៃ" },
  colQty: { en: "Qty", kh: "បរិមាណ" },
  colQtyLeft: { en: "Qty Left", kh: "បរិមាណដែលនៅសល់" },
  colStatus: { en: "Status", kh: "ស្ថានភាព" },
  noData: { en: "No data found.", kh: "រកមិនឃើញទិន្នន័យ។" },
} as const;

export default function CropDemandTableOverview({
  role,
  cropDemands,
  cropProducts = [],
}: Props) {
  const { language } = useI18n();
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";
  const t = (key: keyof typeof TABLE_TEXT) => TABLE_TEXT[key][lang];

  const isFarmer = role === "FARMER";

  const rows = isFarmer
    ? cropProducts.slice(0, 3).map((product) => ({
        id: getProductId(product),
        image: getProductImage(product),
        cropName: product.cropName ?? "—",
        cropType: product.cropTypeName ?? "—",
        price: formatPrice(product.pricePerUnit, product.currencyCode),
        qty: formatQty(product.totalQuantity, product.unitType),
        qtyLeft: formatQty(product.stockLeft, product.unitType),
        status: product.status ?? "AVAILABLE",
      }))
    : cropDemands.slice(0, 3).map((demand) => ({
        id: demand.cropDemandPostId,
        image: resolveImage(demand.imageUrls?.[0]),
        cropName: demand.cropName ?? "—",
        cropType: demand.cropTypeName ?? "—",
        price: formatPrice(demand.maxPricePerUnit, demand.currencyCode),
        qty: formatQty(demand.quantityNeeded, demand.unitType),
        qtyLeft: null,
        status: demand.status,
      }));

  return (
    <div
      className={`rounded-[20px] border border-light-grey bg-white p-6 shadow-sm ${lang === "kh" ? "font-khmer" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wide text-primary">
            {t(isFarmer ? "inventory" : "demand")}
          </p>
          <h2 className="mt-1 text-[24px] font-bold text-primary-heading">
            {t(isFarmer ? "cropPostsTitle" : "demandTitle")}
          </h2>
        </div>
        <Link
          href={
            isFarmer ? "/crop-product-management" : "/crop-demands-management"
          }
          className="cursor-pointer shrink-0 whitespace-nowrap text-[14px] font-semibold text-primary underline underline-offset-2"
        >
          {t("seeAll")}
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-light-grey text-left">
              <th className="pb-4 text-[12px] font-bold uppercase tracking-wide text-muted">
                {t("colNo")}
              </th>
              <th className="pb-4 text-[12px] font-bold uppercase tracking-wide text-muted">
                {t("colImage")}
              </th>
              <th className="pb-4 text-[12px] font-bold uppercase tracking-wide text-muted">
                {t("colCropName")}
              </th>
              <th className="pb-4 text-[12px] font-bold uppercase tracking-wide text-muted">
                {t("colPrice")}
              </th>
              <th className="pb-4 text-[12px] font-bold uppercase tracking-wide text-muted">
                {t("colQty")}
              </th>
              {isFarmer && (
                <th className="pb-4 text-[12px] font-bold uppercase tracking-wide text-muted">
                  {t("colQtyLeft")}
                </th>
              )}
              <th className="pb-4 text-[12px] font-bold uppercase tracking-wide text-muted">
                {t("colStatus")}
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={isFarmer ? 7 : 6}
                  className="py-10 text-center text-[14px] text-muted"
                >
                  {t("noData")}
                </td>
              </tr>
            ) : (
              rows.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-light-grey transition hover:bg-[#FAFAFA]"
                >
                  <td className="py-5 text-[15px] font-semibold text-secondary-body">
                    {index + 1}
                  </td>
                  <td className="py-5">
                    <Image
                      src={item.image}
                      alt={item.cropName}
                      width={56}
                      height={56}
                      className="h-[56px] w-[56px] rounded-[14px] object-cover"
                    />
                  </td>
                  <td className="py-5">
                    <h3 className="text-[15px] font-bold text-primary-heading">
                      {item.cropName}
                    </h3>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                      {item.cropType}
                    </p>
                  </td>
                  <td className="py-5 text-[15px] font-bold text-primary">
                    {item.price}
                  </td>
                  <td className="py-5 text-[14px] font-medium text-muted">
                    {item.qty}
                  </td>
                  {isFarmer && (
                    <td className="py-5 text-[14px] font-medium text-muted">
                      {item.qtyLeft}
                    </td>
                  )}
                  <td className="py-5">
                    <span
                      className={`rounded-full px-4 py-2 text-[11px] font-bold ${getStatusClass(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
