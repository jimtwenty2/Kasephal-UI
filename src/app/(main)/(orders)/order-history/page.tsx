import React from "react";
import Image from "next/image";
import OrderHistoryTable from "../_component/history-component/OrderHistoryTableComponent";
import { getOrdersService } from "@/services/order.service";
export const dynamic = "force-dynamic";

export default async function OrderHistoryPage() {
  const orders = await getOrdersService();

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

      <main className="relative min-h-screen overflow-hidden bg-[#fbf6e9]">
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
          <OrderHistoryTable orders={orders} />
        </div>
      </main>
    </div>
  );
}
