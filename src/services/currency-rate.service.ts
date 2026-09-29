import { env } from "@/lib/env";
import headerToken from "@/lib/headerToken";

type CurrencyRatePayload = {
  ask: string;
  average: string;
  bid: string;
  date: string;
  key: string;
  unit: number;
};

type CurrencyRateEnvelope = {
  status: number;
  message: string;
  payload: CurrencyRatePayload;
  success: boolean;
  timestamp: string;
};

export const FALLBACK_KHR_PER_USD = 4000;

export async function getUsdToKhrRateService(): Promise<number> {
  try {
    const headers = await headerToken();

    const res = await fetch(`${env.NEXT_BASE_API_URL}/currency-rates/USD`, {
      next: { revalidate: 86400, tags: ["currency-rates", "currency-rate-USD"] },
      headers,
    });

    if (!res.ok) return FALLBACK_KHR_PER_USD;

    const data = (await res.json().catch(() => null)) as CurrencyRateEnvelope | null;

    if (!data?.success || !data.payload) return FALLBACK_KHR_PER_USD;

    const rate = Number(data.payload.average ?? data.payload.bid ?? data.payload.ask);

    return Number.isFinite(rate) && rate > 0 ? rate : FALLBACK_KHR_PER_USD;
  } catch {
    return FALLBACK_KHR_PER_USD;
  }
}
