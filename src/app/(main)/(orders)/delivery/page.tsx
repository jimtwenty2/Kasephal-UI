import React from "react";
import Image from "next/image";

import FarmerDeliveryTrackingPage from "./_components/FarmerDeliveryTrackingPage";

import { UserRole } from "@/types/user-role";
import { getDeliveryTrackingService } from "@/services/delivery-tracking.service";
import { getOrderByIdService } from "@/services/order.service";
import { hasCurrentUserReviewedOrderService } from "@/services/review.service";
import DeliveryPage from "./_components/DeliveryPage";
import Link from "next/link";

type Props = {
  searchParams?: Promise<{
    orderId?: string;
    role?: UserRole;
  }>;
};

export default async function Page({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const roleParam = String(params.role ?? UserRole.FARMER).toLowerCase();
  const role =
    roleParam === UserRole.BUYER || roleParam === UserRole.GOVERNMENT
      ? UserRole.BUYER
      : UserRole.FARMER;
  const orderId = params.orderId;

  const [tracking, order, alreadyRated] = orderId
    ? await Promise.all([
        getDeliveryTrackingService(orderId),
        getOrderByIdService(orderId),
        hasCurrentUserReviewedOrderService(orderId),
      ])
    : [null, null, false];

  return (
    <main className="relative overflow-x-clip">
      {/* Yellow blur glow circles — behind the decorative crops */}
      <div className="pointer-events-none absolute right-0 top-[10%] z-0 h-[clamp(240px,32vw,480px)] w-[clamp(240px,32vw,480px)] translate-x-1/2 rounded-full bg-amber-300 opacity-15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[4%] left-0 z-0 h-[clamp(240px,32vw,480px)] w-[clamp(240px,32vw,480px)] -translate-x-1/2 rounded-full bg-yellow-300 opacity-15 blur-3xl" />

      {/* Decorative background crops */}
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

      <div className="mt-9 min-w-full px-6">
        <div className="relative z-0 -mt-30 h-20 w-full overflow-hidden rounded-[28px]">
          <Image
            src="/assets/nav-bar/navbar_bg_image.png"
            alt="Hero Background"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
      <div className="relative z-10 px-28">
        <nav className="flex items-center px-4 pt-8 text-xs text-muted md:px-12 md:text-sm">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span>&rsaquo;</span>
            <Link href="/order-history" className="hover:underline text-muted">
              Order History
            </Link>
            <span>&rsaquo;</span>
            <Link
              href={`/order-history/${orderId}`}
              className="hover:underline text-muted"
            >
              Order Detail
            </Link>
            <span>&rsaquo;</span>
            <span className="font-bold text-primary">Deivery</span>
          </div>
        </nav>

        {/* FARMER */}
        {role === UserRole.FARMER && (
          <FarmerDeliveryTrackingPage
            tracking={tracking}
            order={order}
            alreadyRated={alreadyRated}
          />
        )}

        {/* BUYER */}
        {role === UserRole.BUYER && (
          <DeliveryPage
            tracking={tracking}
            order={order}
            alreadyRated={alreadyRated}
          />
        )}
      </div>
    </main>
  );
}
