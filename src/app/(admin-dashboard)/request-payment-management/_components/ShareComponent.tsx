import type {
  AdminPaymentRequestStatus,
  AdminPaymentRequestType,
} from "@/types/admin/requestPayment";

export const REQUEST_TYPE_TABS: AdminPaymentRequestType[] = [
  "WITHDRAW",
  "REFUND",
];

export const REQUEST_TYPE_TAB_LABEL: Record<AdminPaymentRequestType, string> = {
  WITHDRAW: "Withdraw Requests",
  REFUND: "Refund Requests",
};

export const PARTY_COLUMN_LABEL: Record<AdminPaymentRequestType, string> = {
  WITHDRAW: "Farmer",
  REFUND: "Buyer",
};

export const STATUS_LABEL: Record<AdminPaymentRequestStatus, string> = {
  PENDING: "Pending",
  WAITING_PROOF: "Waiting Proof",
  // APPROVED only means the payout QR was issued; the request isn't complete
  // until the admin finishes paying (SUCCESS), so show it as Pending.
  APPROVED: "Pending",
  SUCCESS: "Paid",
  FAILED: "Failed",
};

export const ITEMS_PER_PAGE = 8;

export function formatCurrency(
  amount: number | string,
  currencyCode?: string | null,
): string {
  const value = typeof amount === "number" ? amount : Number(amount);
  const isKhr = (currencyCode || "USD").toUpperCase() === "KHR";

  // Prepend the symbol manually (riel ៛ / dollar $) instead of using the
  // currency-style Intl formatter: locale-based currency output (e.g. km-KH)
  // differs between the server's ICU and the browser, causing hydration
  // mismatches. Plain en-US number formatting is consistent on both.
  const formatted = (Number.isFinite(value) ? value : 0).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: isKhr ? 0 : 2,
      maximumFractionDigits: isKhr ? 0 : 2,
    },
  );
  return isKhr ? `៛${formatted}` : `$${formatted}`;
}

export function formatKHR(amount: number): string {
  const formatted = (Number.isFinite(amount) ? amount : 0).toLocaleString(
    "en-US",
    { maximumFractionDigits: 0 },
  );
  return `៛${formatted}`;
}

export function formatRequestDisplayId(id: string): string {
  const compactId = id.replace(/-/g, "");
  const suffix = compactId.slice(-4).toUpperCase();

  return `#REQ-${suffix || "----"}`;
}

export function formatOrderDisplayId(id?: string | null): string {
  if (!id) return "N/A";

  const compactId = id.replace(/-/g, "");
  const suffix = compactId.slice(-4).toUpperCase();

  return `#ORD-${suffix || "----"}`;
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return "N/A";

  const dateTime = new Date(iso);
  if (Number.isNaN(dateTime.getTime())) return "N/A";

  const date = dateTime.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const time = dateTime.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${date} - ${time}`;
}

export function PaymentStatusBadge({
  status,
}: {
  status: AdminPaymentRequestStatus;
}) {
  const styles: Record<AdminPaymentRequestStatus, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    WAITING_PROOF: "bg-blue-100 text-blue-700",
    // Shown as Pending until the payout is actually paid.
    APPROVED: "bg-amber-100 text-amber-800",
    SUCCESS: "bg-emerald-100 text-emerald-700",
    FAILED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold ${styles[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
