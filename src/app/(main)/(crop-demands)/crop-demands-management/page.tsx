import CropDemandListingsPage from "../_components/listing-crop/CropDemandTableComponent";
import { getCropTypesAction } from "@/action/crop.action";
import { getProvincesAction } from "@/action/location.action";
import { getCropDemandsOwn } from "@/services/cropDemand.service";
import { getIdentityVerificationState } from "@/lib/identityVerification";

const CROP_DEMAND_PAGE_TEXT = {
  "cropDemandPage.metadata.title": {
    en: "Crop Demand Management Dashboard",
    kh: "ផ្ទាំងគ្រប់គ្រងតម្រូវការដំណាំ",
  },
  "cropDemandPage.metadata.description": {
    en: "Monitor real-time market demands and B2B requests",
    kh: "តាមដានតម្រូវការទីផ្សារបច្ចុប្បន្ន និងសំណើ B2B",
  },
} as const;

export const metadata = {
  title: CROP_DEMAND_PAGE_TEXT["cropDemandPage.metadata.title"].en,
  description: CROP_DEMAND_PAGE_TEXT["cropDemandPage.metadata.description"].en,
};

const PAGE_SIZE = 20;

export default async function Page() {
  const [result, cropTypeResult, provinceResult, verification] =
    await Promise.all([
      getCropDemandsOwn({ page: 1, size: PAGE_SIZE }),
      getCropTypesAction(),
      getProvincesAction(),
      getIdentityVerificationState(),
    ]);

  const demands = result.error ? [] : result.data;

  return (
    <main className="min-h-screen bg-[#fbf6e9]">
      <CropDemandListingsPage
        demands={demands}
        pagination={result.pagination}
        initialCropTypes={cropTypeResult.data}
        initialProvinces={provinceResult.data}
        identityVerification={verification}
      />
    </main>
  );
}