"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

import type { AdminRequestPaymentDetail } from "@/types/admin/requestPayment";
import RequestWorkflow from "./RequestWorkflowComponent";
import RequestDetailsCard from "./RequestDetailCardComponent";
import RequestReasonCard from "./RequestReasonCardComponent";
import RelatedOrderCard from "./RelatedOrderCardComponent";
import RequestByCard from "./RquestByCardComponent";
import RequestActionPanel from "./RequestActionPanelCmponent";
import { PaymentStatusBadge } from "./ShareComponent";

interface RequestPaymentDetailViewProps {
  request: AdminRequestPaymentDetail;
  orderEscrowBalance?: number | null;
  orderCurrencyCode?: string | null;
}

export default function RequestPaymentDetailView({
  request,
  orderEscrowBalance,
  orderCurrencyCode,
}: RequestPaymentDetailViewProps) {
  const [status, setStatus] = useState(request.status);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="px-6 pt-5">
        <Link
          href="/request-payment-management"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-stone-800"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back to Requests
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 px-6 pb-10 lg:grid-cols-[1fr_320px]">
        <main className="flex flex-col gap-5">
          <RequestWorkflow status={status} />
          <RequestDetailsCard
            request={request}
            orderEscrowBalance={orderEscrowBalance}
            orderCurrencyCode={orderCurrencyCode}
          />
          <RequestReasonCard reason={request.reason} />
        </main>

        <aside className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Review Request
            </h2>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-700">
                {request.requestType === "WITHDRAW"
                  ? "Farmer Withdrawal"
                  : "Buyer Refund"}
              </span>
              <PaymentStatusBadge status={status} />
            </div>
          </div>

          {request.orderId && (
            <RelatedOrderCard orderId={request.orderId} />
          )}

          <RequestByCard user={request.requester} />

          <RequestActionPanel
            requestId={request.requestId}
            status={status}
            amount={Number(request.amount)}
            currencyCode={request.currencyCode}
            onStatusChange={setStatus}
          />
        </aside>
      </div>
    </div>
  );
}
