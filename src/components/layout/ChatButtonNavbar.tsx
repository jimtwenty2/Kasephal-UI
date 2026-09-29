"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";

import { getChatUnreadRoomIdsAction } from "@/app/chat/_actions/getChatUnreadCountAction";
import {
  createChatEventsSocket,
  createChatRoomEventsSocket,
} from "@/lib/chat-socket";

const CHAT_ROOM_READ_EVENT = "kasephal:chat-room-read";

export default function ChatButtonNavbar() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const unreadRoomIdsRef = useRef<Set<string>>(new Set());

  const setUnreadRoomIds = useCallback((updater: (roomIds: Set<string>) => void) => {
    const nextRoomIds = new Set(unreadRoomIdsRef.current);
    updater(nextRoomIds);
    unreadRoomIdsRef.current = nextRoomIds;
    setUnreadCount(nextRoomIds.size);
  }, []);

  useEffect(() => {
    const token = session?.user?.accessToken;
    if (!token) {
      unreadRoomIdsRef.current = new Set();
      const resetTimer = window.setTimeout(() => setUnreadCount(0), 0);

      return () => window.clearTimeout(resetTimer);
    }

    let cancelled = false;

    async function loadUnreadRooms() {
      const roomIds = await getChatUnreadRoomIdsAction();
      if (cancelled) return;

      unreadRoomIdsRef.current = new Set(roomIds);
      setUnreadCount(unreadRoomIdsRef.current.size);
    }

    void loadUnreadRooms();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.accessToken]);

  useEffect(() => {
    const currentUserId = session?.user?.userId;
    const token = session?.user?.accessToken;
    if (!token || !currentUserId) return;

    const chatClient = createChatEventsSocket({
      token,
      onMessage: (message) => {
        if (!message.chatRoomId || message.senderId === currentUserId) return;

        setUnreadRoomIds((roomIds) => {
          roomIds.add(message.chatRoomId);
        });
      },
    });

    const roomClient = createChatRoomEventsSocket({
      token,
      onRoomEvent: (event) => {
        const message = event.message;
        const chatRoomId = event.room?.chatRoomId ?? message?.chatRoomId;

        if (!chatRoomId || message?.senderId === currentUserId) return;

        setUnreadRoomIds((roomIds) => {
          roomIds.add(chatRoomId);
        });
      },
    });

    chatClient?.activate();
    roomClient?.activate();

    return () => {
      void chatClient?.deactivate();
      void roomClient?.deactivate();
    };
  }, [session?.user?.accessToken, session?.user?.userId, setUnreadRoomIds]);

  useEffect(() => {
    function handleRoomRead(event: Event) {
      const chatRoomId = (event as CustomEvent<{ chatRoomId?: string }>).detail
        ?.chatRoomId;

      if (!chatRoomId) return;

      setUnreadRoomIds((roomIds) => {
        roomIds.delete(chatRoomId);
      });
    }

    window.addEventListener(CHAT_ROOM_READ_EVENT, handleRoomRead);

    return () => {
      window.removeEventListener(CHAT_ROOM_READ_EVENT, handleRoomRead);
    };
  }, [setUnreadRoomIds]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== CHAT_ROOM_READ_EVENT || !event.newValue) return;

      try {
        const payload = JSON.parse(event.newValue) as { chatRoomId?: string };
        if (!payload.chatRoomId) return;

        setUnreadRoomIds((roomIds) => {
          roomIds.delete(payload.chatRoomId!);
        });
      } catch {
        // Ignore malformed cross-tab events.
      }
    }

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [setUnreadRoomIds]);

  const unreadLabel = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-[#3A3A3A]">
      <ChatBubbleLeftRightIcon className="h-5 w-5" />
      {unreadCount > 0 && (
        <span
          aria-label={`${unreadCount} unread chat room${unreadCount === 1 ? "" : "s"}`}
          className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold leading-none text-white"
        >
          {unreadLabel}
        </span>
      )}
    </span>
  );
}
