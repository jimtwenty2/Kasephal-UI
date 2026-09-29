"use client";

import {
  ClipboardDocumentListIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { BanknoteIcon, ShoppingBasketIcon } from "lucide-react";

import { useI18n } from "@/lib/i18n/I18nContext";
import { Contract } from "@/services/contract.service";
import { Order } from "@/services/order.service";

import { CurrencyCode } from "../_components/CurrencyToggle";
import DashboardStatCardOverview from "./DashboardStatCardOverview";

type Props = {
  orders: Order[];
  contracts: Contract[];
  currency: CurrencyCode;
  totalContracts?: number;
  activeContracts?: number;
  availableRefundAmount?: number;
};

function formatUSD(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
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

const STAT_TEXT = {
  totalContracts: { en: "Total Contracts", kh: "កិច្ចសន្យាសរុប" },
  activeContracts: { en: "Active Contracts", kh: "កិច្ចសន្យាសកម្ម" },
  availableRefund: { en: "Available To Refund", kh: "ប្រាក់អាចសងវិញបាន" },
  completedOrders: { en: "Completed Orders", kh: "ការបញ្ជាទិញបានបញ្ចប់" },
  totalSpent30: {
    en: "Total Spent (Last 30 Days)",
    kh: "ការចំណាយសរុប (៣០ថ្ងៃចុងក្រោយ)",
  },
  totalSpentYear: { en: "Total Spent This Year", kh: "ការចំណាយសរុបឆ្នាំនេះ" },
  contracts: { en: "Contracts", kh: "កិច្ចសន្យា" },
  orders: { en: "Orders", kh: "ការបញ្ជាទិញ" },
} as const;

const ACTIVE_STATUSES: Contract["status"][] = ["LOCKED"];

export default function DashboardStatsOverview({
  orders,
  contracts,
  currency,
  totalContracts: totalContractsProp,
  activeContracts: activeContractsProp,
  availableRefundAmount = 0,
}: Props) {
  const { language } = useI18n();
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";
  const t = (key: keyof typeof STAT_TEXT) => STAT_TEXT[key][lang];

  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const totalContracts = totalContractsProp ?? contracts.length;

  const activeContracts =
    activeContractsProp ??
    contracts.filter((contract) => ACTIVE_STATUSES.includes(contract.status))
      .length;

  const completedOrders = orders.filter((order) => order.isCompleted).length;

  const ordersByCurrency = orders.filter(
    (order) =>
      ((order as Order & { currencyCode?: string }).currencyCode ?? "USD") ===
      currency,
  );

  const totalSpentLast30Days = ordersByCurrency
    .filter((order) => new Date(order.createdAt) >= thirtyDaysAgo)
    .reduce((sum, order) => sum + Number(order.totalAmount ?? 0), 0);

  const totalSpentThisYear = ordersByCurrency
    .filter(
      (order) => new Date(order.createdAt).getUTCFullYear() === currentYear,
    )
    .reduce((sum, order) => sum + Number(order.totalAmount ?? 0), 0);

  const stats = [
    {
      title: t("totalContracts"),
      value: String(totalContracts),
      subtitle: t("contracts"),
      icon: ClipboardDocumentListIcon,
    },
    {
      title: t("activeContracts"),
      value: String(activeContracts),
      subtitle: t("contracts"),
      icon: ClipboardDocumentListIcon,
    },
    {
      title: t("availableRefund"),
      value: formatAmount(availableRefundAmount, currency),
      subtitle: currency,
      icon: BanknoteIcon,
    },
    {
      title: t("completedOrders"),
      value: String(completedOrders),
      subtitle: t("orders"),
      icon: ShoppingBasketIcon,
    },
    {
      title: t("totalSpent30"),
      value: formatAmount(totalSpentLast30Days, currency),
      subtitle: currency,
      icon: TruckIcon,
    },
    {
      title: t("totalSpentYear"),
      value: formatAmount(totalSpentThisYear, currency),
      subtitle: currency,
      icon: TruckIcon,
    },
  ];

  return (
    <div
      className={`mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${lang === "kh" ? "font-khmer" : ""}`}
    >
      {stats.map((item) => (
        <DashboardStatCardOverview
          key={item.title}
          title={item.title}
          value={item.value}
          subtitle={item.subtitle}
          icon={item.icon}
        />
      ))}
    </div>
  );
}
