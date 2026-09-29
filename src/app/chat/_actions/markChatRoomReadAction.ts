"use server";

import headerToken from "@/lib/headerToken";
import { apiBaseUrl } from "@/utils/apiBaseUrl";

export async function markChatRoomReadAction(chatRoomId: string) {
  if (!chatRoomId) return { success: false };

  const headers = await headerToken();

  const res = await fetch(`${apiBaseUrl}/chat-rooms/${chatRoomId}/read`, {
    method: "PATCH",
    headers,
    cache: "no-store",
  });

  return { success: res.ok };
}
