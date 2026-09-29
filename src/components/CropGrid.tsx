"use client";

import { CropDemandPost } from "@/types/crop-demand";
import CropCardDemand from "@/app/(main)/(crop-demands)/_components/CropCardDemand";

type Props = {
  baseCrop?: CropDemandPost[];
};

export default function CropGrid({ baseCrop = [] }: Props) {
  return (
    <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {baseCrop.slice(0, 4).map((item) => (
        <CropCardDemand key={item.cropDemandPostId} data={item} />
      ))}
    </div>
  );
}
