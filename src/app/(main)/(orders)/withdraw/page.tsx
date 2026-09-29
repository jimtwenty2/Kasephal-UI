// page.tsx
import Image from "next/image";

import { UserRole } from "@/types/user-role";
import { getOrderByIdService } from "@/services/order.service";
import { getUserProfile } from "@/services/own-profile.service";
import {
  getMyRequestPaymentsService,
  isActiveRequestPaymentStatus,
} from "@/services/requestPayment.service";
import { getOrderCurrencyCode } from "@/utils/orderDisplay";
import WithdrawalHeader from "./_components/WithdrawalHeader";
import WithdrawalSection from "./_components/WithdrawalSection";
import BuyerRefundPage from "./_components/BuyerRefundPage";
import WithdrawalBreadcrumb from "./_components/WithdrawalBreadcrumb";

type Props = {
  searchParams?: Promise<{
    orderId?: string;
    role?: UserRole;
  }>;
};

export default async function Page({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const rawRole = String(params.role ?? UserRole.FARMER).toLowerCase();
  const role =
    rawRole === UserRole.BUYER || rawRole === UserRole.GOVERNMENT
      ? UserRole.BUYER
      : UserRole.FARMER;
  const orderId = params.orderId;

  const orderDetailHref = orderId
    ? `/order-history/${orderId}`
    : "/order-history";

  const [order, profile, myRequests] = await Promise.all([
    orderId ? getOrderByIdService(orderId) : Promise.resolve(null),
    getUserProfile().catch(() => null),
    getMyRequestPaymentsService(),
  ]);

  const availableAmount = order?.escrowBalance ?? 0;
  const currencyCode = order ? getOrderCurrencyCode(order) : "USD";
  const hasBakongAccount = Boolean(
    profile?.payload?.personalInfo?.bakongAccountId?.trim(),
  );
  const requestType = role === UserRole.FARMER ? "WITHDRAW" : "REFUND";
  const hasActiveRequest = Boolean(
    orderId &&
      myRequests.some(
        (request) =>
          request.orderId === orderId &&
          request.requestType === requestType &&
          isActiveRequestPaymentStatus(request.status),
      ),
  );

  return (
    <div>
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

      <main className="relative min-h-screen overflow-hidden bg-[#fbf6e9] px-6">
        <div className="pointer-events-none absolute right-0 top-[10%] z-0 h-[clamp(240px,32vw,480px)] w-[clamp(240px,32vw,480px)] translate-x-1/2 rounded-full bg-amber-300 opacity-15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[4%] left-0 z-0 h-[clamp(240px,32vw,480px)] w-[clamp(240px,32vw,480px)] -translate-x-1/2 rounded-full bg-yellow-300 opacity-15 blur-3xl" />

        <Image
          src="/assets/srov.png"
          width={260}
          height={260}
          alt="srov"
          className="pointer-events-none absolute right-0 top-[15%] z-0 h-auto max-h-[50%] w-[clamp(240px,9vw,200px)] object-contain opacity-50"
        />

        <Image
          src="/assets/srov2.png"
          width={260}
          height={260}
          alt="srov2"
          className="pointer-events-none absolute bottom-0 left-0 z-0 h-auto max-h-[50%] w-[clamp(240px,11vw,200px)] object-contain opacity-50"
        />

        <div className="relative z-10 px-28">
          <WithdrawalBreadcrumb
            role={role}
            orderDetailHref={orderDetailHref}
          />

          {role === UserRole.FARMER && (
            <section className="w-full py-6">
              <WithdrawalHeader />

              <WithdrawalSection
                orderId={orderId}
                availableAmount={availableAmount}
                orderCurrencyCode={currencyCode}
                hasBakongAccount={hasBakongAccount}
                hasActiveRequest={hasActiveRequest}
              />
            </section>
          )}

          {role === UserRole.BUYER && (
            <section className="w-full py-6">
              <BuyerRefundPage
                orderId={orderId}
                availableAmount={availableAmount}
                orderCurrencyCode={currencyCode}
                hasBakongAccount={hasBakongAccount}
                hasActiveRequest={hasActiveRequest}
              />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
