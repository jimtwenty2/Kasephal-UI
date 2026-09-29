import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { auth } from "@/auth";
import { getCropDetailByPostIdAnyType } from "@/services/post.service";
import { getContractByIdService } from "@/services/contract.service";
import { getUserProfile } from "@/services/own-profile.service";
import { getCropDemandByPostIdAction } from "@/action/crop-demand.action";
import { getFarmerOffersByDemand } from "@/services/farmerOffer.service";
import type { FarmerOfferItem } from "@/types/farmer-offer";
import CreateContract from "../_components/CreateContract";

interface PageProps {
  searchParams: Promise<{
    chatRoomId?: string;
    postId?: string;
    farmerId?: string;
    farmerName?: string;
    contractId?: string;
    chatType?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Create Digital Contract — Kasephal",
  description: "Create or edit a digital contract and send it to the farmer.",
};

function toDateInput(iso?: string | null) {
  return iso ? iso.slice(0, 10) : "";
}

// Crop demands allow "TONS" as a unit, but the contract only knows KG / TON.
function toContractUnit(unit?: string | null): "KG" | "TON" {
  return unit === "TON" || unit === "TONS" ? "TON" : "KG";
}

export default async function CreateContractPage({ searchParams }: PageProps) {
  const { chatRoomId, postId, farmerId, farmerName, contractId, chatType } =
    await searchParams;

  // Edit mode: load the existing contract to prefill the form.
  const existing = contractId
    ? await getContractByIdService(contractId)
    : null;

  // Crop-demand create flow: pull the demand so we can prefill the buyer's
  // stated terms and cap the price at their maximum.
  const isDemandCreate = chatType === "CROP_DEMAND" && Boolean(postId) && !existing;

  const [session, detail, buyerProfile, demandResult] = await Promise.all([
    auth(),
    postId && !existing
      ? getCropDetailByPostIdAnyType(postId)
      : Promise.resolve(undefined),
    // In create mode the buyer is the current user — resolve their real name.
    existing ? Promise.resolve(null) : getUserProfile().catch(() => null),
    isDemandCreate
      ? getCropDemandByPostIdAction(postId!)
      : Promise.resolve(null),
  ]);

  const demand = demandResult?.data ?? null;

  // The negotiated terms for a crop-demand contract come from the matching
  // farmer's offer (the buyer is contracting with a specific farmer). Fall back
  // to the demand post when that farmer has no offer on record.
  let farmerOffer: FarmerOfferItem | null = null;
  const demandId = demand?.cropDemandPostId ?? demand?.postId;

  if (isDemandCreate && demandId && farmerId) {
    const offersRes = await getFarmerOffersByDemand(demandId);
    farmerOffer =
      offersRes.payload?.items?.find((offer) => offer.farmerId === farmerId) ??
      null;
  }

  // Earliest valid delivery date is today (the schema rejects a past delivery
  // date), so only prefill the date when it's still ahead.
  const today = new Date().toISOString().slice(0, 10);

  // Prefer the farmer's offer for each term; fall back to the demand post.
  const prefillPrice =
    farmerOffer?.proposedPricePerUnit ?? demand?.maxPricePerUnit;
  const prefillQuantity =
    farmerOffer?.offeredQuantity ?? demand?.quantityNeeded;
  const prefillDelivery = toDateInput(
    farmerOffer?.estimatedDeliveryDate ?? demand?.expectedDeliveryDate
  );
  const prefillCurrency: "KHR" | "USD" | undefined = demand
    ? (farmerOffer?.currencyCode ?? demand.currencyCode) === "KHR"
      ? "KHR"
      : "USD"
    : undefined;

  // Convenience defaults for the demand create flow — all overridable.
  const demandPrefill = demand
    ? {
        unitType: toContractUnit(demand.unitType),
        currency: prefillCurrency,
        totalQuantity: prefillQuantity != null ? String(prefillQuantity) : "",
        pricePerUnit: prefillPrice != null ? String(prefillPrice) : "",
        deliveryDate: prefillDelivery >= today ? prefillDelivery : "",
      }
    : undefined;

  const personalInfo = buyerProfile?.payload?.personalInfo;

  const buyerName =
    existing?.buyerName ??
    personalInfo?.fullName ??
    personalInfo?.businessName ??
    session?.user?.name ??
    "Buyer";

  const resolvedChatRoomId = existing?.chatRoomId ?? chatRoomId;

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
          className="pointer-events-none absolute right-0 top-[15%] z-0 h-auto max-h-[50%] w-[clamp(240px,9vw,200px)] object-contain opacity-50"
        />
        <Image
          src="/assets/srov2.png"
          width={260}
          height={260}
          alt="srov2"
          className="pointer-events-none absolute bottom-0 left-0 z-0 h-auto max-h-[50%] w-[clamp(240px,11vw,200px)] object-contain opacity-50"
        />

        <div className="relative z-10 px-28 py-8">
          <nav className="mb-8 flex items-center text-xs text-muted md:text-sm">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <span>&rsaquo;</span>
              <Link
                href={
                  resolvedChatRoomId
                    ? `/chat?chatRoomId=${resolvedChatRoomId}`
                    : "/chat"
                }
                className="text-muted hover:underline"
              >
                Chat
              </Link>
              <span>&rsaquo;</span>
              <span className="font-bold text-primary">
                {existing ? "Edit Contract" : "Create Contract"}
              </span>
            </div>
          </nav>

          <CreateContract
            contractId={existing?.contractId}
            chatRoomId={resolvedChatRoomId}
            postId={existing?.postId ?? postId}
            farmerId={existing?.farmerId ?? farmerId}
            buyerName={buyerName}
            farmerName={existing?.farmerName ?? farmerName}
            cropName={
              existing?.crop?.cropName ??
              existing?.postTitle ??
              detail?.crop?.cropName
            }
            cropType={existing?.crop?.category ?? detail?.crop?.category}
            unitType={toContractUnit(
              existing?.unitType ?? demand?.unitType ?? detail?.crop?.unitType
            )}
            prefill={demandPrefill}
            requestChangeMessage={existing?.requestChangeMessage}
            demandQuantityNeeded={demand?.quantityNeeded ?? null}
            demandUnitType={demand ? toContractUnit(demand.unitType) : null}
            initial={
              existing
                ? {
                    unitType: existing.unitType === "TON" ? "TON" : "KG",
                    currency: existing.currencyCode === "KHR" ? "KHR" : "USD",
                    totalQuantity: String(existing.totalQuantity ?? ""),
                    pricePerUnit: String(existing.pricePerUnit ?? ""),
                    depositAmount: String(existing.depositAmount ?? ""),
                    deliveryDate: toDateInput(existing.deliveryDate),
                    startDate: toDateInput(existing.startDate),
                    endDate: toDateInput(existing.endDate),
                  }
                : undefined
            }
          />
        </div>
      </main>
    </div>
  );
}
