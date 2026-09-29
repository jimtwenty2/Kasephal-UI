"use server";

import headerToken from "@/lib/headerToken";
import { apiBaseUrl } from "@/utils/apiBaseUrl";

type ChatRoomUnreadItem = {
  chatRoomId?: string | null;
  unreadCount?: number | null;
};

/**
 * Initial unread room ids for the navbar chat badge. The badge counts rooms,
 * not messages, so one room with many unread messages still contributes one.
 * After this one load, the navbar keeps the set in sync from websocket events.
 */
export async function getChatUnreadRoomIdsAction(): Promise<string[]> {
  try {
    const headers = await headerToken();

    const res = await fetch(`${apiBaseUrl}/chat-rooms`, {
      cache: "no-store",
      headers,
    });

    if (!res.ok) return [];

    const data = await res.json().catch(() => null);
    const payload = data?.payload ?? data?.data ?? data;
    const items: ChatRoomUnreadItem[] = Array.isArray(payload)
      ? payload
      : payload?.items ?? payload?.content ?? payload?.data ?? [];

    return items
      .filter((item) => (item.unreadCount ?? 0) > 0)
      .map((item) => item.chatRoomId)
      .filter((chatRoomId): chatRoomId is string => Boolean(chatRoomId));
  } catch {
    return [];
  }
}
