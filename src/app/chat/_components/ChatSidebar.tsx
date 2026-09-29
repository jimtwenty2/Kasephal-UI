import type {
    Chat,
    ChatStatus,
    UserRole,
} from "../_types/chat";

import ChatSearch from "./ChatSearch";
import ChatTabs from "./ChatTabs";
import ChatList from "./ChatList";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef } from "react";

type Props = {
    role: UserRole;

    chats: Chat[];

    isCollapsed: boolean;

    selectedChat: Chat | null;

    activeTab: ChatStatus | "all";

    search: string;

    onSearchChange: (value: string) => void;

    onTabChange: (value: ChatStatus | "all") => void;

    onSelectChat: (chat: Chat) => void;

    onExpandSidebar: () => void;

    searchFocusRequest: number;
};

export default function ChatSidebar({
    role,
    chats,
    isCollapsed,
    selectedChat,
    activeTab,
    search,
    onSearchChange,
    onTabChange,
    onSelectChat,
    onExpandSidebar,
    searchFocusRequest,
}: Props) {
    const isFarmer = role === "FARMER";
    const router = useRouter();
    const searchInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!isCollapsed && searchFocusRequest > 0) {
            searchInputRef.current?.focus();
        }
    }, [isCollapsed, searchFocusRequest]);

    return (
        <aside
            className={`flex h-screen w-full shrink-0 flex-col overflow-hidden border-r transition-[width,padding,background-color] duration-200 md:w-[var(--sidebar-w)] ${
                isCollapsed ? "items-center bg-[#F7F8FA] px-2 py-4" : "px-6 py-6"
            } ${isFarmer
                ? "border-[#DDE7DD] bg-[#F7FAF7]"
                : "bg-white"
                }`}
        >
            <div className={isCollapsed ? "flex flex-col items-center" : undefined}>
                <button
                    onClick={() => router.back()}
                    className={`mb-5 flex items-center justify-center rounded-full text-white backdrop-blur-md transition-all hover:opacity-90 ${
                        isCollapsed ? "h-11 w-11 bg-primary/90" : "h-10 w-10 bg-primary"
                    }`}
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                </button>
                {!isCollapsed && (
                    <>
                        <h1
                            className={`text-[24px] font-bold ${isFarmer
                                ? "text-black"
                                : "text-primary-heading"
                                }`}
                        >
                            {isFarmer
                                ? " Negotiation Chat"
                                : "Negotiation Chat"}
                        </h1>

                        <p className="mt-1 text-[14px] text-secondary-body">
                            {isFarmer
                                ? "Manage buyers and contract discussions."
                                : "Negotiate, agree and grow together."}
                        </p>
                    </>
                )}
            </div>

            {!isCollapsed && (
                <>
                    <div className="mt-6">
                        <ChatSearch
                            ref={searchInputRef}
                            value={search}
                            onChange={onSearchChange}
                        />
                    </div>

                    <div className="mt-6">
                        <ChatTabs
                            activeTab={activeTab}
                            onTabChange={onTabChange}
                        />
                    </div>
                </>
            )}

            {isCollapsed && (
                <button
                    type="button"
                    aria-label="Open sidebar search"
                    onClick={onExpandSidebar}
                    className="mt-4 flex h-11 w-11 items-center justify-center rounded-full border border-light-grey bg-white text-secondary-body shadow-sm transition hover:border-primary/30 hover:text-primary"
                >
                    <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
            )}

            <ChatList
                chats={chats}
                isCollapsed={isCollapsed}
                selectedChat={selectedChat}
                onSelectChat={onSelectChat}
            />
        </aside>
    );
}
