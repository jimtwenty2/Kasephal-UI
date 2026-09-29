import CreateCropDemandForm from "../_components/listing-crop/FormCropDemandComponent";
import { getCropsAction, getCropTypesAction } from "@/action/crop.action";
import { getProvincesAction } from "@/action/location.action";
import RequireVerifiedIdentity from "@/components/RequireVerifiedIdentity";
import { getIdentityVerificationState } from "@/lib/identityVerification";

export default async function Page() {
  const [cropTypeResult, cropResult, provinceResult, verification] = await Promise.all([
    getCropTypesAction(),
    getCropsAction(),
    getProvincesAction(),
    getIdentityVerificationState(),
  ]);

  return (
    <div>
      <RequireVerifiedIdentity
        isVerifiedIdentity={verification.isVerified}
        status={verification.status}
        rejectionReason={verification.rejectionReason}
      >
        <CreateCropDemandForm
          initialCropTypes={cropTypeResult.data}
          initialCrops={cropResult.data}
          initialProvinces={provinceResult.data}
        />
      </RequireVerifiedIdentity>
    </div>
  );
}
