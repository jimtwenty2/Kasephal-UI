"use client";

import {
  ClipboardDocumentListIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { BanknoteIcon, ShoppingBasketIcon, SproutIcon } from "lucide-react";

import { useI18n } from "@/lib/i18n/I18nContext";
import { Contract } from "@/services/contract.service";
import { Order } from "@/services/order.service";

import { CurrencyCode } from "../_components/CurrencyToggle";
import DashboardStatCardOverview from "./DashboardStatCardOverview";

type Props = {
  orders: Order[];
  contracts: Contract[];
  activeCropPosts?: number;
  totalContracts?: number;
  activeContracts?: number;
  availableWithdrawAmount?: number;
  currency: CurrencyCode;
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
  activeCropPosts: { en: "Total Active Crop Post", kh: "ការផ្សាយដំណាំសកម្មសរុប" },
  totalContracts: { en: "Total Contracts", kh: "កិច្ចសន្យាសរុប" },
  activeContracts: { en: "Total Active Contract", kh: "កិច្ចសន្យាសកម្មសរុប" },
  availableWithdraw: { en: "Available To Withdraw", kh: "ប្រាក់អាចដកបាន" },
  totalOrders: { en: "Total Orders", kh: "ការបញ្ជាទិញសរុប" },
  completedOrders: {
    en: "Total Completed Orders",
    kh: "ការបញ្ជាទិញបានបញ្ចប់សរុប",
  },
  earningsThisMonth: {
    en: "Total Earning (Last 30 Days)",
    kh: "ប្រាក់ចំណូលសរុប (៣០ថ្ងៃចុងក្រោយ)",
  },
  earningsThisYear: {
    en: "Total Earning This Year",
    kh: "ប្រាក់ចំណូលសរុបឆ្នាំនេះ",
  },
  posts: { en: "Posts", kh: "ការផ្សាយ" },
  contracts: { en: "Contracts", kh: "កិច្ចសន្យា" },
  orders: { en: "Orders", kh: "ការបញ្ជាទិញ" },
} as const;

const ACTIVE_CONTRACT_STATUSES: Contract["status"][] = ["LOCKED"];

export default function CompleteOrderComponent({
  orders,
  contracts,
  activeCropPosts: activeCropPostsProp,
  totalContracts: totalContractsProp,
  activeContracts: activeContractsProp,
  availableWithdrawAmount = 0,
  currency,
}: Props) {
  const { language } = useI18n();
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const totalOrders = orders.length;
  const completedOrders = orders.filter((order) => order.isCompleted).length;

  const totalContracts = totalContractsProp ?? contracts.length;

  const activeContracts =
    activeContractsProp ??
    contracts.filter((contract) =>
      ACTIVE_CONTRACT_STATUSES.includes(contract.status),
    ).length;

  const activeCropPosts = activeCropPostsProp ?? 0;

  const completedOrdersByCurrency = orders.filter(
    (order) =>
      order.isCompleted &&
      ((order as Order & { currencyCode?: string }).currencyCode ?? "USD") ===
        currency,
  );

  const earningsThisMonth = completedOrdersByCurrency
    .filter((order) => new Date(order.createdAt) >= thirtyDaysAgo)
    .reduce((sum, order) => sum + Number(order.totalAmount ?? 0), 0);

  const earningsThisYear = completedOrdersByCurrency
    .filter((order) => new Date(order.createdAt).getUTCFullYear() === currentYear)
    .reduce((sum, order) => sum + Number(order.totalAmount ?? 0), 0);

  const stats = [
    {
      title: STAT_TEXT.activeCropPosts[lang],
      value: String(activeCropPosts),
      subtitle: STAT_TEXT.posts[lang],
      icon: SproutIcon,
    },
    {
      title: STAT_TEXT.totalContracts[lang],
      value: String(totalContracts),
      subtitle: STAT_TEXT.contracts[lang],
      icon: ClipboardDocumentListIcon,
    },
    {
      title: STAT_TEXT.activeContracts[lang],
      value: String(activeContracts),
      subtitle: STAT_TEXT.contracts[lang],
      icon: ClipboardDocumentListIcon,
    },
    {
      title: STAT_TEXT.availableWithdraw[lang],
      value: formatAmount(availableWithdrawAmount, currency),
      subtitle: currency,
      icon: BanknoteIcon,
    },
    {
      title: STAT_TEXT.totalOrders[lang],
      value: String(totalOrders),
      subtitle: STAT_TEXT.orders[lang],
      icon: ShoppingBasketIcon,
    },
    {
      title: STAT_TEXT.completedOrders[lang],
      value: String(completedOrders),
      subtitle: STAT_TEXT.orders[lang],
      icon: ShoppingBasketIcon,
    },
    {
      title: STAT_TEXT.earningsThisMonth[lang],
      value: formatAmount(earningsThisMonth, currency),
      subtitle: currency,
      icon: TruckIcon,
    },
    {
      title: STAT_TEXT.earningsThisYear[lang],
      value: formatAmount(earningsThisYear, currency),
      subtitle: currency,
      icon: TruckIcon,
    },
  ];

  return (
    <div className={lang === "kh" ? "font-khmer" : ""}>
      <div className="mt-3 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item, index) => (
          <DashboardStatCardOverview
            key={`${item.title}-${index}`}
            title={item.title}
            value={item.value}
            subtitle={item.subtitle}
            icon={item.icon}
          />
        ))}
      </div>
    </div>
  );
}
