"use client";

import { useCallback, useState } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatDetail from "./ChatDetail";
import ChatProfilePanel from "./ChatProfilePanel";
import EmptyChat from "./EmptyChat";
import FarmerReviewContract from "../../(main)/digital-contract/_components/FarmerReviewContract";
import Image from "next/image";
import type { Chat, ChatStatus, UserRole } from "../_types/chat";

const COLLAPSED_SIDEBAR_WIDTH = 76;
const EXPANDED_SIDEBAR_MIN_WIDTH = 300;
const EXPANDED_SIDEBAR_WIDTH = 360;

type Props = {
    role: UserRole;
    chats: Chat[];
    selectedChat: Chat | null;
    activeTab: ChatStatus | "all";
    search: string;
    onSelectChat: (chat: Chat | null) => void;
    onChangeTab: (tab: ChatStatus | "all") => void;
    onSearchChange: (value: string) => void;
    onChatPreviewChange: (chat: Chat) => void;
    onChatCreated: (chat: Chat) => void;
};

export default function ChatLayout({
    role,
    chats,
    selectedChat,
    activeTab,
    search,
    onSelectChat,
    onChangeTab,
    onSearchChange,
    onChatPreviewChange,
    onChatCreated,
}: Props) {
    const isFarmer = role === "FARMER";
    const [sidebarWidth, setSidebarWidth] = useState(EXPANDED_SIDEBAR_WIDTH);
    const [searchFocusRequest, setSearchFocusRequest] = useState(0);
    const [showFarmerReviewContract, setShowFarmerReviewContract] =
        useState(false);
    const [mobileView, setMobileView] = useState<"sidebar" | "chat">("sidebar");
    const [showProfilePanel, setShowProfilePanel] = useState(false);

    const isSidebarCollapsed =
        sidebarWidth < EXPANDED_SIDEBAR_MIN_WIDTH;
    const handleSidebarToggle = () => {
        setSidebarWidth((currentWidth) =>
            currentWidth < EXPANDED_SIDEBAR_MIN_WIDTH
                ? EXPANDED_SIDEBAR_WIDTH
                : COLLAPSED_SIDEBAR_WIDTH
        );
    };
    const handleExpandSidebarSearch = () => {
        setSidebarWidth(EXPANDED_SIDEBAR_WIDTH);
        setSearchFocusRequest((request) => request + 1);
    };

    const handleSelectChat = useCallback((chat: Chat) => {
        onSelectChat(chat);
        setMobileView("chat");
    }, [onSelectChat]);

    const handleMobileBack = useCallback(() => {
        setMobileView("sidebar");
    }, []);

    const handleToggleProfile = useCallback(() => {
        setShowProfilePanel((v) => !v);
    }, []);

    if (showFarmerReviewContract) {
        return <FarmerReviewContract />;
    }

    return (
        <div className="min-h-screen min-w-screen">
            <div className="mt-9 min-w-full px-6">
                <div className="relative z-0 -mt-30 h-20 w-full overflow-hidden rounded-[28px]">
                    <Image
                        src="/assets/nav-bar/navbar_bg_image.png"
                        alt="Hero Background"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            </div>

            <main
                className={`flex h-screen w-full overflow-hidden font-thicccboi ${isFarmer ? "bg-[#F6F8F7]" : "bg-white"
                    }`}
            >
                {/* Sidebar: full-screen on mobile (sidebar view), fixed width on desktop */}
                <div
                    style={{ "--sidebar-w": `${sidebarWidth}px` } as React.CSSProperties}
                    className={
                        mobileView === "chat"
                            ? "hidden md:flex md:shrink-0"
                            : "flex w-full md:w-auto md:shrink-0"
                    }
                >
                    <ChatSidebar
                        role={role}
                        chats={chats}
                        isCollapsed={isSidebarCollapsed}
                        selectedChat={selectedChat}
                        activeTab={activeTab}
                        search={search}
                        onSelectChat={handleSelectChat}
                        onTabChange={onChangeTab}
                        onSearchChange={onSearchChange}
                        onExpandSidebar={handleExpandSidebarSearch}
                        searchFocusRequest={searchFocusRequest}
                    />
                </div>

                {/* Splitter: desktop only */}
                <div
                    role="button"
                    aria-label={
                        isSidebarCollapsed
                            ? "Open chat sidebar"
                            : "Close chat sidebar"
                    }
                    aria-pressed={isSidebarCollapsed}
                    tabIndex={0}
                    onClick={handleSidebarToggle}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleSidebarToggle();
                        }
                    }}
                    className="group relative z-10 hidden h-full w-[6px] shrink-0 cursor-pointer bg-transparent transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 md:block"
                >
                    <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/5 transition-colors group-hover:bg-primary/30" />
                </div>

                {/* Chat detail: full-screen on mobile (chat view), flex-1 on desktop */}
                <section
                    className={`min-w-0 ${
                        mobileView === "sidebar"
                            ? "hidden md:block md:flex-1"
                            : "flex-1"
                    } ${isFarmer
                        ? "border-[#DDE7DD] bg-[#FBFFFB]"
                        : "border-light-grey bg-white"
                    }`}
                >
                    {selectedChat ? (
                        <ChatDetail
                            role={role}
                            chat={selectedChat}
                            onChatPreviewChange={onChatPreviewChange}
                            onChatCreated={onChatCreated}
                            onShowFarmerReviewContract={() =>
                                setShowFarmerReviewContract(true)
                            }
                            onMobileBack={handleMobileBack}
                            onToggleProfile={handleToggleProfile}
                        />
                    ) : (
                        <EmptyChat />
                    )}
                </section>

                {selectedChat && (
                    <ChatProfilePanel
                        role={role}
                        chat={selectedChat}
                        isOpen={showProfilePanel}
                        onClose={() => setShowProfilePanel(false)}
                    />
                )}
            </main>
        </div>
    );
}
