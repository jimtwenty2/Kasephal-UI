import CreateCropDemandForm from "../../_components/listing-crop/FormCropDemandComponent";
import { getCropsAction, getCropTypesAction } from "@/action/crop.action";
import { getCropDemandByPostIdAction, getCropDemandsAction } from "@/action/crop-demand.action";
import { getProvincesAction } from "@/action/location.action";
import { notFound } from "next/navigation";
import RequireVerifiedIdentity from "@/components/RequireVerifiedIdentity";
import { getIdentityVerificationState } from "@/lib/identityVerification";

const PAGE_SIZE = 8;
type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCropProductPage({ params }: Props) {
  const { id } = await params;

  const [result, cropTypeResult, cropResult, provinceResult, verification] = await Promise.all([
    getCropDemandByPostIdAction(id),
    getCropTypesAction(),
    getCropsAction(),
    getProvincesAction(),
    getIdentityVerificationState(),
  ]);
  const listResult = result.data ? null : await getCropDemandsAction({ page: 1, size: PAGE_SIZE });
  const product =
    result.data ??
    listResult?.data.find(
      (item) => item.postId === id || item.cropDemandPostId === id,
    );

  if (!product) {
    notFound();
  }

  return (
    <RequireVerifiedIdentity
      isVerifiedIdentity={verification.isVerified}
      status={verification.status}
      rejectionReason={verification.rejectionReason}
    >
      <CreateCropDemandForm
        demand={product}
        demandId={id}
        initialCropTypes={cropTypeResult.data}
        initialCrops={cropResult.data}
        initialProvinces={provinceResult.data}
      />
    </RequireVerifiedIdentity>
  );
}
