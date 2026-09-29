import PaymentStats from "./_components/PaymentStats";
import PaymentRequestTable from "./_components/PaymentRequestTable";
import { getAdminRequestPayments } from "@/services/admin/requestPayment.service";
import type {
  AdminPaymentRequestStatus,
  AdminPaymentRequestType,
} from "@/types/admin/requestPayment";
import { ITEMS_PER_PAGE } from "./_components/ShareComponent";

interface PaymentRequestPageProps {
  searchParams?: Promise<{
    requestType?: string;
    status?: string;
    page?: string;
  }>;
}

const REQUEST_TYPES: AdminPaymentRequestType[] = ["WITHDRAW", "REFUND"];
const STATUSES: AdminPaymentRequestStatus[] = [
  "PENDING",
  "WAITING_PROOF",
  "APPROVED",
  "SUCCESS",
  "FAILED",
];

function parseRequestType(value?: string): AdminPaymentRequestType {
  return REQUEST_TYPES.includes(value as AdminPaymentRequestType)
    ? (value as AdminPaymentRequestType)
    : "WITHDRAW";
}

function parseStatus(value?: string): AdminPaymentRequestStatus | undefined {
  return STATUSES.includes(value as AdminPaymentRequestStatus)
    ? (value as AdminPaymentRequestStatus)
    : undefined;
}

function parsePage(value?: string) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default async function PaymentRequestPage({
  searchParams,
}: PaymentRequestPageProps) {
  const params = await searchParams;
  const requestType = parseRequestType(params?.requestType);
  const status = parseStatus(params?.status);
  const page = parsePage(params?.page);

  const paymentRequests = await getAdminRequestPayments({
    requestType,
    status,
    page,
    size: ITEMS_PER_PAGE,
  });

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 overflow-y-auto">
        <PaymentStats
          paid={paymentRequests.paidCount}
          pending={paymentRequests.pendingCount}
          rejected={paymentRequests.rejectedCount}
        />
        <PaymentRequestTable
          data={paymentRequests}
          activeType={requestType}
          statusFilter={status ?? "ALL"}
        />
      </main>
    </div>
  );
}
