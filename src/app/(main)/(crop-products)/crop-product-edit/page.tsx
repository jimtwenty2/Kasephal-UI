import CreateCropListingForm from "../_components/FormCropProductComponent";
import { getCropsAction, getCropTypesAction } from "@/action/crop.action";
import RequireVerifiedIdentity from "@/components/RequireVerifiedIdentity";
import { getIdentityVerificationState } from "@/lib/identityVerification";
export const dynamic = "force-dynamic";

export default async function Page() {
  const [cropResult, cropTypeResult, verification] = await Promise.all([
    getCropsAction(),
    getCropTypesAction(),
    getIdentityVerificationState(),
  ]);


  return (
    <RequireVerifiedIdentity
      isVerifiedIdentity={verification.isVerified}
      status={verification.status}
      rejectionReason={verification.rejectionReason}
    >
      <CreateCropListingForm
        key="create-crop-product"
        crops={cropResult.data ?? []}
        cropTypes={cropTypeResult.data ?? []}
      />
    </RequireVerifiedIdentity>
  );
}
