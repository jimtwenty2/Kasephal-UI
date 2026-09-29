import { getCropTypesService } from "@/services/crop.service";
import type { CropType } from "@/types/cropType";
import GovernmentCropManagement from "@/app/(main)/overview-dashboard/_components/GovernmentCropManagement";

export const dynamic = "force-dynamic";

export default async function AdminCropManagementPage() {
  let cropTypes: CropType[] = [];

  try {
    const result = await getCropTypesService();
    cropTypes = result.payload ?? [];
  } catch {
    cropTypes = [];
  }

  return (
    <main className="min-h-screen bg-white px-4 py-5 sm:px-6">
      <GovernmentCropManagement cropTypes={cropTypes} />
    </main>
  );
}
