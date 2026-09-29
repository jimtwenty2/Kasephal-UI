"use client";

import { useState } from "react";
import Link from "next/link";
import { Order } from "@/services/order.service";
import { useI18n } from "@/lib/i18n/I18nContext";
import { CurrencyCode } from "../_components/CurrencyToggle";

type UserRole = "BUYER" | "FARMER" | "GOVERNMENT";

type RecentOrdersOverviewProps = {
  role: UserRole;
  orders: Order[];
  currency: CurrencyCode; // ← from parent
};

const KHR_COLOR = "#F9C156";

function formatUSD(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatKHR(amount: number) {
  return new Intl.NumberFormat("km-KH", {
    style: "currency",
    currency: "KHR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatAmount(amount: number, currency: CurrencyCode) {
  return currency === "KHR" ? formatKHR(amount) : formatUSD(amount);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day: d.getUTCDate(),
    month: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
  };
}

function getStatusLabel(order: Order): "PAID" | "PENDING" | "CANCELLED" {
  if (order.isCompleted) return "PAID";
  if (order.escrowStatus === "FUNDED") return "PENDING";
  return "CANCELLED";
}

const ORDERS_TEXT = {
  activity: { en: "Activity", kh: "សកម្មភាព" },
  recentOrders: { en: "Recent Orders", kh: "ការបញ្ជាទិញថ្មីៗ" },
  seeAll: { en: "See All", kh: "មើលទាំងអស់" },
  noOrders: { en: "No orders found.", kh: "រកមិនឃើញការបញ្ជាទិញ។" },
  deliveryDue: {
    en: "Delivery due in 3 days",
    kh: "ការដឹកជញ្ជូននឹងមកដល់ក្នុង ៣ ថ្ងៃ",
  },
  farmer: { en: "Farmer", kh: "កសិករ" },
  buyer: { en: "Buyer", kh: "អ្នកទិញ" },
  paid: { en: "PAID", kh: "បានបង់" },
  pending: { en: "PENDING", kh: "កំពុងរង់ចាំ" },
  cancelled: { en: "CANCELLED", kh: "បានបោះបង់" },
} as const;

export default function RecentOrdersOverview({
  role,
  orders,
  currency, // ← from parent
}: RecentOrdersOverviewProps) {
  const { language } = useI18n();
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";
  const t = (key: keyof typeof ORDERS_TEXT) => ORDERS_TEXT[key][lang];

  const [showAll, setShowAll] = useState(false);
  // ← removed: currency useState
  // ← removed: isKHR

  const userLabel = role === "BUYER" ? t("farmer") : t("buyer");

  const mappedOrders = orders
    .filter(
      (o) =>
        ((o as Order & { currencyCode?: string }).currencyCode ?? "USD") ===
        currency,
    )
    .map((o) => ({
      id: o.orderId,
      crop: o.post?.cropProduct?.crop
        ? `${o.post.cropProduct.crop.cropName}, ${o.quantity.toLocaleString()} ${o.unitType}`
        : `Order, ${o.quantity.toLocaleString()} ${o.unitType}`,
      price: formatAmount(o.totalAmount, currency),
      status: getStatusLabel(o),
      date: formatDate(o.createdAt),
    }));

  const visibleOrders =
    role === "BUYER"
      ? mappedOrders.filter((item) => item.status !== "PENDING")
      : mappedOrders;

  const displayedOrders = showAll ? visibleOrders : visibleOrders.slice(0, 3);

  const statusLabel = (status: "PAID" | "PENDING" | "CANCELLED") => {
    if (status === "PAID") return t("paid");
    if (status === "PENDING") return t("pending");
    return t("cancelled");
  };

  return (
    <div
      className={`rounded-[20px] border border-light-grey bg-white p-6 shadow-sm ${lang === "kh" ? "font-khmer" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wide text-primary">
            {t("activity")}
          </p>
          <h2 className="mt-1 text-[24px] font-bold text-primary-heading">
            {t("recentOrders")}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {/* ← removed: inline currency toggle */}
          <Link
            href="/order-history"
            className="text-[14px] font-semibold text-primary underline underline-offset-2"
          >
            {t("seeAll")}
          </Link>
        </div>
      </div>

      {/* Orders */}
      <div className="mt-6 space-y-4">
        {displayedOrders.length === 0 ? (
          <p className="py-6 text-center text-[14px] text-muted">
            {t("noOrders")}
          </p>
        ) : (
          displayedOrders.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-[16px] border border-light-grey p-4"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-[54px] w-[54px] shrink-0 flex-col items-center justify-center rounded-[14px] bg-[#EEF2F7]">
                  <span className="text-[16px] font-bold text-primary-heading">
                    {item.date.day}
                  </span>
                  <span className="text-[11px] font-medium text-muted">
                    {item.date.month}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-muted">
                    {userLabel}
                  </p>
                  <h3 className="mt-1 truncate text-[15px] font-bold leading-snug text-primary-heading">
                    {item.crop}
                  </h3>
                  <p className="mt-1 text-[12px] text-muted">
                    {t("deliveryDue")}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end">
                {role === "FARMER" && (
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                      item.status === "PAID"
                        ? "bg-green-100 text-green-700"
                        : item.status === "CANCELLED"
                          ? "bg-gray-200 text-gray-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {statusLabel(item.status)}
                  </span>
                )}
                <h3
                  className="mt-4 text-[16px] font-bold"
                  style={{
                    color: currency === "KHR" ? KHR_COLOR : undefined,
                  }}
                >
                  {item.price}
                </h3>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
