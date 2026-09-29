import { env } from "@/lib/env";
import headerToken from "@/lib/headerToken";
import { ApiResponse } from "@/types/api-response";
import {
  CreateMarketPriceRequest,
  MarketPrice,
  MarketPriceCheckRequest,
  MarketPriceCheckResponse,
  UpdateMarketPriceBulkRequest,
} from "@/types/market-price";

interface ProblemDetails {
  detail?: string;
  title?: string;
  status?: number;
  instance?: string;
  timestamp?: string;
}

export async function getMarketPrices(): Promise<MarketPrice[]> {
  const headers = await headerToken();

  const res = await fetch(
    `${env.NEXT_BASE_API_URL}/market-price?page=1&size=100`,
    {
      headers,
      cache: "no-store",
    },
  );

  const body = await res.text();

  if (!res.ok) {
    console.error(`Failed to fetch market prices (${res.status}):`, body);
    return [];
  }

  if (!body) return [];

  const result: ApiResponse<MarketPrice[]> = JSON.parse(body);

  return result.payload ?? [];
}

export async function createMarketPrice(
  payload: CreateMarketPriceRequest,
): Promise<MarketPrice> {
  const headers = await headerToken();
  const res = await fetch(`${env.NEXT_PUBLIC_BASE_API_URL}/market-price`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const body = await res.text();

  if (!res.ok) {
    throw new Error(`Failed to create market price (${res.status}) : ${body}`);
  }

  const result: ApiResponse<MarketPrice> = JSON.parse(body);

  return result.payload;
}

export async function updateMarketPricesBulk(
  payload: UpdateMarketPriceBulkRequest[],
): Promise<MarketPrice[]> {
  const headers = await headerToken();
 
  const res = await fetch(`${env.NEXT_BASE_API_URL}/market-price/bulk`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
    cache: "no-store",
  });
 
  const body = await res.text();
 
  if (!res.ok) {
    let detail: string | undefined;
 
    try {
      const problem = JSON.parse(body) as ProblemDetails;
      detail = problem.detail || problem.title;
    } catch {
    }
 
    throw new Error(detail || `Failed to update market prices (${res.status}): ${body}`);
  }
 
  const result: ApiResponse<MarketPrice[]> = JSON.parse(body);
 
  return result.payload ?? [];
}



export async function deleteMarketPrice(marketPriceId: string): Promise<void> {
  const headers = await headerToken();

  const res = await fetch(
    `${env.NEXT_BASE_API_URL}/market-price/${marketPriceId}`,
    {
      method: "DELETE",
      headers,
      cache: "no-store",
    },
  );

  const body = await res.text();

  if (!res.ok) {
    throw new Error(`Failed to delete market price (${res.status}): ${body}`);
  }
}

export async function checkMarketPrice(
  payload: MarketPriceCheckRequest,
): Promise<MarketPriceCheckResponse> {
  const headers = await headerToken();

  const res = await fetch(`${env.NEXT_BASE_API_URL}/market-price/check`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const body = await res.text();

  if (!res.ok) {
    throw new Error(getApiErrorMessage(body, res.status));
  }

  const result: ApiResponse<MarketPriceCheckResponse> = JSON.parse(body);

  return result.payload;
}

function getApiErrorMessage(body: string, status: number) {
  if (!body) return `Failed to check market price (${status}).`;

  try {
    const parsed = JSON.parse(body) as {
      message?: string;
      detail?: string;
      title?: string;
      error?: string;
    };

    return (
      parsed.message ??
      parsed.detail ??
      parsed.error ??
      parsed.title ??
      `Failed to check market price (${status}).`
    );
  } catch {
    return body;
  }
}
