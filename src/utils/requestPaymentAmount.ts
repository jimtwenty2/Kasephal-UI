// Helpers for the user-facing withdraw/refund (request-payment) amount field.
// The user picks the request currency (KHR/USD); KHR is whole + divisible by
// 100, USD allows up to 2 decimals. The available (deposit) cap is converted
// from the order's currency into the selected currency using a fixed rate.

export type RequestCurrency = "KHR" | "USD";

// Fallback only — the live USD/KHR rate comes from getExchangeRatesService().
export const KHR_PER_USD_FALLBACK = 4100;

export function isKHR(currencyCode?: string): boolean {
    return (currencyCode ?? "").toUpperCase() === "KHR";
}

// Normalises any order currency to one of the two supported request currencies.
export function toRequestCurrency(currencyCode?: string): RequestCurrency {
    return isKHR(currencyCode) ? "KHR" : "USD";
}

export function convertAmount(
    value: number,
    fromCurrency: string | undefined,
    toCurrency: string | undefined,
    khrPerUsd: number = KHR_PER_USD_FALLBACK,
): number {
    if (!Number.isFinite(value)) return 0;
    const rate =
        Number.isFinite(khrPerUsd) && khrPerUsd > 0
            ? khrPerUsd
            : KHR_PER_USD_FALLBACK;
    const fromKhr = isKHR(fromCurrency);
    const toKhr = isKHR(toCurrency);
    if (fromKhr === toKhr) return value;
    return toKhr ? value * rate : value / rate;
}

// The available cap expressed in the target currency, floored to that currency's
// precision so the displayed maximum is actually reachable by a valid input.
export function availableInCurrency(
    value: number,
    fromCurrency: string | undefined,
    toCurrency: string | undefined,
    khrPerUsd: number = KHR_PER_USD_FALLBACK,
): number {
    const converted = convertAmount(value, fromCurrency, toCurrency, khrPerUsd);
    return isKHR(toCurrency)
        ? Math.floor(converted)
        : Math.floor(converted * 100) / 100;
}

export function currencySymbol(currencyCode?: string): string {
    return isKHR(currencyCode) ? "៛" : "$";
}

export function formatRequestAmount(
    value: number,
    currencyCode?: string,
): string {
    const khr = isKHR(currencyCode);
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode || "USD",
        minimumFractionDigits: khr ? 0 : 2,
        maximumFractionDigits: khr ? 0 : 2,
    }).format(Number.isFinite(value) ? value : 0);
}

// Restricts free typing to a positive number with currency-correct precision:
// KHR = digits only; USD = digits + up to 2 decimals. Strips signs/symbols/"e".
export function sanitizeAmountInput(
    value: string,
    currencyCode?: string,
): string {
    if (isKHR(currencyCode)) {
        return value.replace(/[^\d]/g, "");
    }

    let v = value.replace(/[^\d.]/g, "");
    const firstDot = v.indexOf(".");
    if (firstDot !== -1) {
        const intPart = v.slice(0, firstDot);
        const decPart = v
            .slice(firstDot + 1)
            .replace(/\./g, "")
            .slice(0, 2);
        v = `${intPart}.${decPart}`;
    }
    return v;
}

export type AmountValidation =
    | { ok: true; amount: number }
    | { ok: false; error: string };

export function validateRequestAmount(
    amountStr: string,
    available: number,
    currencyCode?: string,
): AmountValidation {
    const amount = Number(amountStr);

    if (!amountStr.trim() || !Number.isFinite(amount) || amount <= 0) {
        return { ok: false, error: "Please enter a valid amount greater than 0." };
    }

    if (isKHR(currencyCode)) {
        if (!Number.isInteger(amount) || amount % 100 !== 0) {
            return {
                ok: false,
                error: "KHR amount must be a whole number divisible by 100.",
            };
        }
    } else if (Math.round(amount * 100) !== amount * 100) {
        return { ok: false, error: "Amount can have at most 2 decimal places." };
    }

    if (amount > available) {
        return {
            ok: false,
            error: `Amount exceeds the available balance of ${formatRequestAmount(
                available,
                currencyCode,
            )}.`,
        };
    }

    return { ok: true, amount };
}
