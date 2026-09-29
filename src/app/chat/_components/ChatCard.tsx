"use client";

import Image from "next/image";
import { useState } from "react";

import type { Chat } from "../_types/chat";
import { getFileUrl } from "@/utils/getFileUrl";
import ChatTypeBadge from "./ChatTypeBadge";

type Props = {
    chat: Chat;
    isCollapsed: boolean;
    isActive: boolean;
    onClick: () => void;
};

const fallbackImage = "/assets/nav-bar/profile.png";

export default function ChatCard({
    chat,
    isCollapsed,
    isActive,
    onClick,
}: Props) {
    const [failedImage, setFailedImage] = useState<string | null>(null);
    const imageSrc =
        failedImage === chat.avatar
            ? fallbackImage
            : chat.avatar
                ? getFileUrl(chat.avatar)
                : fallbackImage;
    const isUnread = !isActive && (chat.unreadCount ?? 0) > 0;

    return (
        <button
            type="button"
            onClick={onClick}
            title={isCollapsed ? chat.name : undefined}
            className={`relative flex cursor-pointer items-center text-left transition-all duration-200 ${
                isCollapsed
                    ? "h-14 w-14 justify-center rounded-2xl hover:bg-white"
                    : "w-full gap-3 rounded-[22px] border border-transparent p-3 hover:scale-[1.01]"
            } ${isActive
                ? isCollapsed
                    ? "bg-white shadow-[0_4px_10px_rgba(15,23,42,0.06)] ring-1 ring-primary/20"
                    : "border-primary/20 bg-white shadow-[0_4px_12px_rgba(15,23,42,0.05)]"
                : isCollapsed
                    ? "hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
                    : "hover:bg-gray-50"
                }`}
        >
            {isActive && (
                <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full bg-primary ${
                        isCollapsed ? "h-7 w-[3px]" : "h-8 w-[4px]"
                    }`}
                />
            )}

            <div className="relative">
                <Image
                    src={imageSrc}
                    alt={chat.name}
                    width={44}
                    height={44}
                    className={`rounded-full object-cover ${
                        isCollapsed
                            ? "h-12 w-12 ring-2 ring-white"
                            : "h-11 w-11"
                    }`}
                    onError={() => setFailedImage(chat.avatar)}
                />

                {chat.online && (
                    <span className="absolute bottom-0 right-0 z-10 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
                )}
            </div>

            {!isCollapsed && (
                <>
                    <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-2">
                            <h3
                                className={`truncate text-[15px] text-primary-heading ${
                                    isUnread ? "font-extrabold" : "font-semibold"
                                }`}
                            >
                                {chat.name}
                            </h3>
                            <ChatTypeBadge chatType={chat.chatType} compact />
                        </div>

                        <p
                            className={`truncate text-[12px] ${
                                isUnread
                                    ? "font-bold text-primary-heading"
                                    : "text-secondary-body"
                            }`}
                        >
                            {chat.preview}
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                        <span
                            className={`text-[12px] ${
                                isActive
                                    ? "font-semibold text-primary"
                                    : "text-secondary-body"
                            }`}
                        >
                            {chat.time}
                        </span>
                        {isUnread && (
                            <span
                                aria-label={`${chat.unreadCount} unread message${chat.unreadCount === 1 ? "" : "s"}`}
                                className="h-2.5 w-2.5 rounded-full bg-primary"
                            />
                        )}
                    </div>
                </>
            )}
        </button>
    );
}
