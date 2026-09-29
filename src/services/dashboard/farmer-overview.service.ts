import "server-only";

import { env } from "@/lib/env";
import headerToken from "@/lib/headerToken";
import type { Contract } from "@/services/contract.service";
import type { CropDemandItem } from "@/services/crop-demand.service";
import type { ExchangeRate } from "@/services/exchange-rate.service";
import type { Order } from "@/services/order.service";
import type { CropProductPost } from "@/types/crop-product";
import type { FarmerDashboardOverview } from "@/types/overview-dashboard";

type BackendFarmerDashboardOverview = Omit<
  FarmerDashboardOverview,
  "exchangeRates" | "cropDemands" | "ownCropProducts"
> & {
  exchangeRates?: { ex?: ExchangeRate[]; rates?: ExchangeRate[] } | null;
  cropDemands?: { items?: CropDemandItem[] } | CropDemandItem[] | null;
  ownCropProducts?: { items?: CropProductPost[] } | CropProductPost[] | null;
  orders?: Order[] | null;
  contracts?: Contract[] | null;
};

type BackendResponse = {
  success?: boolean;
  message?: string;
  payload?: BackendFarmerDashboardOverview | null;
};

function listFromPayload<T>(value: { items?: T[] } | T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  return value?.items ?? [];
}

function exchangeRatesFromPayload(
  value: BackendFarmerDashboardOverview["exchangeRates"],
) {
  return value?.ex ?? value?.rates ?? [];
}

function countActiveContracts(contracts: Contract[]) {
  return contracts.filter((contract) => contract.status === "LOCKED").length;
}

export async function getFarmerDashboardOverviewService(): Promise<FarmerDashboardOverview> {
  const res = await fetch(`${env.NEXT_BASE_API_URL}/dashboard/overview/farmer`, {
    headers: await headerToken(),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as BackendResponse | null;

  if (!res.ok || !json?.success || !json.payload) {
    throw new Error(
      json?.message ?? `Failed to fetch farmer dashboard overview (${res.status}).`,
    );
  }

  const payload = json.payload;
  const contracts = payload.contracts ?? [];

  return {
    ...payload,
    role: "FARMER",
    orders: payload.orders ?? [],
    contracts,
    exchangeRates: exchangeRatesFromPayload(payload.exchangeRates),
    cropDemands: listFromPayload(payload.cropDemands),
    ownCropProducts: listFromPayload(payload.ownCropProducts),
    stats: {
      activeCropPosts: payload.stats?.activeCropPosts ?? 0,
      totalContracts: payload.stats?.totalContracts ?? contracts.length,
      activeContracts:
        payload.stats?.activeContracts ?? countActiveContracts(contracts),
      availableWithdrawUsd: Number(payload.stats?.availableWithdrawUsd ?? 0),
      availableWithdrawKhr: Number(payload.stats?.availableWithdrawKhr ?? 0),
    },
  };
}
