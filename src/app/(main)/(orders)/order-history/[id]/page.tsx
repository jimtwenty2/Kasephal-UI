import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import OrderDetailPageComponent from "../../_component/history-component/OrderDetailComponent";
import { getOrderByIdService, debugGetOrderById } from "@/services/order.service";
import { getPaymentsByOrderIdService } from "@/services/payment.service";
import {
  getMyRequestPaymentsService,
  isActiveRequestPaymentStatus,
} from "@/services/requestPayment.service";
import { getDeliveryTrackingService } from "@/services/delivery-tracking.service";
import { getReviewsByOrderService } from "@/services/review.service";
import { getOrderReportGuard } from "@/services/Report.service";
import { type UserProfile } from "@/services/profile.service";
import {
  getUserProfile,
  getUserProfileById,
} from "@/services/own-profile.service";
import { auth } from "@/auth";
import { UserRole } from "@/types/user-role";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getOrderById(id: string) {
  return getOrderByIdService(decodeURIComponent(id));
}

// Fetch a counterparty's profile payload (basicInfo + personalInfo) via the same
// service the /other-profile pages use, which reliably returns email + avatar.
// Null-safe: getUserProfileById throws on a missing id / non-2xx, so we swallow
// it here and return null, keeping the order page resilient (it then falls back
// to the order's denormalized name/avatar) without touching the shared service.
async function getCounterpartyProfile(userId?: string | null) {
  if (!userId) return null;
  try {
    const res = await getUserProfileById(userId);
    return res?.payload ?? null;
  } catch {
    return null;
  }
}

// The signed-in user's own profile via /profile/me. Null-safe (getUserProfile
// throws on a non-2xx), so callers fall back to the order's denormalized data.
async function getMyProfile() {
  try {
    const res = await getUserProfile();
    return res?.payload ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    return {
      title: "Order Not Found",
    };
  }

  return {
    title: `Order Details #${order.orderId.toUpperCase()} — Kasephal`,
    description: `Order detail for ${order.cropName}.`,
  };
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    // TEMP DEBUG: surface the real API response instead of a blank 404.
    const debug = await debugGetOrderById(id);
    return (
      <pre className="m-6 overflow-auto rounded-lg bg-black p-4 text-xs text-green-400">
        {JSON.stringify(debug, null, 2)}
      </pre>
    );
  }

  // The session role decides the escrow action shown (withdraw vs refund).
  const session = await auth();
  const role = session?.user?.role ?? UserRole.BUYER;

  // Whether the user already has an in-flight request for this order, so the
  // detail page can show a "submitted" label instead of letting them re-request.
  // A FAILED/rejected request doesn't count — they may submit again. Null-safe:
  // a failed fetch yields an empty list, so the action stays available.
  const [myRequests, payments, deliveryTracking, reviews] = await Promise.all([
    getMyRequestPaymentsService(),
    getPaymentsByOrderIdService(order.orderId),
    getDeliveryTrackingService(order.orderId),
    getReviewsByOrderService(order.orderId),
  ]);
  const paidPaymentStatus = payments.find((payment) =>
    ["PAID", "SUCCESS"].includes(String(payment.status).toUpperCase()),
  )?.status;
  const orderWithPayments = {
    ...order,
    payments,
    paymentStatus:
      paidPaymentStatus ??
      order.paymentStatus ??
      payments[0]?.status,
  };
  const requiredRequestType = role === UserRole.FARMER ? "WITHDRAW" : "REFUND";
  const alreadyRequested = myRequests.some(
    (request) =>
      request.orderId === orderWithPayments.orderId &&
      request.requestType === requiredRequestType &&
      isActiveRequestPaymentStatus(request.status),
  );

  // The id of the viewer's active report (PENDING / WAITING_PROOF / APPROVED)
  // on this order, if any — lets the detail page swap "Report Issue" for a
  // "View Report" link. Null-safe: a failed lookup leaves the button active.
  const reporterId = session?.user?.userId;
  let activeReportId: string | null = null;
  if (reporterId) {
    try {
      const reportGuard = await getOrderReportGuard(order.orderId, reporterId);
      activeReportId = reportGuard.blocked
        ? reportGuard.report?.reportIssueId ?? null
        : null;
    } catch {
      activeReportId = null;
    }
  }

  // Fetch the real counterparty profiles (phone, email, name, avatar) by the
  // ids the order carries. Both fetches are null-safe; we merge over the order's
  // denormalized name/avatar so the cards still render if a fetch fails — no
  // crash to this or any other page.
  // /profile/{id} rejects fetching your own id ("You cannot view your own
  // profile"), so resolve the viewer's own side from /profile/me and only call
  // /profile/{id} for the counterparty. Works whichever role is viewing.
  const myProfile = await getMyProfile();
  const myUserId = myProfile?.basicInfo?.userId;
  const resolveProfile = (userId?: string | null) =>
    userId && myUserId && userId === myUserId
      ? Promise.resolve(myProfile)
      : getCounterpartyProfile(userId);

  const [fetchedFarmer, fetchedBuyer] = await Promise.all([
    resolveProfile(orderWithPayments.farmerId),
    resolveProfile(orderWithPayments.buyerId),
  ]);

  const farmerProfile = {
    ...fetchedFarmer,
    basicInfo: {
      ...fetchedFarmer?.basicInfo,
      profileUrl:
        fetchedFarmer?.basicInfo?.profileUrl || order.farmerProfileUrl || "",
      phoneNumber: fetchedFarmer?.basicInfo?.phoneNumber ?? "",
    },
    personalInfo: {
      ...fetchedFarmer?.personalInfo,
      fullName: fetchedFarmer?.personalInfo?.fullName || orderWithPayments.farmerName || "",
    },
  } as unknown as UserProfile;

  const buyerProfile = {
    ...fetchedBuyer,
    basicInfo: {
      ...fetchedBuyer?.basicInfo,
      profileUrl:
        fetchedBuyer?.basicInfo?.profileUrl || orderWithPayments.buyerProfileUrl || "",
      email: fetchedBuyer?.basicInfo?.email ?? "",
    },
    personalInfo: {
      ...fetchedBuyer?.personalInfo,
      fullName: fetchedBuyer?.personalInfo?.fullName || orderWithPayments.buyerName || "",
    },
  } as unknown as UserProfile;

  return (
    <div className="overflow-x-clip">
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

      <main className="relative min-h-screen overflow-hidden">
        {/* Yellow blur glow circles — behind the decorative crops */}
        <div className="pointer-events-none absolute right-0 top-[10%] z-0 h-[clamp(240px,32vw,480px)] w-[clamp(240px,32vw,480px)] translate-x-1/2 rounded-full bg-amber-300 opacity-15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[4%] left-0 z-0 h-[clamp(240px,32vw,480px)] w-[clamp(240px,32vw,480px)] -translate-x-1/2 rounded-full bg-yellow-300 opacity-15 blur-3xl" />

        {/* Decorative background crops */}
        <Image
          src="/assets/srov.png"
          width={260}
          height={260}
          alt="srov"
          className="pointer-events-none absolute right-0 top-[15%] z-0 hidden h-auto max-h-[50%] w-[clamp(100px,9vw,200px)] object-contain opacity-50 sm:block"
        />
        <Image
          src="/assets/srov2.png"
          width={260}
          height={260}
          alt="srov2"
          className="pointer-events-none absolute bottom-0 left-0 z-0 hidden h-auto max-h-[50%] w-[clamp(100px,11vw,200px)] object-contain opacity-50 sm:block"
        />

        <div className="relative z-10 px-4 sm:px-6 md:px-12 lg:px-28">
          <OrderDetailPageComponent
            order={orderWithPayments}
            role={role}
            farmerProfile={farmerProfile}
            buyerProfile={buyerProfile}
            alreadyRequested={alreadyRequested}
            deliveryTracking={deliveryTracking}
            reviews={reviews}
            currentUserId={session?.user?.userId ?? null}
            activeReportId={activeReportId}
          />
        </div>
      </main>
    </div>
  );
}
