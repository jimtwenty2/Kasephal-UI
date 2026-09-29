"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
    ArrowLeftIcon,
    InformationCircleIcon,
    MapPinIcon,
    ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { ShoppingCart } from "lucide-react";

import ContractButton from "./ContractButton";
import type { Chat, UserRole } from "../_types/chat";
import { getFileUrl } from "@/utils/getFileUrl";
import ChatTypeBadge from "./ChatTypeBadge";

type Props = {
    role: UserRole;
    chat: Chat;
    showContractButton?: boolean;
    contractButtonLabel: string;
    contractButtonDisabled?: boolean;
    onContractClick: () => void;
    showOrderButton?: boolean;
    orderButtonLabel?: string;
    onOrderClick?: () => void;
    onMobileBack?: () => void;
    onToggleProfile?: () => void;
};

const FALLBACK_IMAGE = "/assets/nav-bar/profile.png";

function getSafeImage(src?: string | null) {
    if (!src) return FALLBACK_IMAGE;
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    if (src.startsWith("/")) return src;

    return getFileUrl(src);
}

export default function ChatHeader({
    role,
    chat,
    showContractButton = false,
    contractButtonLabel,
    contractButtonDisabled = false,
    onContractClick,
    showOrderButton = false,
    orderButtonLabel = "Order",
    onOrderClick,
    onMobileBack,
    onToggleProfile,
}: Props) {
    const router = useRouter();

    const [failedImage, setFailedImage] = useState<string | null>(null);
    const imageSrc =
        failedImage === chat.avatar ? FALLBACK_IMAGE : getSafeImage(chat.avatar);

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
        <header className="flex min-h-[64px] items-center gap-2 border-b border-light-grey px-4 py-3 sm:min-h-[80px] sm:gap-4 sm:px-6 lg:px-8">
            {/* Mobile back button */}
            {onMobileBack && (
                <button
                    type="button"
                    onClick={onMobileBack}
                    aria-label="Back to chat list"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition hover:bg-primary/20 md:hidden"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                </button>
            )}

            {/* Profile section — flex-1 so it takes all available space and never overflows */}
            <button
                type="button"
                onClick={handleProfileClick}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
            >
                {role !== "BUYER" && (
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-primary sm:h-12 sm:w-12">
                        <Image
                            src={imageSrc}
                            alt={chat.name}
                            fill
                            className="object-cover"
                            onError={() => setFailedImage(chat.avatar)}
                        />
                    </div>
                )}

                <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                        <h2 className="truncate text-[15px] font-bold text-primary-heading sm:text-[17px]">
                            {chat.name}
                        </h2>
                        <ChatTypeBadge chatType={chat.chatType} compact />
                        <ShieldCheckIcon className="h-4 w-4 shrink-0 text-emerald-500 sm:h-5 sm:w-5" />
                    </div>

                    <div className="mt-0.5 flex min-w-0 items-center gap-1 text-[12px] text-secondary-body sm:mt-1 sm:text-[13px]">
                        <MapPinIcon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                        <span className="truncate">
                            {chat.location?.trim() ? chat.location : "No location"}
                        </span>
                        <span className="mx-1 h-1 w-1 shrink-0 rounded-full bg-secondary-body/50" />
                        <span className="flex shrink-0 items-center gap-1">
                            <span
                                className={`h-2 w-2 rounded-full ${
                                    chat.online ? "bg-green-500" : "bg-slate-300"
                                }`}
                            />
                            {chat.online ? "Online" : "Offline"}
                        </span>
                    </div>
                </div>
            </button>

            {/* Right side: action buttons (tablet+) + profile toggle (< xl) */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                {/* Action buttons: hidden on mobile, visible on sm+ */}
                <div className="hidden sm:flex sm:items-center sm:gap-2">
                    {showOrderButton && (
                        <button
                            type="button"
                            onClick={onOrderClick}
                            className="flex h-[38px] items-center justify-center gap-1.5 rounded-full bg-[#F5B02E] px-4 text-[13px] font-bold text-primary-heading shadow-[0_10px_22px_rgba(245,176,46,0.22)] transition-all hover:bg-[#e5a022] active:scale-[0.98] sm:h-[42px] sm:px-6 sm:text-[14px]"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            {orderButtonLabel}
                        </button>
                    )}

                    {showContractButton && (
                        <ContractButton
                            label={contractButtonLabel}
                            disabled={contractButtonDisabled}
                            variant={contractButtonDisabled ? "outline" : "solid"}
                            onClick={onContractClick}
                        />
                    )}
                </div>

                {/* Profile info toggle: visible on < xl, hidden on xl+ (panel is always shown there) */}
                {onToggleProfile && (
                    <button
                        type="button"
                        onClick={onToggleProfile}
                        aria-label="View profile details"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-secondary-body transition hover:bg-primary/10 hover:text-primary xl:hidden"
                    >
                        <InformationCircleIcon className="h-5 w-5" />
                    </button>
                )}
            </div>
        </header>
    );
}
