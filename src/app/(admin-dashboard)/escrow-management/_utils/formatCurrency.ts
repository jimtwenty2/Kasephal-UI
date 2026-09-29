// Shared money formatter for the escrow-management screens. KHR is shown with
// the riel sign (៛) and no decimals; USD with a "$" prefix and 2 decimals.
export function formatCurrency(amount: number | string, currency: "KHR" | "USD") {
  const value = Number(amount || 0);

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: currency === "USD" ? 2 : 0,
    maximumFractionDigits: currency === "USD" ? 2 : 0,
  }).format(value);

  if (currency === "KHR") {
    return `៛${formatted}`;
  }

  return `$${formatted}`;
}
