"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import PaginationComponent from "./PaginationComponent";
import type { Order } from "@/services/order.service";
import { normalizeCropProductImageUrl } from "@/lib/cropProductImage";
import { useI18n } from "@/lib/i18n/I18nContext";

const PROFILE_TEXT = {
  "profile.body.status": { en: "STATUS", kh: "ស្ថានភាព" },
  "profile.description.history": { en: "No order history found.", kh: "មិនមានប្រវត្តិការបញ្ជាទិញទេ។" },
  "profile.fallback.na": { en: "N/A", kh: "មិនមាន" },
  "profile.farmer": { en: "Farmer", kh: "កសិករ" },
  "profile.status.delivered": { en: "Delivered", kh: "បានដឹកជញ្ជូន" },
  "profile.status.pending": { en: "Pending", kh: "កំពុងរង់ចាំ" },
  "profile.table.cropName": { en: "CROP NAME", kh: "ឈ្មោះដំណាំ" },
  "profile.table.farmerName": { en: "FARMER NAME", kh: "ឈ្មោះកសិករ" },
  "profile.table.image": { en: "IMAGE", kh: "រូបភាព" },
  "profile.table.no": { en: "NO", kh: "លេខរៀង" },
  "profile.table.qty": { en: "Quantity", kh: "បរិមាណ" },
  "profile.table.totalPrice": { en: "TOTAL PRICE", kh: "តម្លៃសរុប" },
  "profile.totalPrice": { en: "Total Price", kh: "តម្លៃសរុប" },
  "profile.unit.kg": { en: "KG", kh: "គីឡូក្រាម" },
  "profile.unit.tons": { en: "Tons", kh: "តោន" },
} as const;

function getProfileText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  return (key: string) =>
    PROFILE_TEXT[key as keyof typeof PROFILE_TEXT]?.[lang] ?? key;
}


const ITEMS_PER_PAGE = 10;

type OrderHistoryComponentProps = {
  orderItems: Order[];
};

const statusStyles = {
  PENDING: "bg-[#e6c8cd] text-[#FF5555] border border-[#e6c8cc]",
  DELIVERED: "bg-primary/20 text-primary",
};

const gridStyle: React.CSSProperties = {
  gridTemplateColumns:
    "50px 105px minmax(120px,1fr) minmax(170px,1.4fr) minmax(120px,1fr) 90px 115px",
};

function formatUnitType(qty: number, type: string | undefined, t: (key: string) => string) {
  if (type === "TONS") return `${qty} ${t("profile.unit.tons")}`;
  if (type === "KG") return `${qty} ${t("profile.unit.kg")}`;
  return `${qty} ${type ?? ""}`.trim();
}

function formatTotal(order: Order) {
  const currency = order.currencyCode === "KHR" ? "KHR" : "$";

  return `${currency} ${order.totalAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function OrderHistoryComponent({
  orderItems,
}: OrderHistoryComponentProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const { language } = useI18n();
  const t = getProfileText(language);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";
  const paginatedOrderItems = useMemo(() => {
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;


    return orderItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [orderItems, currentPage]);

  return (
    <section className={`mt-2 w-full bg-white ${fontClass}`}>
      <div className="hidden w-full lg:block">
        <div className="w-full overflow-hidden">
          <div
            style={gridStyle}
            className="grid items-center gap-4 border-b border-[#E2E8F0] px-5 py-4 text-[13px] font-bold uppercase tracking-wider text-[#94A3B8]"
          >
            <div>{t("profile.table.no")}</div>
            <div>{t("profile.table.image")}</div>
            <div>{t("profile.table.cropName")}</div>
            <div>{t("profile.table.farmerName")}</div>
            <div>{t("profile.table.totalPrice")}</div>
            <div>{t("profile.table.qty")}</div>
            <div>{t("profile.body.status")}</div>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {paginatedOrderItems.length > 0 ? (
              paginatedOrderItems.map((item, index) => {
                const status = item.isCompleted ? "DELIVERED" : "PENDING";
                const statusLabel = item.isCompleted
                  ? t("profile.status.delivered")
                  : t("profile.status.pending");
                const imageSrc = normalizeCropProductImageUrl(
                  item.imageUrls?.[0],
                );

                return (
                  <div
                    key={item.orderId}
                    style={gridStyle}
                    className="grid items-center gap-4 px-5 py-5 text-[15px]"
                  >
                    <div className="font-medium text-[#334155]">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </div>

                    <div>
                      <div className="relative h-18.5 w-22.5 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]">
                        <Image
                          src={imageSrc}
                          alt={item.cropName}
                          fill
                          sizes="90px"
                          className="object-cover"
                        />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h4 className="wrap-break-word font-bold leading-snug text-[#1E293B]">
                        {item.cropName}
                      </h4>

                      <span className="mt-0.5 block wrap-break-word text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">
                        {item.cropType}
                      </span>
                    </div>

                    <div className="min-w-0 wrap-break-word font-bold leading-snug text-[#64748B]">
                      {item.farmerName ?? t("profile.fallback.na")}
                    </div>

                    <div className="min-w-0 wrap-break-word text-[16px] font-bold leading-snug text-primary">
                      {formatTotal(item)}
                    </div>

                    <div className="min-w-0 font-medium text-[#64748B]">
                      {formatUnitType(item.quantity, item.unitType, t)}
                    </div>

                    <div className="flex justify-start">
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-bold tracking-wide ${statusStyles[status]}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-5 py-12 text-center text-sm font-semibold text-muted">
                {t("profile.description.history")}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {paginatedOrderItems.length > 0 ? (
          paginatedOrderItems.map((item, index) => {
            const status = item.isCompleted ? "DELIVERED" : "PENDING";
            const statusLabel = item.isCompleted
              ? t("profile.status.delivered")
              : t("profile.status.pending");
            const imageSrc = normalizeCropProductImageUrl(item.imageUrls?.[0]);

            return (
              <article
                key={item.orderId}
                className="rounded-[14px] border border-[#E2E8F0] bg-white p-3 shadow-sm"
              >
                <div className="flex gap-3">
                  <div className="relative h-23 w-26.25 shrink-0 overflow-hidden rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] sm:h-27.5 sm:w-35">
                    <Image
                      src={imageSrc}
                      alt={item.cropName}
                      fill
                      sizes="(max-width: 640px) 105px, 140px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-[#94A3B8]">
                          {t("profile.table.no")}. {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </p>

                        <h4 className="wrap-break-word text-[16px] font-bold leading-snug text-[#1E293B] sm:text-[18px]">
                          {item.cropName}
                        </h4>

                        <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-[#94A3B8] sm:text-[11px]">
                          {item.cropType}
                        </span>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold tracking-wide sm:text-[11px] ${statusStyles[status]}`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[13px] sm:text-[14px]">
                      <div>
                        <p className="text-[11px] font-bold uppercase text-[#94A3B8]">
                          {t("profile.farmer")}
                        </p>
                        <p className="wrap-break-word font-bold text-[#64748B]">
                          {item.farmerName ?? t("profile.fallback.na")}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase text-[#94A3B8]">
                          {t("profile.table.qty")}
                        </p>
                        <p className="font-medium text-[#64748B]">
                          {formatUnitType(item.quantity, item.unitType, t)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase text-[#94A3B8]">
                          {t("profile.totalPrice")}
                        </p>
                        <p className="text-[15px] font-bold text-primary">
                          {formatTotal(item)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-[14px] border border-[#E2E8F0] bg-white p-8 text-center text-sm font-semibold text-muted">
            {t("profile.description.history")}
          </div>
        )}
      </div>

      <div className="mt-8 sm:mt-10">
        <PaginationComponent
          currentPage={currentPage}
          totalItems={orderItems.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>
    </section>
  );
}