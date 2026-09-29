"use client";

import { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { Chat, UserRole } from "../_types/chat";
import ChatProfileCard from "./ChatProfileCard";
import CropDetailCard from "./CropDetailCard";
import ChatPaymentPanel from "./ChatPaymentPanel";

type Props = {
    role: UserRole;
    chat: Chat;
    isOpen?: boolean;
    onClose?: () => void;
};

export default function ChatProfilePanel({
    role,
    chat,
    isOpen = false,
    onClose,
}: Props) {
    useEffect(() => {
        if (!isOpen) return;

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose?.();
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    return (
        <>
            {/* Desktop xl+: always-visible right column */}
            <aside className="scrollbar-hide hidden h-screen w-[320px] shrink-0 overflow-y-auto border-l border-light-grey bg-white xl:block">
                <ChatProfileCard role={role} chat={chat} />
                <CropDetailCard role={role} chat={chat} />
                <ChatPaymentPanel role={role} chat={chat} />
            </aside>

            {/* Mobile/tablet overlay drawer (< xl) */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-black/40 xl:hidden"
                        aria-hidden="true"
                        onClick={onClose}
                    />

                    {/* Drawer panel */}
                    <aside className="scrollbar-hide fixed right-0 top-0 z-50 flex h-full w-[min(320px,90vw)] flex-col overflow-hidden border-l border-light-grey bg-white shadow-2xl xl:hidden">
                        <div className="flex shrink-0 items-center justify-between border-b border-light-grey px-5 py-4">
                            <span className="text-[16px] font-bold text-primary-heading">
                                Profile Details
                            </span>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close profile panel"
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="scrollbar-hide flex-1 overflow-y-auto">
                            <ChatProfileCard role={role} chat={chat} />
                            <CropDetailCard role={role} chat={chat} />
                            <ChatPaymentPanel role={role} chat={chat} />
                        </div>
                    </aside>
                </>
            )}
        </>
    );
}
