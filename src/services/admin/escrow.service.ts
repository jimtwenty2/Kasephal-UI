import "server-only";

import headerToken from "@/lib/headerToken";
import type {
  AdminEscrowListItem,
  AdminEscrowManagement,
  AdminEscrowManagementApiResponse,
  AdminEscrowManagementParams,
  AdminEscrowPeriod,
  AdminEscrowStatus,
  AdminEscrowTimelinePoint,
} from "@/types/admin/escrow";

const API_BASE_URL = process.env.NEXT_BASE_API_URL;

type ApiRecord = Record<string, unknown>;

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null;
}

function toNumber(value: unknown, fallback = 0) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function normalizeStatus(value: unknown): AdminEscrowStatus {
  const status = toString(value, "PENDING").toUpperCase();

  if (status === "PENDING" || status === "APPROVED" || status === "REJECTED") {
    return status;
  }

  return "PENDING";
}

function normalizePeriod(value: unknown): AdminEscrowPeriod {
  const period = toString(value, "THIS_MONTH").toUpperCase();

  if (
    period === "THIS_WEEK" ||
    period === "THIS_MONTH" ||
    period === "THIS_YEAR"
  ) {
    return period;
  }

  return "THIS_MONTH";
}

function getArray(payload: unknown) {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];

  return (
    [
      payload.items,
      payload.content,
      payload.data,
      payload.escrows,
      payload.transactions,
    ].find(Array.isArray) ?? []
  );
}

function normalizeCurrency(value: unknown): "USD" | "KHR" {
  return toString(value, "USD").toUpperCase() === "KHR" ? "KHR" : "USD";
}

function normalizeTimeline(value: unknown): AdminEscrowTimelinePoint[] {
  if (!Array.isArray(value)) return [];

  return value.filter(isRecord).map((point) => {
    const amountUsd = toNumber(point.amountUsd ?? point.amount_usd ?? point.amount);
    const amountKhr = toNumber(point.amountKhr ?? point.amount_khr);

    return {
      label: toString(point.label ?? point.date ?? point.period),
      amount: amountUsd,
      amountUsd,
      amountKhr,
    };
  });
}

function normalizeItem(value: unknown): AdminEscrowListItem {
  const item = isRecord(value) ? value : {};

  return {
    escrowId: toString(
      item.escrowId ??
        item.escrow_id ??
        item.escrowTransactionId ??
        item.escrow_transaction_id ??
        item.id,
    ),
    escrowCode: toString(item.escrowCode ?? item.escrow_code) || null,
    orderId: toString(item.orderId ?? item.order_id),
    orderCode: toString(item.orderCode ?? item.order_code) || null,
    amount: toNumber(item.amount),
    currencyCode: normalizeCurrency(item.currencyCode ?? item.currency_code),
    status: normalizeStatus(item.status),
    createdAt: toString(item.createdAt ?? item.created_at ?? item.date),
  };
}

function normalizePagination(
  payload: unknown,
  items: AdminEscrowListItem[],
  page: number,
  size: number,
) {
  const source = isRecord(payload)
    ? isRecord(payload.pagination)
      ? payload.pagination
      : payload
    : {};
  const totalElements = toNumber(
    source.totalElements ??
      source.total_items ??
      source.totalItems ??
      source.total ??
      source.count,
    items.length,
  );

  return {
    page: toNumber(source.page, page),
    size: toNumber(source.size, size),
    totalElements,
    totalPages: toNumber(
      source.totalPages ?? source.total_pages,
      Math.max(1, Math.ceil(totalElements / size)),
    ),
  };
}

function normalizeManagement(
  payload: unknown,
  params: Required<Pick<AdminEscrowManagementParams, "period" | "page" | "size">>,
): AdminEscrowManagement {
  const source = isRecord(payload) ? payload : {};
  const items = getArray(payload).map(normalizeItem);

  return {
    totalEscrowHold: toNumber(
      source.totalEscrowHold ??
        source.total_escrow_hold ??
        source.totalHolding ??
        source.total_holding,
    ),
    totalEscrowHoldUsd: toNumber(
      source.totalEscrowHoldUsd ?? source.total_escrow_hold_usd,
    ),
    totalEscrowHoldKhr: toNumber(
      source.totalEscrowHoldKhr ?? source.total_escrow_hold_khr,
    ),
    totalContracts: toNumber(
      source.totalContracts ?? source.total_contracts ?? source.contracts,
    ),
    period: normalizePeriod(source.period ?? params.period),
    timeline: normalizeTimeline(source.timeline ?? source.chart ?? source.points),
    items,
    pagination: normalizePagination(payload, items, params.page, params.size),
  };
}

function emptyManagement(
  params: Required<Pick<AdminEscrowManagementParams, "period" | "page" | "size">>,
): AdminEscrowManagement {
  return {
    totalEscrowHold: 0,
    totalEscrowHoldUsd: 0,
    totalEscrowHoldKhr: 0,
    totalContracts: 0,
    period: params.period,
    timeline: [],
    items: [],
    pagination: {
      page: params.page,
      size: params.size,
      totalElements: 0,
      totalPages: 1,
    },
  };
}

export async function getAdminEscrowManagement({
  status,
  period = "THIS_MONTH",
  page = 1,
  size = 8,
}: AdminEscrowManagementParams = {}): Promise<AdminEscrowManagement> {
  const headers = await headerToken();
  const url = new URL(`${API_BASE_URL}/admin/escrow-management`);

  url.searchParams.set("period", period);
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(size));

  if (status) url.searchParams.set("status", status);

  const res = await fetch(url.toString(), {
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    console.error(
      "Failed to fetch admin escrow management",
      res.status,
      errorText,
    );

    return emptyManagement({ period, page, size });
  }

  const data: AdminEscrowManagementApiResponse = await res.json();

  return normalizeManagement(data.payload, { period, page, size });
}
