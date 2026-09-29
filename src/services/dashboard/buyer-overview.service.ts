import "server-only";

import { env } from "@/lib/env";
import headerToken from "@/lib/headerToken";
import type { Contract } from "@/services/contract.service";
import type { CropDemandItem } from "@/services/crop-demand.service";
import type { CropProduct } from "@/services/crop-product.service";
import type { ExchangeRate } from "@/services/exchange-rate.service";
import type { Order } from "@/services/order.service";
import type { BuyerDashboardOverview } from "@/types/overview-dashboard";

type BackendBuyerDashboardOverview = Omit<
  BuyerDashboardOverview,
  "exchangeRates" | "ownCropDemands" | "cropProducts"
> & {
  exchangeRates?: { ex?: ExchangeRate[]; rates?: ExchangeRate[] } | null;
  ownCropDemands?: { items?: CropDemandItem[] } | CropDemandItem[] | null;
  cropProducts?: { items?: CropProduct[] } | CropProduct[] | null;
  orders?: Order[] | null;
  contracts?: Contract[] | null;
};

type BackendResponse = {
  success?: boolean;
  message?: string;
  payload?: BackendBuyerDashboardOverview | null;
};

function listFromPayload<T>(value: { items?: T[] } | T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  return value?.items ?? [];
}

function exchangeRatesFromPayload(
  value: BackendBuyerDashboardOverview["exchangeRates"],
) {
  return value?.ex ?? value?.rates ?? [];
}

function countActiveContracts(contracts: Contract[]) {
  return contracts.filter((contract) => contract.status === "LOCKED").length;
}

export async function getBuyerDashboardOverviewService(): Promise<BuyerDashboardOverview> {
  const res = await fetch(`${env.NEXT_BASE_API_URL}/dashboard/overview/buyer`, {
    headers: await headerToken(),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as BackendResponse | null;

  if (!res.ok || !json?.success || !json.payload) {
    throw new Error(
      json?.message ?? `Failed to fetch buyer dashboard overview (${res.status}).`,
    );
  }

  const payload = json.payload;
  const contracts = payload.contracts ?? [];

  return {
    ...payload,
    role: "BUYER",
    orders: payload.orders ?? [],
    contracts,
    exchangeRates: exchangeRatesFromPayload(payload.exchangeRates),
    ownCropDemands: listFromPayload(payload.ownCropDemands),
    cropProducts: listFromPayload(payload.cropProducts),
    stats: {
      totalContracts: payload.stats?.totalContracts ?? contracts.length,
      activeContracts:
        payload.stats?.activeContracts ?? countActiveContracts(contracts),
      availableRefundUsd: Number(payload.stats?.availableRefundUsd ?? 0),
      availableRefundKhr: Number(payload.stats?.availableRefundKhr ?? 0),
    },
  };
}
