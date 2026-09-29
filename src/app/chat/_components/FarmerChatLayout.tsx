"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import ChatLayout from "./ChatLayout";
import type { Chat, ChatFile, ChatStatus, Message } from "../_types/chat";
import {
    createChatEventsSocket,
    createChatPresenceSocket,
    createChatRoomEventsSocket,
    type ChatSocketMessage,
} from "@/lib/chat-socket";
import { getChatTypeLabel } from "./ChatTypeBadge";
import { formatCardMessageLabel } from "../_utils/cardMessagePreview";
import { upsertChatRoomEvent } from "../_utils/chatRoomEvents";
import { formatChatTime } from "../_utils/formatChatTime";

type Props = {
    chats: Chat[];
};

export default function FarmerChatLayout({ chats }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const [liveChats, setLiveChats] = useState(chats);

    const chatRoomId = searchParams.get("chatRoomId");
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [chatOverrides, setChatOverrides] = useState<Record<string, Chat>>({});
    const [createdChats, setCreatedChats] = useState<Record<string, Chat>>({});
    const [activeTab, setActiveTab] = useState<ChatStatus | "all">("all");
    const [search, setSearch] = useState("");
    const liveChatsRef = useRef(liveChats);
    const chatOverridesRef = useRef(chatOverrides);

    useEffect(() => {
        liveChatsRef.current = liveChats;
    }, [liveChats]);

    useEffect(() => {
        chatOverridesRef.current = chatOverrides;
    }, [chatOverrides]);

    useEffect(() => {
        setLiveChats((current) => {
            const knownIds = new Set(current.map((chat) => chat.id));
            const knownRoomIds = new Set(
                current.map((chat) => chat.chatRoomId).filter(Boolean)
            );
            const additions = chats.filter(
                (chat) =>
                    !knownIds.has(chat.id) &&
                    !(chat.chatRoomId && knownRoomIds.has(chat.chatRoomId))
            );

            return additions.length > 0 ? [...additions, ...current] : current;
        });
    }, [chats]);

    const handleSocketMessage = useCallback(
        (socketMessage: ChatSocketMessage) => {
            const baseChat = findChatByRoomId(
                socketMessage.chatRoomId,
                liveChatsRef.current,
                chatOverridesRef.current
            );

            if (!baseChat) {
                return;
            }

            const nextMessage = mapSocketMessage(socketMessage, session?.user?.userId ?? "");
            if (!nextMessage) return;

            const nextChat = mergeSocketMessageIntoChat(
                baseChat,
                nextMessage,
                socketMessage,
                session?.user?.userId ?? "",
                selectedChatId === baseChat.id
            );
            setChatOverrides((currentOverrides) => {
                const nextOverrides = {
                    ...currentOverrides,
                    [baseChat.id]: nextChat,
                };

                chatOverridesRef.current = nextOverrides;

                return nextOverrides;
            });
        },
        [selectedChatId, session?.user?.userId]
    );

    useEffect(() => {
        const token = session?.user?.accessToken;

        if (!token) return;

        const client = createChatPresenceSocket({
            token,
            onPresence: (presence) => {
                if (!presence.userId) return;

                const matchingChats = liveChats.filter(
                    (chat) => chat.buyerId === presence.userId
                );

                if (matchingChats.length === 0) return;

                setChatOverrides((currentOverrides) => {
                    const nextOverrides = { ...currentOverrides };

                    for (const chat of matchingChats) {
                        nextOverrides[chat.id] = {
                            ...(currentOverrides[chat.id] ?? chat),
                            online: Boolean(presence.online),
                        };
                    }

                    return nextOverrides;
                });
            },
        });

        if (!client) return;

        client.activate();

        return () => {
            void client.deactivate();
        };
    }, [liveChats, session?.user?.accessToken]);

    const handleRoomEvent = useCallback(
        (event: Parameters<typeof upsertChatRoomEvent>[1]) => {
            const currentUserId = session?.user?.userId ?? "";

            setLiveChats((currentChats) =>
                upsertChatRoomEvent(currentChats, event, {
                    role: "FARMER",
                    currentUserId,
                    selectedChatId,
                    selectedChatRoomId: chatRoomId,
                })
            );

            if (event.room?.chatRoomId) {
                setChatOverrides((currentOverrides) => {
                    const nextOverrides = { ...currentOverrides };
                    delete nextOverrides[event.room!.chatRoomId];
                    chatOverridesRef.current = nextOverrides;

                    return nextOverrides;
                });
            }
        },
        [chatRoomId, selectedChatId, session?.user?.userId]
    );

    useEffect(() => {
        const token = session?.user?.accessToken;

        if (!token) return;

        const client = createChatEventsSocket({
            token,
            onMessage: handleSocketMessage,
        });

        if (!client) return;

        client.activate();

        return () => {
            void client.deactivate();
        };
    }, [handleSocketMessage, session?.user?.accessToken]);

    useEffect(() => {
        const token = session?.user?.accessToken;

        if (!token) return;

        const client = createChatRoomEventsSocket({
            token,
            onRoomEvent: handleRoomEvent,
        });

        if (!client) return;

        client.activate();

        return () => {
            void client.deactivate();
        };
    }, [handleRoomEvent, session?.user?.accessToken]);

    const chatItems = useMemo(() => {
        const serverRoomIds = new Set(
            liveChats.map((chat) => chat.chatRoomId).filter(Boolean)
        );

        // Locally-created chats not yet returned by the server refresh.
        const extraChats = Object.values(createdChats).filter(
            (chat) => !serverRoomIds.has(chat.chatRoomId)
        );

        const hasCreatedChat = Object.keys(createdChats).length > 0;

        const merged = [...liveChats, ...extraChats]
            // Once a real chat exists, drop the temporary placeholder for it.
            .filter((chat) => !(hasCreatedChat && chat.isTemporary))
            .map((chat) =>
                chatOverrides[chat.id] ? { ...chat, ...chatOverrides[chat.id] } : chat
            );

        return sortChatsByActivity(merged);
    }, [liveChats, chatOverrides, createdChats]);

    const selectedChat = useMemo(() => {
        if (chatRoomId) {
            const realChat = chatItems.find((chat) => chat.chatRoomId === chatRoomId);
            if (realChat) return realChat;
        }

        const temporaryChat = chatItems.find((chat) => chat.isTemporary);
        if (temporaryChat) return temporaryChat;

        if (selectedChatId) {
            const selected = chatItems.find((chat) => chat.id === selectedChatId);
            if (selected) return selected;
        }

        return null;
    }, [chatItems, chatRoomId, selectedChatId]);

    
    const handleChatPreviewChange = useCallback((updatedChat: Chat) => {
        setChatOverrides((currentOverrides) => ({
            ...currentOverrides,
            [updatedChat.id]: updatedChat,
        }));
    }, []);

    const handleChatCreated = useCallback((createdChat: Chat) => {
        setCreatedChats((currentCreated) => ({
            ...currentCreated,
            [createdChat.chatRoomId]: createdChat,
        }));
        setSelectedChatId(createdChat.id);
    }, []);

    const handleSelectChat = useCallback(
        (chat: Chat | null) => {
            setSelectedChatId(chat?.id ?? null);

            if (chat?.chatRoomId) {
                router.replace(`/chat?chatRoomId=${chat.chatRoomId}`, {
                    scroll: false,
                });
            }
        },
        [router]
    );

    const filteredChats = useMemo(() => {
        const normalizedSearch = search.toLowerCase();

        return chatItems.filter((chat) => {
            const matchTab = activeTab === "all" || chat.status === activeTab;
            const searchableText = [
                chat.name,
                chat.crop?.cropName,
                chat.crop?.category,
                getChatTypeLabel(chat.chatType),
            ].join(" ").toLowerCase();
            const matchSearch = searchableText.includes(normalizedSearch);

            return matchTab && matchSearch;
        });
    }, [chatItems, activeTab, search]);

    const sidebarChats = useMemo(
        () => filteredChats.filter((chat) => !chat.isTemporary),
        [filteredChats]
    );

    return (
        <ChatLayout
            role="FARMER"
            chats={sidebarChats}
            selectedChat={selectedChat}
            activeTab={activeTab}
            search={search}
            onSearchChange={setSearch}
            onChangeTab={setActiveTab}
            onSelectChat={handleSelectChat}
            onChatPreviewChange={handleChatPreviewChange}
            onChatCreated={handleChatCreated}
        />
    );
}

function sortChatsByActivity(chats: Chat[]) {
    return [...chats].sort((firstChat, secondChat) => {
        const firstTime = getActivityTime(firstChat);
        const secondTime = getActivityTime(secondChat);

        return secondTime - firstTime;
    });
}

function getActivityTime(chat: Chat) {
    const value = chat.lastActivityAt ?? chat.messages.at(-1)?.createdAt;
    const time = value ? new Date(value).getTime() : 0;

    return Number.isFinite(time) ? time : 0;
}

function findChatByRoomId(
    chatRoomId: string | undefined,
    chats: Chat[],
    overrides: Record<string, Chat>
) {
    if (!chatRoomId) return null;

    return (
        Object.values(overrides).find((chat) => chat.chatRoomId === chatRoomId) ??
        chats.find((chat) => chat.chatRoomId === chatRoomId) ??
        null
    );
}

function mergeSocketMessageIntoChat(
    chat: Chat,
    message: Message,
    socketMessage: ChatSocketMessage,
    currentUserId: string,
    isSelected: boolean
): Chat {
    const hasMessage = chat.messages.some((item) => item.id === message.id);
    const nextMessages = hasMessage
        ? chat.messages.map((item) => (item.id === message.id ? message : item))
        : [...chat.messages, message];
    const previewMessage = message.type === "file"
        ? message.file?.type === "image"
            ? "sent a photo"
            : "sent a file"
        : message.text
            ? formatCardMessageLabel(message.text)
            : "No messages yet";

    return {
        ...chat,
        preview: formatChatPreview(
            previewMessage,
            socketMessage.senderId,
            socketMessage.senderName ?? chat.name,
            currentUserId
        ),
        lastMessage: previewMessage,
        lastMessageSenderId: socketMessage.senderId ?? null,
        lastMessageSenderName: socketMessage.senderName ?? null,
        time: formatChatTime(socketMessage.createdAt),
        lastActivityAt: socketMessage.createdAt ?? new Date().toISOString(),
        unreadCount:
            !hasMessage && !isSelected && socketMessage.senderId !== currentUserId
                ? (chat.unreadCount ?? 0) + 1
                : chat.unreadCount ?? 0,
        messages: nextMessages,
    };
}

function mapSocketMessage(
    socketMessage: ChatSocketMessage,
    currentUserId: string
): Message | null {
    const content = socketMessage.content?.trim();
    const fileName = socketMessage.fileName?.trim();

    if (!content && !fileName) return null;

    return {
        id: socketMessage.chatMessageId ?? crypto.randomUUID(),
        sender: socketMessage.senderId === currentUserId ? "me" : "other",
        type: fileName ? "file" : "text",
        text: content,
        time: formatChatTime(socketMessage.createdAt),
        createdAt: socketMessage.createdAt ?? new Date().toISOString(),
        senderProfileUrl: socketMessage.senderProfileUrl ?? null,
        file: fileName
            ? {
                name: content || fileName,
                storedName: fileName,
                size: socketMessage.fileSize ?? "",
                type: getChatFileType(content || fileName),
            }
            : undefined,
    };
}

function formatChatPreview(
    message: string,
    senderId?: string | null,
    senderName?: string | null,
    currentUserId?: string
) {
    const prefix = senderId && currentUserId && senderId === currentUserId
        ? "You"
        : senderName;

    return prefix ? `${prefix}: ${message}` : message;
}

function getChatFileType(fileName: string): ChatFile["type"] {
    const extension = fileName.split(".").pop()?.toLowerCase() ?? "";

    if (["png", "jpg", "jpeg", "webp", "gif"].includes(extension)) return "image";
    if (extension === "pdf") return "pdf";
    if (["xls", "xlsx"].includes(extension)) return "xlsx";

    return "doc";
}
