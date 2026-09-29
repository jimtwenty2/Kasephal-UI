export type AdminPaymentRequestType = "REFUND" | "WITHDRAW";

export type AdminPaymentRequestStatus =
  | "PENDING"
  | "WAITING_PROOF"
  | "APPROVED"
  | "SUCCESS"
  | "FAILED";

export type AdminPaymentStatus = "PENDING" | "FAILED" | "PAID";

export type AdminPaymentRequesterRole =
  | "ADMIN"
  | "GOVERNMENT"
  | "BUYER"
  | "FARMER";

export interface AdminPagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface AdminRequestPaymentItem {
  requestId: string;
  requestCode: string | null;
  requestType: AdminPaymentRequestType;
  status: AdminPaymentRequestStatus;
  amount: number | string;
  currencyCode: string | null;
  submittedAt: string;
  orderId: string | null;
  orderCode: string | null;
  requesterId: string;
  requesterName: string;
  requesterProfileUrl: string | null;
  requesterRole: AdminPaymentRequesterRole;
  farmerId?: string | null;
  farmerName?: string | null;
  farmerProfileUrl?: string | null;
  buyerId?: string | null;
  buyerName?: string | null;
  buyerProfileUrl?: string | null;
  farmer?: AdminRequestPaymentParty | null;
  buyer?: AdminRequestPaymentParty | null;
}

export interface AdminRequestPaymentParty {
  userId?: string | null;
  name?: string | null;
  fullName?: string | null;
  profileUrl?: string | null;
  role?: AdminPaymentRequesterRole | null;
}

export interface AdminRequestPaymentList {
  paidCount: number;
  pendingCount: number;
  rejectedCount: number;
  withdrawCount: number;
  refundCount: number;
  items: AdminRequestPaymentItem[];
  pagination: AdminPagination;
}

export interface AdminRequestPaymentRequester {
  userId: string;
  name: string;
  profileUrl: string | null;
  role: AdminPaymentRequesterRole;
  bakongAccountId: string | null;
}

export interface AdminRequestPaymentActivePayment {
  paymentId: string;
  amount: number | string;
  qrString: string | null;
  md5: string | null;
  deepLink: string | null;
  status: AdminPaymentStatus;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  orderId: string | null;
  paidBy: string | null;
  paymentRequestId: string | null;
}

export interface AdminRequestPaymentDetail {
  requestId: string;
  requestCode: string | null;
  requestType: AdminPaymentRequestType;
  status: AdminPaymentRequestStatus;
  workflowStage: string | null;
  amount: number | string;
  currencyCode: string | null;
  reason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  orderId: string | null;
  orderCode: string | null;
  requester: AdminRequestPaymentRequester;
  activePayment: AdminRequestPaymentActivePayment | null;
}

// Body for PATCH /payment-requests/{requestId}/review.
export interface AdminReviewPaymentRequestBody {
  status: AdminPaymentRequestStatus;
  note: string;
}

// Response payload of the review endpoint — the updated request, including the
// freshly-issued payment (with the KHQR string the admin scans) when approved.
export interface AdminReviewedPaymentRequest {
  paymentRequestId: string;
  amount: number | string;
  reason: string | null;
  requestType: AdminPaymentRequestType;
  status: AdminPaymentRequestStatus;
  createdAt: string;
  updatedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  orderId: string | null;
  requestedBy: string;
  activePayment: AdminRequestPaymentActivePayment | null;
}

export interface AdminRequestPaymentListParams {
  requestType?: AdminPaymentRequestType;
  status?: AdminPaymentRequestStatus;
  page?: number;
  size?: number;
}

export interface AdminRequestPaymentApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  payload: T;
  timestamp: string;
}
