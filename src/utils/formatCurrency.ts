// Formats a monetary amount with a currency symbol. KHR uses the riel sign (៛)
// with 0 decimals (riel has no minor unit in practice); other currencies use $
// with 2 decimals. Matches the symbol style used by the withdraw/refund cards.
export function formatCurrency(amount: number, currencyCode?: string): string {
    const khr = (currencyCode || "USD").toUpperCase() === "KHR";
    const symbol = khr ? "៛" : "$";
    const value = (Number.isFinite(amount) ? amount : 0).toLocaleString(
        "en-US",
        {
            minimumFractionDigits: khr ? 0 : 2,
            maximumFractionDigits: khr ? 0 : 2,
        },
    );
    return `${symbol}${value}`;
}
