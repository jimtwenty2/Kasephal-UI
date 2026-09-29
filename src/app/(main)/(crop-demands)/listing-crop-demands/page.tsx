import { Suspense } from "react";
import { getCropTypesAction } from "@/action/crop.action";
import { getProvincesAction } from "@/action/location.action";
import {
  getCropDemands,
  getCropDemandsOwn,
} from "@/services/cropDemand.service";
import CropDemandClient from "../_components/CropDemandClient";
import CropDemandMarketplaceSkeleton from "../_components/CropDemandMarketplaceSkeleton";
import HeroSection from "../_components/HeroSection";
import { auth } from "@/auth";
import { normalizeUserRole, ROLES } from "@/constants/role";

const PAGE_SIZE = 8;

async function CropDemandContent() {
  const session = await auth();
  const role = normalizeUserRole(session?.user?.role);

  // Government posts and manages demands like a buyer, so it sees its own.
  const demandPromise =
    role === ROLES.BUYER || role === ROLES.GOVERNMENT
      ? getCropDemandsOwn({ page: 1, size: PAGE_SIZE })
      : getCropDemands({ page: 1, size: PAGE_SIZE });

  const [result, cropTypeResult, provinceResult] = await Promise.all([
    demandPromise,
    getCropTypesAction(),
    getProvincesAction(),
  ]);


  return (
    <>
      <HeroSection />
      <CropDemandClient
        initialDemands={result.error ? [] : result.data}
        initialPagination={result.pagination}
        initialCropTypes={cropTypeResult.data}
        initialProvinces={provinceResult.data}
        role={role}
      />
    </>
  );
}

export default function CropDemandPage() {
  return (
    <Suspense fallback={<CropDemandMarketplaceSkeleton />}>
      <CropDemandContent />
    </Suspense>
  );
}
