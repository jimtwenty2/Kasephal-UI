import Image from "next/image";

import { getCropTypesService } from "@/services/crop.service";
import type { CropType } from "@/types/cropType";

import GovernmentCropManagement from "../_components/GovernmentCropManagement";
import CropManagementContent from "./CropManagementContent";

export const dynamic = "force-dynamic";

export default async function CropManagementPage() {
  let cropTypes: CropType[] = [];

  try {
    const result = await getCropTypesService();
    cropTypes = result.payload ?? [];
  } catch {
    cropTypes = [];
  }

  return (
    <main className="relative min-h-screen bg-background">
      <Image
        src="/assets/home_page/bg02.png"
        alt=""
        width={260}
        height={260}
        className="pointer-events-none absolute right-0 top-40 opacity-40"
      />

      <Image
        src="/assets/home_page/background.png"
        alt=""
        width={260}
        height={260}
        className="pointer-events-none absolute bottom-24 left-0 opacity-40"
      />

      <CropManagementContent />

      <section className="relative z-10 px-4 pb-10 lg:px-[200px]">
        <div className="mt-6">
          <GovernmentCropManagement cropTypes={cropTypes} />
        </div>
      </section>
    </main>
  );
}
