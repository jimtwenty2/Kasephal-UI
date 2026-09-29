"use client";

import { useRouter } from "next/navigation";
import { CropDemandPost } from "@/types/crop-demand";
import CropCardDemand from "../../app/(main)/(crop-demands)/_components/CropCardDemand";

type Props = {
  baseCrop: CropDemandPost[];
  isLogin: boolean;
};

export default function ProtectedCropGrid({ baseCrop, isLogin }: Props) {
  const router = useRouter();

  function handleCardClick(e: React.MouseEvent) {
    if (!isLogin) {
      e.preventDefault();
      e.stopPropagation();
      router.push("/login");
    }
  }

  return (
    <div className="grid gap-5 w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {baseCrop.slice(0, 4).map((item) => (
        <div
          key={item.cropDemandPostId}
          onClickCapture={handleCardClick}
          className={!isLogin ? "cursor-pointer" : ""}
        >
          <CropCardDemand data={item} />
        </div>
      ))}
    </div>
  );
}
