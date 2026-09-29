"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore, useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Layers3,
  PlusCircleIcon,
  Sprout,
} from "lucide-react";
import { useSession } from "next-auth/react";

import type { Order } from "@/services/order.service";
import type { Contract } from "@/services/contract.service";
import type { ExchangeRate } from "@/services/exchange-rate.service";
import type { CropDemandItem } from "@/services/crop-demand.service";
import type {
  CropProduct,
  TopValueCrop,
  TopVolumeCrop,
} from "@/services/crop-product.service";
import type { CropProductPost } from "@/types/crop-product";
import type { MarketPrice } from "@/types/market-price";
import type { UserProfile } from "@/services/profile.service";
import type { CropType } from "@/types/cropType";
import type {
  GovernmentMonthlyOrder,
  GovernmentPriceChange,
  GovernmentPriceHistory,
} from "@/types/overview-dashboard";

import DashboardSectionTitleOverview from "./DashboardSectionTitleOverview";
import DashboardStatsOverview from "./DashboardStatsOverview";
import PaymentSummaryOverview from "./PaymentSummaryOverview";
import ExchangeRateCardOverview from "./ExchangeRateCardOverview";
import EscrowStatusCardOverview from "./EscrowStatusCardOverview";
import RecentOrdersOverview from "./RecentOrdersOverview";
import CropDemandTableOverview from "./CropDemandTableOverview";
import CompleteOrderComponent from "./CompleteOrderComponent";
import MonthlyOrdersChart from "./MonthlyOrdersChart";
import PriceHistoryList from "./PriceHistoryList";
import PriceChangeHistoryChart from "./PriceChangeHistoryChart";
import PreviousMonthComparison from "./PreviousMonthComparison";
import LeadingCropCard from "./LeadingCropCard";
import CurrencyToggle, { CurrencyCode } from "../_components/CurrencyToggle";
import { useI18n } from "@/lib/i18n/I18nContext";

type DashboardRole = "BUYER" | "FARMER" | "GOVERNMENT";

type Props = {
  orders: Order[];
  contracts: Contract[];
  exchangeRates: ExchangeRate[] | undefined;
  cropDemands: CropDemandItem[];
  ownCropDemands: CropDemandItem[];
  cropProducts: CropProduct[];
  ownCropProducts: CropProductPost[];
  marketPrices: MarketPrice[];
  topValueCrops: TopValueCrop[];
  topVolumeCrops: TopVolumeCrop[];
  profile: UserProfile | null;
  cropTypes: CropType[];
  totalCrops: number;
  farmerActiveCropPosts?: number;
  farmerTotalContracts?: number;
  farmerActiveContracts?: number;
  farmerAvailableWithdrawUsd?: number;
  farmerAvailableWithdrawKhr?: number;
  buyerTotalContracts?: number;
  buyerActiveContracts?: number;
  buyerAvailableRefundUsd?: number;
  buyerAvailableRefundKhr?: number;
  governmentTotalCropNames?: number;
  governmentTotalCropTypes?: number;
  governmentTotalContracts?: number;
  governmentTotalOrders?: number;
  governmentPriceChanges?: GovernmentPriceChange[];
  governmentPriceHistory?: GovernmentPriceHistory | null;
  governmentMonthlyOrders?: GovernmentMonthlyOrder[];
};

type DashboardContentText = {
  title: { en: string; kh: string };
  description: { en: string; kh: string };
  section: { en: string; kh: string };
};

const BUYER_CONTENT: DashboardContentText = {
  title: { en: "Dashboard Overview", kh: "ទិដ្ឋភាពទូទៅផ្ទាំងគ្រប់គ្រង" },
  description: {
    en: "Manage active contracts, track payments, and monitor your purchasing activities.",
    kh: "គ្រប់គ្រងកិច្ចសញ្ញាសកម្ម តាមដានការទូទាត់ និងតាមដានសកម្មភាពទិញរបស់អ្នក។",
  },
  section: { en: "Procurement", kh: "ការទិញ" },
};

const FARMER_CONTENT: DashboardContentText = {
  title: { en: "Dashboard Overview", kh: "ទិដ្ឋភាពទូទៅផ្ទាំងគ្រប់គ្រង" },
  description: {
    en: "Manage your crop listings, monitor orders, and track your farming trade activities.",
    kh: "គ្រប់គ្រងបញ្ជីដំណាំ តាមដានការបញ្ជាទិញ និងតាមដានសកម្មភាពជួញដូររបស់កសិករ។",
  },
  section: { en: "Farm Performance", kh: "សកម្មភាពកសិដ្ឋាន" },
};

const GOVERNMENT_CONTENT: DashboardContentText = {
  title: { en: "Dashboard Overview", kh: "ទិដ្ឋភាពទូទៅផ្ទាំងគ្រប់គ្រង" },
  description: {
    en: "Monitor market prices, track trade activity, and oversee fair trade performance across agricultural sectors.",
    kh: "តាមដានតម្លៃទីផ្សារ សកម្មភាពជួញដូរ និងត្រួតពិនិត្យការអនុវត្តពាណិជ្ជកម្មត្រឹមត្រូវនៅគ្រប់វិស័យកសិកម្ម។",
  },
  section: { en: "Market Monitoring", kh: "ការត្រួតពិនិត្យទីផ្សារ" },
};

function getDashboardContent(role: DashboardRole): DashboardContentText {
  if (role === "FARMER") return FARMER_CONTENT;
  if (role === "GOVERNMENT") return GOVERNMENT_CONTENT;
  return BUYER_CONTENT;
}

const GREETINGS = {
  morning: { en: "Good morning", kh: "អរុណសួស្តី" },
  afternoon: { en: "Good afternoon", kh: "ទិវាសួស្តី" },
  evening: { en: "Good evening", kh: "សាយ័ណ្ហសួស្តី" },
} as const;

type GreetingPeriod = keyof typeof GREETINGS;

function getTimeBasedGreetingPeriod(date = new Date()): GreetingPeriod {
  const hour = date.getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

function subscribeToGreetingChange(callback: () => void): () => void {
  const intervalId = window.setInterval(callback, 60_000);
  return () => window.clearInterval(intervalId);
}

function getDisplayUserName(
  profile: UserProfile | null,
  sessionUser: { name?: string | null; email?: string | null } | undefined,
): string {
  return (
    profile?.personalInfo?.fullName?.trim() ||
    sessionUser?.name?.trim() ||
    sessionUser?.email?.trim() ||
    ""
  );
}

const ROLE_BUTTON_TEXT: Record<
  DashboardRole,
  { href: string; label: { en: string; kh: string } }
> = {
  BUYER: {
    href: "/crop-demands-management",
    label: { en: "Manage Crop Demand", kh: "គ្រប់គ្រងតម្រូវការដំណាំ" },
  },
  FARMER: {
    href: "/crop-product-management",
    label: { en: "Manage Crop Products", kh: "គ្រប់គ្រងផលិតផលដំណាំ" },
  },
  GOVERNMENT: {
    href: "/overview-dashboard/crop-management",
    label: { en: "Manage Crop", kh: "គ្រប់គ្រងដំណាំ" },
  },
};

const OVERVIEW_TEXT = { en: "Overview", kh: "ទិដ្ឋភាពទូទៅ" };

const CROP_CATALOG_TEXT = {
  cropManagement: { en: "Crop Management", kh: "ការគ្រប់គ្រងដំណាំ" },
  cropCatalog: { en: "Crop catalog", kh: "បញ្ជីដំណាំ" },
  manageCatalog: { en: "Manage catalog", kh: "គ្រប់គ្រងបញ្ជី" },
  cropTypes: { en: "crop types", kh: "ប្រភេទដំណាំ" },
  crops: { en: "crops", kh: "ដំណាំ" },
} as const;

export default function DashboardClient({
  orders,
  contracts,
  exchangeRates,
  cropDemands,
  ownCropDemands,
  cropProducts,
  ownCropProducts,
  marketPrices,
  topValueCrops,
  topVolumeCrops,
  profile,
  cropTypes,
  totalCrops,
  farmerActiveCropPosts,
  farmerTotalContracts,
  farmerActiveContracts,
  farmerAvailableWithdrawUsd = 0,
  farmerAvailableWithdrawKhr = 0,
  buyerTotalContracts,
  buyerActiveContracts,
  buyerAvailableRefundUsd = 0,
  buyerAvailableRefundKhr = 0,
  governmentTotalCropNames,
  governmentTotalCropTypes,
  governmentTotalContracts,
  governmentTotalOrders,
  governmentPriceChanges = [],
  governmentPriceHistory = null,
  governmentMonthlyOrders = [],
}: Props) {
  const { data: session, status } = useSession();
  const { language } = useI18n();
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  // ── Single currency state — drives all child components ──
  const [currency, setCurrency] = useState<CurrencyCode>(
    language === "kh" ? "KHR" : "USD",
  );

  const greetingPeriod = useSyncExternalStore(
    subscribeToGreetingChange,
    getTimeBasedGreetingPeriod,
    () => null,
  );

  if (status === "loading" || !greetingPeriod) return null;

  const userName = getDisplayUserName(profile, session?.user);

  const role = (
    profile?.basicInfo?.role ??
    session?.user?.role ??
    "BUYER"
  ).toUpperCase() as DashboardRole;

  const content = getDashboardContent(role);
  const roleButton = ROLE_BUTTON_TEXT[role];
  const greeting = GREETINGS[greetingPeriod];
  const safeExchangeRates = exchangeRates ?? [];

  return (
    <main className="relative min-h-screen bg-background">
      <Image
        src="/assets/home_page/bg02.png"
        alt=""
        width={260}
        height={260}
        className="pointer-events-none absolute right-0 top-90 opacity-40"
      />
      <Image
        src="/assets/home_page/background.png"
        alt=""
        width={260}
        height={260}
        className="pointer-events-none absolute bottom-[100px] left-0 opacity-40"
      />

      <div className="relative z-10 mt-6 w-full px-6">
        <div className="relative -mt-[111px] h-[360px] w-full overflow-hidden rounded-[28px] md:h-[340px]">
          <Image
            src="/assets/nav-bar/navbar_bg_image.png"
            alt="Hero Background"
            fill
            priority
            className="object-cover"
          />
          <div className="relative z-10 mt-16 px-8 py-4 text-white md:py-8 md:px-20">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div className="mt-4 md:mt-5">
              <h1
                className={`text-[14px] font-bold uppercase text-white sm:text-[18px] md:text-[24px] ${lang === "kh" ? "font-khmer" : ""}`}
              >
                {greeting[lang]}
                {userName ? `, ${userName}` : ""}
              </h1>
              <h2
                className={`mt-1 text-[28px] font-bold leading-none text-secondary sm:text-[36px] md:text-[48px] ${lang === "kh" ? "font-khmer" : ""}`}
              >
                {content.title[lang]}
              </h2>
              <div className="mt-3 flex flex-col items-start gap-5 md:mt-4 md:flex-row md:items-center md:justify-between md:gap-4">
                <p className={`text-[12px] sm:text-[14px] md:text-[18px] ${lang === "kh" ? "font-khmer" : ""}`}>
                  {content.description[lang]}
                </p>
                <Link
                  href={roleButton.href}
                  className={`flex shrink-0 items-center gap-2 rounded-2xl bg-secondary px-6 py-3 text-[14px] font-semibold text-black transition hover:opacity-90 ${lang === "kh" ? "font-khmer" : ""}`}
                >
                  <PlusCircleIcon className="h-5 w-5" />
                  {roleButton.label[lang]}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="relative z-10 px-4 py-6 lg:px-[200px]">
        {/* Section title row + currency toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className={lang === "kh" ? "font-khmer" : ""}>
            <DashboardSectionTitleOverview
              label={OVERVIEW_TEXT[lang]}
              title={content.section[lang]}
            />
          </div>
          <CurrencyToggle currency={currency} onChange={setCurrency} />
        </div>

        {role === "BUYER" && (
          <>
            <DashboardStatsOverview
              orders={orders}
              contracts={contracts}
              currency={currency}
              totalContracts={buyerTotalContracts}
              activeContracts={buyerActiveContracts}
              availableRefundAmount={
                currency === "KHR"
                  ? buyerAvailableRefundKhr
                  : buyerAvailableRefundUsd
              }
            />
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.9fr_0.9fr]">
              <div className="space-y-4">
                <PaymentSummaryOverview
                  contracts={contracts}
                  orders={orders}
                  currency={currency}
                />
                <ExchangeRateCardOverview exchangeRates={safeExchangeRates} />
              </div>
              <EscrowStatusCardOverview
                contracts={contracts}
                orders={orders}
                currency={currency}
              />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.9fr_2fr]">
              <CropDemandTableOverview
                role="BUYER"
                cropDemands={ownCropDemands}
                cropProducts={cropProducts}
              />
              <RecentOrdersOverview
                orders={orders}
                role="BUYER"
                currency={currency}
              />
            </div>
          </>
        )}

        {role === "FARMER" && (
          <>
            <CompleteOrderComponent
              orders={orders}
              contracts={contracts}
              currency={currency}
              activeCropPosts={farmerActiveCropPosts}
              totalContracts={farmerTotalContracts}
              activeContracts={farmerActiveContracts}
              availableWithdrawAmount={
                currency === "KHR"
                  ? farmerAvailableWithdrawKhr
                  : farmerAvailableWithdrawUsd
              }
            />
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.9fr_0.9fr]">
              <div className="space-y-4">
                <PaymentSummaryOverview
                  contracts={contracts}
                  orders={orders}
                  currency={currency}
                />
                <ExchangeRateCardOverview exchangeRates={safeExchangeRates} />
              </div>
              <MonthlyOrdersChart orders={orders} />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.9fr_0.9fr]">
              <CropDemandTableOverview
                role="FARMER"
                cropDemands={cropDemands}
                cropProducts={ownCropProducts}
              />
              <RecentOrdersOverview
                orders={orders}
                role="FARMER"
                currency={currency}
              />
            </div>
          </>
        )}

        {role === "GOVERNMENT" && (
          <>
            <PreviousMonthComparison
              totalCropNames={governmentTotalCropNames ?? totalCrops}
              totalCropTypes={governmentTotalCropTypes ?? cropTypes.length}
              totalContracts={governmentTotalContracts ?? contracts.length}
              totalOrders={governmentTotalOrders ?? orders.length}
            />
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_0.9fr]">
              <div className="space-y-4">
                <ExchangeRateCardOverview exchangeRates={safeExchangeRates} />
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
                  <PriceChangeHistoryChart
                    marketPrices={marketPrices}
                    priceHistory={governmentPriceHistory}
                  />
                  <MonthlyOrdersChart
                    orders={orders}
                    monthlyOrders={governmentMonthlyOrders}
                  />
                </div>
                <PriceHistoryList
                  marketPrices={marketPrices}
                  priceChanges={governmentPriceChanges}
                />
              </div>
              <div className="space-y-4">
                <RecentOrdersOverview
                  orders={orders}
                  role="GOVERNMENT"
                  currency={currency}
                />
                <LeadingCropCard
                  topValueCrops={topValueCrops}
                  topVolumeCrops={topVolumeCrops}
                />
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function CropCatalogShortcut({ cropTypes }: { cropTypes: CropType[] }) {
  const { language } = useI18n();
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  const cropCount = cropTypes.reduce(
    (total, cropType) => total + (cropType.crops ?? []).length,
    0,
  );

  return (
    <section className="rounded-2xl border border-[#EAECF0] bg-white p-5 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Layers3 className="h-6 w-6" />
          </div>
          <div className={`min-w-0 ${lang === "kh" ? "font-khmer" : ""}`}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#98A2B3]">
              {CROP_CATALOG_TEXT.cropManagement[lang]}
            </p>
            <h3 className="mt-1 text-lg font-bold text-[#101828]">
              {CROP_CATALOG_TEXT.cropCatalog[lang]}
            </h3>
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-[#667085]">
              <span className="inline-flex items-center gap-1 rounded-lg bg-[#F2F4F7] px-2.5 py-1">
                <Layers3 className="h-3.5 w-3.5" />
                {cropTypes.length} {CROP_CATALOG_TEXT.cropTypes[lang]}
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-[#F2F4F7] px-2.5 py-1">
                <Sprout className="h-3.5 w-3.5" />
                {cropCount} {CROP_CATALOG_TEXT.crops[lang]}
              </span>
            </div>
          </div>
        </div>
        <Link
          href="/overview-dashboard/crop-management"
          className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary/90 ${lang === "kh" ? "font-khmer" : ""}`}
        >
          {CROP_CATALOG_TEXT.manageCatalog[lang]}
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
