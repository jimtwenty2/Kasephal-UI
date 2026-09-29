import { notFound } from "next/navigation";

import { getAdminRequestPaymentDetail } from "@/services/admin/requestPayment.service";
import { getOrderByIdService } from "@/services/order.service";
import { getOrderCurrencyCode } from "@/utils/orderDisplay";
import RequestPaymentDetailView from "../_components/RequestPaymentDetailViewComponentt";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PaymentRequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  let request;

  try {
    request = await getAdminRequestPaymentDetail(id);
  } catch {
    notFound();
  }

  const order = request.orderId
    ? await getOrderByIdService(request.orderId).catch(() => null)
    : null;

  return (
    <RequestPaymentDetailView
      request={request}
      orderEscrowBalance={order?.escrowBalance}
      orderCurrencyCode={order ? getOrderCurrencyCode(order) : undefined}
    />
  );
}
