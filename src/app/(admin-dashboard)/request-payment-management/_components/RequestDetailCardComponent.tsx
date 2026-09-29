import type { ReactNode } from "react";

import type { AdminRequestPaymentDetail } from "@/types/admin/requestPayment";
import {
  formatCurrency,
  formatDateTime,
  formatOrderDisplayId,
  formatRequestDisplayId,
} from "./ShareComponent";

interface RequestDetailsCardProps {
  request: AdminRequestPaymentDetail;
  orderEscrowBalance?: number | null;
  orderCurrencyCode?: string | null;
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
        {label}
      </p>
      <div className="text-sm font-medium text-stone-800">{children}</div>
    </div>
  );
}

export default function RequestDetailsCard({
  request,
  orderEscrowBalance,
  orderCurrencyCode,
}: RequestDetailsCardProps) {
  const hasOrderEscrowBalance =
    typeof orderEscrowBalance === "number" && Number.isFinite(orderEscrowBalance);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white px-6 py-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-stone-900">Request Details</h3>
        <p className="text-xs font-medium text-stone-400">
          ID: {formatRequestDisplayId(request.requestId)}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <FieldGroup label="Requested By">
          <span>{request.requester.name}</span>
        </FieldGroup>

        <FieldGroup label="Amount">
          <span className="text-emerald-700">
            {formatCurrency(request.amount, request.currencyCode)}
          </span>
        </FieldGroup>

        <FieldGroup label="Order Escrow Balance">
          <span className="text-emerald-700">
            {hasOrderEscrowBalance
              ? formatCurrency(orderEscrowBalance, orderCurrencyCode)
              : "N/A"}
          </span>
        </FieldGroup>

        <FieldGroup label="Bakong ID">
          <span>{request.requester.bakongAccountId ?? "N/A"}</span>
        </FieldGroup>

        {request.orderId && (
          <FieldGroup label="Order ID">
            <span className="font-semibold text-emerald-700">
              {formatOrderDisplayId(request.orderId)}
            </span>
          </FieldGroup>
        )}

        <FieldGroup label="Submitted Date">
          <span>{formatDateTime(request.submittedAt)}</span>
        </FieldGroup>

        <FieldGroup label="Reviewed Date">
          <span>{formatDateTime(request.reviewedAt)}</span>
        </FieldGroup>
      </div>
    </div>
  );
}
