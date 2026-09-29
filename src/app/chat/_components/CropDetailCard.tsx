"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import type { Chat, UserRole } from "../_types/chat";

import { getFileUrl } from "@/utils/getFileUrl";

type Props = {
    role: UserRole;
    chat: Chat;
};

const fallbackImage = "/assets/crop-placeholder.png";

function getSafeImage(src?: string | null) {
    if (!src) return fallbackImage;

    if (
        src.startsWith("http://") ||
        src.startsWith("https://")
    ) {
        return src;
    }

    if (src.startsWith("/")) {
        return src;
    }

    return getFileUrl(src);
}

export default function CropDetailCard({ role, chat }: Props) {
    const router = useRouter();

    const crop = chat.crop;

    if (!crop) return null;

    return (
        <div className="border-t border-light-grey px-6 py-6">
            <h3 className="text-[13px] font-bold uppercase tracking-wide text-secondary-body">
                CROP DETAILS
            </h3>

            <div className="mt-5 rounded-[18px] border border-light-grey bg-white p-4 shadow-sm">
                <div className="relative h-[150px] w-full overflow-hidden rounded-[12px]">
                    <Image
                        src={getSafeImage(crop.imageUrl)}
                        alt={crop.cropName}
                        fill
                        className="object-cover"
                    />

                    <span className="absolute left-3 top-3 rounded-full bg-white px-4 py-2 text-[12px] font-bold text-primary">
                        {crop.status}
                    </span>
                </div>

                <div className="mt-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h4 className="text-[18px] font-bold text-primary-heading">
                                {crop.cropName}
                            </h4>

                            <p className=" w-50 mt-1 text-[13px] font-bold uppercase text-secondary-body">
                                {crop.location ?? "Cambodia"} ·{" "}
                                {crop.category ?? "Crop"}
                            </p>

                            <p className="text-[14px] text-secondary-body">
                                QTY: {crop.quantity}
                            </p>
                        </div>

                        <p className="shrink-0 text-right text-[17px] font-bold text-primary">
                            {crop.estimatedPrice}
                        </p>
                    </div>

                    {role === "FARMER" && chat.contractId && (
                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    `/digital-contract/${chat.contractId}`
                                )
                            }
                            className="mt-7 h-[52px] w-full rounded-[10px] bg-[#F6B941] text-[15px] font-bold text-primary-heading transition hover:opacity-90"
                        >
                            View Contract
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}