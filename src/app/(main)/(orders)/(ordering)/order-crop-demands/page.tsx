// import React from "react";
// import OrderWithContractForm from "../../_component/order-component/CreateOrderWithoutContractForm"; 
// import Image from "next/image";

// export const metadata = {
//   title: "New Contract Order — AgriLink",
//   description: "Create a direct agricultural escrow order from a contract.",
// };

// export default function SimpleContractOrderPage() {
//   return (
//     <main className="min-h-screen bg-[#fbf6e9]">
//       {/* Renders the form instantly with its default values */}
//       <div className="w-full px-4">
//         <div className="relative z-0 -mt-[100px] h-auto min-h-[148px] w-full overflow-hidden rounded-[24px] bg-emerald-950 shadow-sm md:h-[148px] md:rounded-[28px]">
//           <Image
//             src="/assets/nav-bar/navbar_bg_image.png"
//             alt="Hero Background"
//             fill
//             priority
//             className="object-cover brightness-[0.8]"
//           />
//         </div>
//       </div>
//       <OrderWithContractForm />
//     </main>
//   );
// }

import React from "react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCropDemandByPostIdAction } from "@/action/crop-demand.action";
import {
  getContractByIdService,
  getOrderContractByChatRoomService,
} from "@/services/contract.service";
import { getExchangeRatesService } from "@/services/exchange-rate.service";
import { KHR_PER_USD_FALLBACK } from "@/utils/requestPaymentAmount";
import { auth } from "@/auth";
import { getUserProfile } from "@/services/own-profile.service";
import OrderWithContractForm from "../../_component/order-component/OrderWithContractForm";

export const metadata = {
  title: "New Contract Order — AgriLink",
  description: "Create a direct agricultural escrow order from a contract.",
};

type PageProps = {
  searchParams: Promise<{
    postId?: string;
    farmerId?: string;
    chatRoomId?: string;
    contractId?: string;
  }>;
};

function toDateInput(iso?: string | null) {
  return iso ? iso.slice(0, 10) : "";
}

export default async function SimpleContractOrderPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { postId, farmerId, chatRoomId, contractId } = params;

  if (!postId || !farmerId) {
    redirect("/");
  }

  // Prefer an explicit contractId from the URL; otherwise auto-resolve the
  // demand's contract from its chat room (only a finalized ACCEPTED/LOCKED
  // contract is allowed to drive the order form).
  const contractPromise = contractId
    ? getContractByIdService(contractId)
    : chatRoomId
      ? getOrderContractByChatRoomService(chatRoomId)
      : Promise.resolve(null);

  const [demandResult, contract, session, profile, exchangeRates] =
    await Promise.all([
      getCropDemandByPostIdAction(postId),
      contractPromise,
      auth(),
      getUserProfile().catch(() => null),
      getExchangeRatesService(),
    ]);

  const demand = demandResult.data;

  // Prefer the finalized contract's agreed terms; fall back to the demand post.
  const buyerName =
    contract?.buyerName ??
    demand?.buyerName ??
    profile?.payload?.personalInfo.fullName ??
    session?.user?.email ??
    "Buyer";
  const farmerName = contract?.farmerName ?? "Farmer";
  const cropName =
    contract?.crop?.cropName ?? demand?.cropName ?? demand?.title ?? "Crop Demand";
  const cropType =
    contract?.crop?.category ?? demand?.cropTypeName ?? demand?.cropType ?? "Crop";
  const pricePerUnit = contract?.pricePerUnit ?? demand?.maxPricePerUnit ?? 0;
  const quantity = contract?.totalQuantity ?? demand?.quantityNeeded ?? 1;
  const unitType = contract?.unitType ?? demand?.unitType ?? "KG";
  const currencyCode =
    (contract?.currencyCode ?? demand?.currencyCode) === "KHR" ? "KHR" : "USD";
  const deliveryDate = toDateInput(
    contract?.deliveryDate ?? demand?.expectedDeliveryDate,
  );

  // Live USD/KHR rate so the order's currency conversion matches the rest of
  // the app; falls back to a fixed rate when unavailable.
  const usdKhr = exchangeRates.find((r) => r.key === "USD/KHR");
  const parsedRate = usdKhr ? Number(usdKhr.average) : NaN;
  const khrPerUsd =
    Number.isFinite(parsedRate) && parsedRate > 0
      ? parsedRate
      : KHR_PER_USD_FALLBACK;

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
        <div className="pointer-events-none absolute right-0 top-[10%] z-0 h-[clamp(240px,32vw,480px)] w-[clamp(240px,32vw,480px)] translate-x-1/2 rounded-full bg-amber-300 opacity-15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[4%] left-0 z-0 h-[clamp(240px,32vw,480px)] w-[clamp(240px,32vw,480px)] -translate-x-1/2 rounded-full bg-yellow-300 opacity-15 blur-3xl" />

        <Image
          src="/assets/srov.png"
          width={260}
          height={260}
          alt="srov"
          className="pointer-events-none absolute right-0 top-[12%] z-0 hidden h-auto max-h-[54%] w-[clamp(140px,12vw,260px)] object-contain opacity-60 sm:block"
        />
        <Image
          src="/assets/srov2.png"
          width={260}
          height={260}
          alt="srov2"
          className="pointer-events-none absolute bottom-0 left-0 z-0 hidden h-auto max-h-[54%] w-[clamp(140px,13vw,280px)] object-contain opacity-60 sm:block"
        />

        <div className="relative z-10">
          <OrderWithContractForm
            postId={contract?.postId ?? postId}
            farmerId={contract?.farmerId ?? farmerId}
            chatRoomId={contract?.chatRoomId ?? chatRoomId ?? ""}
            contractId={contract?.contractId ?? contractId ?? null}
            buyerName={buyerName}
            farmerName={farmerName}
            pricePerUnit={pricePerUnit}
            depositAmount={contract?.depositAmount ?? 0}
            stockLeft={quantity}
            unitType={unitType}
            currencyCode={currencyCode}
            cropName={cropName}
            cropType={cropType}
            title={demand?.title ?? cropName}
            deliveryDate={deliveryDate}
            khrPerUsd={khrPerUsd}
            imageUrls={demand?.imageUrls ?? []}
          />
        </div>
      </main>
    </div>
  );
}
