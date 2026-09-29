import { notFound } from "next/navigation";
import CropDemandDetails from "../../_components/CropDemandDetails";
import { CropDemandPost } from "@/types/crop-demand";
import Image from "next/image";
import {
  getCropDemandByPostIdAction,
  getCropDemandsAction,
} from "@/action/crop-demand.action";
import { auth } from "@/auth";
import { normalizeUserRole, ROLES } from "@/constants/role";
import {
  getFarmerOffersByDemand,
  getMyFarmerOfferByDemand,
} from "@/services/farmerOffer.service";
import { getIdentityVerificationState } from "@/lib/identityVerification";
import type { Pagination } from "@/types/crop-demand";

interface PageProps {
  readonly params: Promise<{
    readonly id: string;
  }>;
  readonly searchParams?: Promise<{
    readonly offersPage?: string;
  }>;
}

const OFFER_PAGE_SIZE = 4;
const DEFAULT_OFFER_PAGINATION: Pagination = {
  page: 1,
  size: OFFER_PAGE_SIZE,
  totalElements: 0,
  totalPages: 1,
};

async function getCropDemand(id: string): Promise<CropDemandPost | null> {
  const demandResult = await getCropDemandByPostIdAction(id);

  if (demandResult.data) return demandResult.data;

  const demandsResult = await getCropDemandsAction();

  return demandsResult.data?.find((item) => item.postId === id) ?? null;
}

async function getMyOfferForDemand(crop: CropDemandPost) {
  const lookupIds = getDemandLookupIds(crop);

  for (const lookupId of lookupIds) {
    const result = await getMyFarmerOfferByDemand(lookupId);
    if (result.payload) return result;
  }

  return null;
}

function getDemandLookupIds(crop: CropDemandPost) {
  return [crop.cropDemandPostId, crop.postId].filter(
    (value, index, values): value is string =>
      Boolean(value) && values.indexOf(value) === index,
  );
}

async function getFarmerOffersForDemand(crop: CropDemandPost, page: number) {
  for (const lookupId of getDemandLookupIds(crop)) {
    const result = await getFarmerOffersByDemand(
      lookupId,
      page,
      OFFER_PAGE_SIZE,
    );
    const payload = result.payload;

    if (payload && (result.success !== false || payload.items.length > 0)) {
      return payload;
    }
  }

  return { items: [], pagination: DEFAULT_OFFER_PAGINATION };
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const crop = await getCropDemand(id);

  if (!crop) return { title: "Not Found" };

  return {
    title: `${crop.cropName} — ${crop.title}`,
    description: crop.description,
  };
}

export default async function CropDemandDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const offersPage = Math.max(
    1,
    Number(resolvedSearchParams?.offersPage ?? 1) || 1,
  );

  const session = await auth();
  const role = normalizeUserRole(session?.user?.role);
  const currentUserId = session?.user?.userId ?? null;

  const crop = await getCropDemand(id);
  if (!crop) notFound();

  // Government owns demands like a buyer, so it must load incoming offers too.
  const isDemandBuyer = role === ROLES.BUYER || role === ROLES.GOVERNMENT;
  const isOwner =
    isDemandBuyer &&
    Boolean(currentUserId) &&
    [crop.buyerId, crop.userId, crop.createdById, crop.createdBy].some(
      (id) => id && id === currentUserId,
    );

  const farmerOffersPayload = isOwner
    ? await getFarmerOffersForDemand(crop, offersPage)
    : { items: [], pagination: DEFAULT_OFFER_PAGINATION };
  const verification =
    role === ROLES.FARMER || isDemandBuyer
      ? await getIdentityVerificationState()
      : null;
  const myOfferResult =
    role === ROLES.FARMER
      ? await getMyOfferForDemand(crop)
      : null;

  const myOffer = myOfferResult?.payload ?? null;

  return (
    <div>
      <section className="mt-9 w-full px-6">
        <div className="relative z-0 -mt-30 h-20 w-full overflow-hidden rounded-[28px]">
          <Image
            src="/assets/nav-bar/navbar_bg_image.png"
            alt="Hero Background"
            fill
            priority
            className="object-cover"
          />
        </div>
      </section>

      <CropDemandDetails
        data={crop}
        role={role}
        currentUserId={currentUserId}
        farmerOffers={farmerOffersPayload.items}
        offerPagination={farmerOffersPayload.pagination}
        myOffer={myOffer}
        isVerifiedIdentity={verification?.isVerified ?? false}
        verificationStatus={verification?.status}
        rejectionReason={verification?.rejectionReason}
      />
    </div>
  );
}
