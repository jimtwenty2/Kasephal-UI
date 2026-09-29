import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getOrderByIdService } from "@/services/order.service";
import { getPaymentsByOrderIdService } from "@/services/payment.service";
import PaymentClient from "../_component/PaymentClient";
import Image from "next/image";
import { getPaymentCurrencyCode } from "@/utils/currency";

type PageProps = {
  searchParams: Promise<{
    orderId?: string;
    amountToPay?: string;
  }>;
};

function getPositiveNumber(value: unknown) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
}

function isPaidStatus(value: unknown) {
  const status = String(value ?? "").toUpperCase();

  return status === "PAID" || status === "SUCCESS";
}

function isBuyerPayment(
  payment: { status?: unknown; paidBy?: string | null },
  buyerId?: string | null,
) {
  if (!isPaidStatus(payment.status)) return false;
  if (!payment.paidBy || !buyerId) return true;
  return payment.paidBy === buyerId;
}

export default async function PaymentProductPage({ searchParams }: PageProps) {
  const { orderId, amountToPay } = await searchParams;

  if (!orderId) {
    redirect("/order-history");
  }

  const session = await auth();
  if (!session?.user?.accessToken) {
    redirect("/login");
  }

  const [order, payments] = await Promise.all([
    getOrderByIdService(orderId),
    getPaymentsByOrderIdService(orderId),
  ]);

  if (!order) {
    redirect("/order-history");
  }
  const queryAmount = getPositiveNumber(amountToPay);
  const orderAmount =
    getPositiveNumber(order.remainingAmount) ??
    getPositiveNumber(order.totalAmount) ??
    getPositiveNumber(order.depositAmount) ??
    getPositiveNumber(order.quantity * order.pricePerUnit) ??
    0;
  const paymentCurrencyCode = getPaymentCurrencyCode(order.currencyCode);
  const paymentAmount =
    queryAmount == null
      ? orderAmount
      : Math.min(queryAmount, orderAmount);
  const initialIsPaid =
    payments.some((payment) => isBuyerPayment(payment, order.buyerId)) ||
    isPaidStatus(order.paymentStatus) ||
    isPaidStatus(order.payment?.status) ||
    Boolean(
      order.payments?.some((payment) =>
        isBuyerPayment(payment, order.buyerId),
      ),
    );

  return (
    <div className="min-h-screen w-full bg-background font-thicccboi text-foreground">
       <div className="mt-9 min-w-full px-6">
               <div className="relative z-0 -mt-30 h-20 w-full overflow-hidden rounded-[28px]">
                 <Image
                   src="/assets/nav-bar/navbar_bg_image.png"
                   alt="Hero Background"
                   fill
                   sizes="100vw"
                   className="object-cover"
                   priority
                 />
               </div>
             </div>
      <PaymentClient
      orderId={orderId}
      buyerName={order.buyerName ?? "Buyer"}
      farmerName={order.farmerName ?? "Farmer"}
      productName={order.cropName ?? "Crop Product"}
      quantity={order.quantity ?? 0}
      unitType={order.unitType ?? "KG"}
      totalAmount={paymentAmount}
      currencyCode={paymentCurrencyCode}
      chatRoomId={order.chatRoomId}
      initialIsPaid={initialIsPaid}
    />
    </div>
    
  );
}
