import { auth } from "@/auth";
import { env } from "@/lib/env";
import { ApiResponse } from "@/types/api-response";

export type ExchangeRate = {
  ask: string;
  average: string;
  bid: string;
  date: string;
  key: string;
  unit: number;
};

export type ExchangeRatePayload = {
  ex: ExchangeRate[];
};

export async function getExchangeRatesService(): Promise<ExchangeRate[]> {
  try {
    const session = await auth();

    if (!session?.user?.accessToken) {
      return [];
    }

    const response = await fetch(`${env.NEXT_BASE_API_URL}/currency-rates`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });

    if (!response.ok) {
      return [];
    }

    const result: ApiResponse<ExchangeRatePayload> = await response.json();

    return result.payload?.ex ?? [];
  } catch {
    return [];
  }
}