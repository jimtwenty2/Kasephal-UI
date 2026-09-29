import "server-only";

import React from "react";
import { Banknote, Gavel, ShieldCheck } from "lucide-react";

import headerToken from "@/lib/headerToken";
import type { Activity, FinancialSummary, TransactionData } from "@/types/adminType";
import type {
  AdminOverview,
  AdminOverviewApiPayload,
  AdminOverviewApiResponse,
  AdminOverviewPeriod,
  AdminOverviewStats,
} from "@/types/admin/overview";

const PERIOD_TO_RANGE: Record<AdminOverviewPeriod, string> = {
  MONTH: "Month",
  THREE_MONTHS: "3 Mo",
  SIX_MONTHS: "6 Mo",
  YEAR: "Year",
};

const PERIODS: AdminOverviewPeriod[] = [
  "MONTH",
  "THREE_MONTHS",
  "SIX_MONTHS",
  "YEAR",
];

function toNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }

  return fallback;
}

function formatRelativeTime(value?: string) {
  if (!value) return "";

  const createdAt = new Date(value).getTime();
  if (!Number.isFinite(createdAt)) return "";

  const diffSeconds = Math.round((createdAt - Date.now()) / 1000);
  const divisions = [
    { amount: 60, unit: "second" },
    { amount: 60, unit: "minute" },
    { amount: 24, unit: "hour" },
    { amount: 7, unit: "day" },
    { amount: 4.34524, unit: "week" },
    { amount: 12, unit: "month" },
    { amount: Number.POSITIVE_INFINITY, unit: "year" },
  ] as const;

  let duration = diffSeconds;
  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
        Math.round(duration),
        division.unit,
      );
    }
    duration /= division.amount;
  }

  return "";
}

function formatCurrency(value: unknown) {
  const amount = toNumber(value);
  if (amount === 0 && value == null) return "";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function buildStats(payload: AdminOverviewApiPayload): AdminOverviewStats {
  return {
    registeredUsers: toNumber(payload.registeredUsers),
    activeUsers: toNumber(payload.activeUsers),
    activeUserRate: toNumber(payload.activeUserRate),
    pendingVerify: toNumber(payload.pendingVerification),
    contracts: toNumber(payload.contracts?.total),
    activeContracts: toNumber(payload.contracts?.active),
    completedContracts: toNumber(payload.contracts?.completed),
  };
}

function buildStatCards(stats: AdminOverviewStats) {
  const activeRateLabel =
    stats.registeredUsers > 0
      ? `${stats.activeUsers.toLocaleString()} out of ${stats.registeredUsers.toLocaleString()} users active (${stats.activeUserRate.toFixed(1)}%)`
      : "No registered users yet";

  return [
    {
      title: "Registered Users",
      value: stats.registeredUsers,
      topBorderColor: "border-t-4 border-amber-400",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      progressBar: {
        current: stats.activeUsers,
        total: Math.max(stats.registeredUsers, 1),
        label: activeRateLabel,
      },
    },
    {
      title: "Pending Verify",
      value: stats.pendingVerify,
      linkAction: {
        text: "Identity Verification",
        href: "/identity-verification",
      },
    },
    {
      title: "Contract",
      value: stats.contracts,
      subMetrics: {
        active: stats.activeContracts,
        completed: stats.completedContracts,
      },
    },
  ];
}

function buildFinancials(payload: AdminOverviewApiPayload): FinancialSummary {
  const escrow = payload.escrow;

  return {
    totalEscrowHolding: toNumber(escrow?.totalHolding),
    // Fall back to the legacy mixed total for USD so the figure still renders
    // before the per-currency backend fields are deployed.
    totalEscrowHoldingUsd: toNumber(escrow?.totalHoldingUsd ?? escrow?.totalHolding),
    totalEscrowHoldingKhr: toNumber(escrow?.totalHoldingKhr),
    availableLiquidity: toNumber(escrow?.availableLiquidity),
    availableLiquidityUsd: toNumber(
      escrow?.availableLiquidityUsd ?? escrow?.availableLiquidity,
    ),
    availableLiquidityKhr: toNumber(escrow?.availableLiquidityKhr),
  };
}

function buildTransactionData(payload: AdminOverviewApiPayload): TransactionData {
  const transactionVolume = payload.transactionVolume;

  return {
    totalVolume: toNumber(transactionVolume?.totalVolume),
    totalVolumeUsd: toNumber(
      transactionVolume?.totalVolumeUsd ?? transactionVolume?.totalVolume,
    ),
    totalVolumeKhr: toNumber(transactionVolume?.totalVolumeKhr),
    actionableVolume: toNumber(transactionVolume?.actionableVolume),
    actionableVolumeUsd: toNumber(
      transactionVolume?.actionableVolumeUsd ?? transactionVolume?.actionableVolume,
    ),
    actionableVolumeKhr: toNumber(transactionVolume?.actionableVolumeKhr),
    points:
      transactionVolume?.monthlyVolumes?.map((item) => ({
        month: item.month,
        volume: toNumber(item.volume),
        volumeUsd: toNumber(item.volumeUsd ?? item.volume),
        volumeKhr: toNumber(item.volumeKhr),
      })) ?? [],
  };
}

function getActivityIconType(activityType?: string): Activity["iconType"] {
  if (activityType === "ESCROW_RELEASE") return "escrow";
  if (activityType === "DISPUTE_RAISED") return "dispute";

  return "verification";
}

function getActivityIcon(iconType: Activity["iconType"]) {
  if (iconType === "escrow") return React.createElement(Banknote, { size: 18 });
  if (iconType === "dispute") return React.createElement(Gavel, { size: 18 });

  return React.createElement(ShieldCheck, { size: 18 });
}

function getActivityIconClass(iconType: Activity["iconType"]) {
  if (iconType === "escrow") return "bg-emerald-100 text-emerald-700";
  if (iconType === "dispute") return "bg-red-100 text-red-600";

  return "bg-yellow-100 text-yellow-700";
}

function buildRecentActivities(payload: AdminOverviewApiPayload): Activity[] {
  return (payload.recentActivities ?? []).map((activity, index) => {
    const iconType = getActivityIconType(activity.activityType);
    const amount = formatCurrency(activity.amount);

    return {
      id: activity.referenceId ?? `${activity.activityType}-${index}`,
      icon: getActivityIcon(iconType),
      iconType,
      iconClassName: getActivityIconClass(iconType),
      type: activity.title,
      name: activity.detail || activity.title,
      subtitle: activity.userLabel ?? "",
      amount: amount || activity.userLabel || "",
      amountClassName: amount ? "text-[#107446]" : undefined,
      time: formatRelativeTime(activity.createdAt),
      action: activity.actionLabel || "Review",
    };
  });
}

async function fetchAdminOverviewPeriod(
  period: AdminOverviewPeriod,
): Promise<AdminOverviewApiPayload> {
  const headers = await headerToken();
  const url = new URL(`${process.env.NEXT_BASE_API_URL}/admin/overview`);
  url.searchParams.set("period", period);

  const res = await fetch(url.toString(), {
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch admin overview");
  }

  const data: AdminOverviewApiResponse = await res.json();
  return data.payload;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const payloads = await Promise.all(PERIODS.map(fetchAdminOverviewPeriod));
  const defaultPayload =
    payloads.find(
      (payload) => payload.transactionVolume?.period === "SIX_MONTHS",
    ) ?? payloads[0];

  const stats = buildStats(defaultPayload);
  const chartDataByRange = Object.fromEntries(
    payloads.map((payload, index) => {
      const period = payload.transactionVolume?.period ?? PERIODS[index];
      return [PERIOD_TO_RANGE[period], buildTransactionData(payload)];
    }),
  );

  return {
    stats,
    statCards: buildStatCards(stats),
    financials: buildFinancials(defaultPayload),
    chartDataByRange,
    recentActivities: buildRecentActivities(defaultPayload),
  };
}
