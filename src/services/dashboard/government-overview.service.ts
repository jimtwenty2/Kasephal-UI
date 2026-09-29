import "server-only";

import { env } from "@/lib/env";
import headerToken from "@/lib/headerToken";
import type { Contract } from "@/services/contract.service";
import type { CropProduct } from "@/services/crop-product.service";
import type { ExchangeRate } from "@/services/exchange-rate.service";
import type { Order } from "@/services/order.service";
import type { Crop, CropType } from "@/types/cropType";
import type { MarketPrice } from "@/types/market-price";
import type {
  GovernmentDashboardOverview,
  GovernmentLeadingCrop,
  GovernmentMonthlyOrder,
  GovernmentPriceChange,
  GovernmentPriceHistory,
} from "@/types/overview-dashboard";

type BackendGovernmentDashboardOverview = Omit<
  GovernmentDashboardOverview,
  "exchangeRates" | "cropProducts"
> & {
  exchangeRates?: { ex?: ExchangeRate[]; rates?: ExchangeRate[] } | null;
  cropProducts?: { items?: CropProduct[] } | CropProduct[] | null;
  marketPrices?: MarketPrice[] | null;
  leadingCrops?: {
    topByValue?: GovernmentLeadingCrop[] | null;
    topByVolume?: GovernmentLeadingCrop[] | null;
  } | null;
  monthlyOrders?: GovernmentMonthlyOrder[] | null;
  priceChanges?: GovernmentPriceChange[] | null;
  priceHistory?: GovernmentPriceHistory | null;
  cropTypes?: CropType[] | null;
  crops?: Crop[] | null;
  orders?: Order[] | null;
  contracts?: Contract[] | null;
};

type BackendResponse = {
  success?: boolean;
  message?: string;
  payload?: BackendGovernmentDashboardOverview | null;
};

function listFromPayload<T>(value: { items?: T[] } | T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  return value?.items ?? [];
}

function exchangeRatesFromPayload(
  value: BackendGovernmentDashboardOverview["exchangeRates"],
) {
  return value?.ex ?? value?.rates ?? [];
}

export async function getGovernmentDashboardOverviewService(): Promise<GovernmentDashboardOverview> {
  const res = await fetch(`${env.NEXT_BASE_API_URL}/dashboard/overview/government`, {
    headers: await headerToken(),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as BackendResponse | null;

  if (!res.ok || !json?.success || !json.payload) {
    throw new Error(
      json?.message ?? `Failed to fetch government dashboard overview (${res.status}).`,
    );
  }

  const payload = json.payload;
  const orders = payload.orders ?? [];
  const contracts = payload.contracts ?? [];
  const cropTypes = payload.cropTypes ?? [];
  const crops = payload.crops ?? [];

  return {
    ...payload,
    role: "GOVERNMENT",
    orders,
    contracts,
    exchangeRates: exchangeRatesFromPayload(payload.exchangeRates),
    marketPrices: payload.marketPrices ?? [],
    leadingCrops: {
      topByValue: payload.leadingCrops?.topByValue ?? [],
      topByVolume: payload.leadingCrops?.topByVolume ?? [],
    },
    monthlyOrders: payload.monthlyOrders ?? [],
    priceChanges: payload.priceChanges ?? [],
    priceHistory: payload.priceHistory ?? null,
    cropTypes,
    crops,
    cropProducts: listFromPayload(payload.cropProducts),
    stats: {
      totalCropNames: payload.stats?.totalCropNames ?? crops.length,
      totalCropTypes: payload.stats?.totalCropTypes ?? cropTypes.length,
      totalContracts: payload.stats?.totalContracts ?? contracts.length,
      totalOrders: payload.stats?.totalOrders ?? orders.length,
    },
  };
}
