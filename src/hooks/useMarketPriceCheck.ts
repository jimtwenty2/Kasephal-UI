"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { checkMarketPriceAction } from "@/action/market-price/check-market-price.action";
import type {
  MarketPriceCheckContext,
  MarketPriceCheckResponse,
} from "@/types/market-price";

type Input = {
  context: MarketPriceCheckContext;
  postId?: string | null;
  unitType?: string | null;
  currencyCode?: string | null;
  pricePerUnit?: number | null;
  enabled?: boolean;
};

export function useMarketPriceCheck({
  context,
  postId,
  unitType,
  currencyCode,
  pricePerUnit,
  enabled = true,
}: Input) {
  const [data, setData] = useState<MarketPriceCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const canCheck = useMemo(
    () =>
      Boolean(
        enabled &&
          postId &&
          unitType &&
          currencyCode &&
          pricePerUnit &&
          pricePerUnit > 0,
      ),
    [currencyCode, enabled, postId, pricePerUnit, unitType],
  );

  const checkNow = useCallback(async () => {
    if (!canCheck) {
      setData(null);
      setError(null);
      return null;
    }

    setIsChecking(true);
    const result = await checkMarketPriceAction({
      context,
      postId: postId!,
      unitType: unitType!,
      currencyCode: currencyCode!,
      pricePerUnit: pricePerUnit!,
    });
    setIsChecking(false);

    if (!result.success) {
      setData(null);
      setError(result.error);
      return null;
    }

    setData(result.data);
    setError(null);
    return result.data;
  }, [canCheck, context, currencyCode, postId, pricePerUnit, unitType]);

  useEffect(() => {
    if (!canCheck) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void checkNow();
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [canCheck, checkNow]);

  return {
    data: canCheck ? data : null,
    error: canCheck ? error : null,
    isChecking: canCheck ? isChecking : false,
    checkNow,
  };
}
