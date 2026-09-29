"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    CalendarDaysIcon,
    MapPinIcon,
    StarIcon,
    TrophyIcon,
    UserIcon,
} from "@heroicons/react/24/outline";

import type { Chat, UserRole } from "../_types/chat";
import { getFileUrl } from "@/utils/getFileUrl";

type Props = {
    role: UserRole;
    chat: Chat;
};

const fallbackImage = "/assets/nav-bar/profile.png";

function getSafeImage(src?: string | null) {
    if (!src) return fallbackImage;
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    if (src.startsWith("/")) return src;

    return getFileUrl(src);
}

function formatScore(value?: number | null) {
    if (value == null || !Number.isFinite(value)) return "N/A";

    return value.toFixed(1);
}

function formatJoinedDate(value?: string | null) {
    if (!value) return "Join date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Join date unavailable";

    return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
    });
}

function getProfileCopy(role: UserRole, chat: Chat) {
    const isFarmerView = role === "FARMER";
    const profile = chat.profile;
    const location = chat.location?.trim();
    const cropLocation = chat.crop?.location?.trim();
    const bio = profile?.bio?.trim();

    return {
        title: isFarmerView ? "About Buyer" : "About Farmer",
        bio:
            bio ||
            `${isFarmerView ? "Buyer" : "Farmer"} has not added a bio yet.`,
        location: location || cropLocation || "No location",
        joinedAt: formatJoinedDate(profile?.joinedAt),
    };
}

function StarRating({ rating }: { rating?: number | null }) {
    const safeRating =
        rating == null || !Number.isFinite(rating)
            ? 0
            : Math.min(5, Math.max(0, rating));
    const roundedRating = Math.round(safeRating);

    return (
        <div
            className="flex items-center gap-1"
            aria-label={`${safeRating.toFixed(1)} out of 5`}
        >
            {Array.from({ length: 5 }).map((_, index) => (
                <StarIcon
                    key={index}
                    className={`h-[15px] w-[15px] shrink-0 ${
                        index < roundedRating
                            ? "fill-[#F59E0B] text-[#F59E0B]"
                            : "text-[#D0D5DD]"
                    }`}
                />
            ))}
        </div>
    );
}

export default function ChatProfileCard({ role, chat }: Props) {
    const router = useRouter();
    const [failedImage, setFailedImage] = useState<string | null>(null);
    const imageSrc =
        failedImage === chat.avatar ? fallbackImage : getSafeImage(chat.avatar);
    const profileCopy = getProfileCopy(role, chat);
    const showFarmerMetrics = role === "BUYER";

    const handleProfileClick = () => {
        if (role === "FARMER") {
            router.push(`/other-profile/${chat.buyerId}`);
            return;
        }

        if (role === "BUYER") {
            router.push(`/other-profile/farmer/${chat.farmerId}`);
            return;
        }

        router.push(`/other-profile/${chat.id}`);
    };

    return (
        <div className="border-b border-light-grey px-6 py-7">
            <div className="mx-auto h-[90px] w-[90px] rounded-full border-[5px] border-primary p-1">
                <Image
                    src={imageSrc}
                    alt={chat.name}
                    width={90}
                    height={90}
                    className="h-full w-full rounded-full object-cover"
                    onError={() => setFailedImage(chat.avatar)}
                />
            </div>

            <h3 className="mt-4 text-center text-[18px] font-semibold text-primary-heading">
                {chat.name}
            </h3>

            <p className="mt-2 line-clamp-3 text-center text-[13px] leading-5 text-secondary-body">
                {profileCopy.bio}
            </p>

            <button
                type="button"
                onClick={handleProfileClick}
                className="mt-4 flex h-[34px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#F1F5F9] text-[14px] font-semibold text-primary-heading transition hover:bg-primary/10"
            >
                <UserIcon className="h-4 w-4" />
                Profile
            </button>

            {showFarmerMetrics && (
                <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                    <TrustMetric
                        icon={TrophyIcon}
                        label="Trust Score"
                        value={formatScore(chat.profile?.trustScore)}
                        helper={chat.profile?.trustLevel || "No level"}
                    />
                    <div className="rounded-lg border border-[#E7ECE8] bg-[#F8FBF8] p-3">
                        <div className="flex items-center gap-2 text-secondary-body">
                            <StarIcon className="h-4 w-4 text-primary" />
                            <span className="text-[12px] font-semibold">Rating</span>
                        </div>
                        <p className="mt-2 text-[22px] font-bold leading-none text-primary-heading">
                            {formatScore(chat.profile?.averageRating)}
                        </p>
                        <div className="mt-2">
                            <StarRating rating={chat.profile?.averageRating} />
                        </div>
                        <p className="mt-2 truncate text-[12px] font-medium text-secondary-body">
                            {chat.profile?.reviewCount ?? 0} reviews
                        </p>
                    </div>
                </div>
            )}

            <div className="mt-5 rounded-lg border border-[#E7ECE8] bg-white p-4 text-left">
                <p className="text-[15px] font-semibold text-primary-heading">
                    {profileCopy.title}
                </p>
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-[#F8FBF8] px-3 py-2 text-[13px] font-semibold text-primary-heading">
                    <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="break-words">{profileCopy.location}</span>
                </div>
                <div className="mt-2 flex items-start gap-2 rounded-lg bg-[#F8FBF8] px-3 py-2 text-[13px] font-semibold text-primary-heading">
                    <CalendarDaysIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>Joined {profileCopy.joinedAt}</span>
                </div>
            </div>
        </div>
    );
}

function TrustMetric({
    icon: Icon,
    label,
    value,
    helper,
}: {
    icon: typeof TrophyIcon;
    label: string;
    value: string;
    helper: string;
}) {
    return (
        <div className="rounded-lg border border-[#E7ECE8] bg-[#F8FBF8] p-3 text-center">
            <div className="flex items-center justify-center gap-2 text-secondary-body">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-[12px] font-semibold">{label}</span>
            </div>
            <p className="mt-2 text-[26px] font-bold leading-none text-primary-heading">
                {value}
            </p>
            <p className="mt-2 truncate text-[13px] font-semibold text-secondary-body">
                {helper}
            </p>
        </div>
    );
}
