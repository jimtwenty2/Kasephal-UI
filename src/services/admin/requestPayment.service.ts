import "server-only";

import headerToken from "@/lib/headerToken";
import type {
  AdminPaymentRequestStatus,
  AdminRequestPaymentApiResponse,
  AdminRequestPaymentDetail,
  AdminRequestPaymentList,
  AdminRequestPaymentListParams,
  AdminReviewedPaymentRequest,
} from "@/types/admin/requestPayment";

const API_BASE_URL = process.env.NEXT_BASE_API_URL;

export async function getAdminRequestPayments({
  requestType,
  status,
  page = 1,
  size = 8,
}: AdminRequestPaymentListParams = {}): Promise<AdminRequestPaymentList> {
  const headers = await headerToken();
  const url = new URL(`${API_BASE_URL}/admin/request-payment`);

  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(size));

  if (requestType) url.searchParams.set("requestType", requestType);
  if (status) url.searchParams.set("status", status);

  const res = await fetch(url.toString(), {
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch admin payment requests");
  }

  const data: AdminRequestPaymentApiResponse<AdminRequestPaymentList> =
    await res.json();

  return data.payload;
}

export async function getAdminRequestPaymentDetail(
  requestId: string,
): Promise<AdminRequestPaymentDetail> {
  const headers = await headerToken();
  const res = await fetch(`${API_BASE_URL}/admin/request-payment/${requestId}`, {
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch admin payment request detail");
  }

  const data: AdminRequestPaymentApiResponse<AdminRequestPaymentDetail> =
    await res.json();

  return data.payload;
}

// PATCH /payment-requests/{requestId}/review — admin approves (issues a KHQR
// payment for the admin to scan) or rejects a withdraw/refund request.
export async function reviewAdminPaymentRequest(
  requestId: string,
  status: AdminPaymentRequestStatus,
  note: string,
): Promise<AdminReviewedPaymentRequest> {
  const headers = await headerToken();
  const res = await fetch(
    `${API_BASE_URL}/payment-requests/${requestId}/review`,
    {
      method: "PATCH",
      cache: "no-store",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, note }),
    },
  );

  // Success is the standard envelope; errors may be RFC problem+json.
  const data = (await res.json().catch(() => null)) as
    | (AdminRequestPaymentApiResponse<AdminReviewedPaymentRequest> & {
        detail?: string;
        title?: string;
      })
    | null;

  if (!res.ok || !data?.success || !data.payload) {
    console.error(
      "Review payment request failed:",
      res.status,
      JSON.stringify(data),
    );
    throw new Error(
      data?.message ||
        data?.detail ||
        data?.title ||
        `Failed to review request (${res.status}).`,
    );
  }

  return data.payload;
}

// POST /payment-requests/check-transaction — reconcile the admin's payout QR
// against Bakong by its md5. Returns the updated request (status flips to
// SUCCESS once the transaction settles).
export async function checkAdminPaymentRequestTransaction(
  md5: string,
): Promise<AdminReviewedPaymentRequest> {
  const headers = await headerToken();
  const res = await fetch(
    `${API_BASE_URL}/payment-requests/check-transaction`,
    {
      method: "POST",
      cache: "no-store",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ md5 }),
    },
  );

  // Success is the standard envelope; errors may be RFC problem+json.
  const data = (await res.json().catch(() => null)) as
    | (AdminRequestPaymentApiResponse<AdminReviewedPaymentRequest> & {
        detail?: string;
        title?: string;
      })
    | null;

  if (!res.ok || !data?.success || !data.payload) {
    console.error(
      "Check payment request transaction failed:",
      res.status,
      JSON.stringify(data),
    );
    throw new Error(
      data?.message ||
        data?.detail ||
        data?.title ||
        `Failed to check transaction (${res.status}).`,
    );
  }

  return data.payload;
}
