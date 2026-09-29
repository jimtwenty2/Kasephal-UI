"use server";

import headerToken from "@/lib/headerToken";
import {
  IDENTITY_VERIFICATION_REQUIRED_MESSAGE,
  isIdentityVerified,
} from "@/lib/identityVerification";
import { apiBaseUrl } from "@/utils/apiBaseUrl";
import type { ChatType } from "../_types/chat";

type StartChatRoomInput = {
  postId?: string;
  alternatePostId?: string;
  farmerId?: string;
  buyerId?: string;
  message: string;
  chatType: ChatType;
  forceNew?: boolean;
};

type StartChatRoomPayload = {
  chatRoomId: string;
  contractId?: string | null;
  messageSent?: boolean | null;
  reusedExistingRoom?: boolean | null;
};

function buildStartChatBody(input: StartChatRoomInput, postId?: string) {
  return {
    chatType: input.chatType,
    message: input.message,
    ...(postId ? { postId } : {}),
    ...(input.farmerId ? { farmerId: input.farmerId } : {}),
    ...(input.buyerId ? { buyerId: input.buyerId } : {}),
    ...(input.forceNew ? { forceNew: true } : {}),
  };
}

function shouldRetryWithAlternatePostId(
  input: StartChatRoomInput,
  error?: string | null,
) {
  if (input.chatType !== "CROP_DEMAND") return false;
  if (!input.alternatePostId || input.alternatePostId === input.postId) return false;

  const normalizedError = String(error ?? "").toLowerCase();

  return (
    normalizedError.includes("post not found") ||
    normalizedError.includes("not found")
  );
}

async function postStartChatRoom(
  input: StartChatRoomInput,
  headers: HeadersInit,
  postId?: string,
) {
  const res = await fetch(`${apiBaseUrl}/chat-rooms/start`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildStartChatBody(input, postId)),
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);
  const error = data?.detail || data?.message || "Failed to start chat room";

  return { res, data, error };
}

export async function startChatRoomAction(input: StartChatRoomInput) {
  if (!(await isIdentityVerified())) {
    return {
      success: false,
      error: IDENTITY_VERIFICATION_REQUIRED_MESSAGE,
      payload: null,
    };
  }

  const headers = await headerToken();

  let result = await postStartChatRoom(input, headers, input.postId);

  if (shouldRetryWithAlternatePostId(input, result.error)) {
    result = await postStartChatRoom(input, headers, input.alternatePostId);
  }


  if (!result.res.ok) {
    return {
      success: false,
      error: result.error,
      payload: null,
    };
  }

  return {
    success: true,
    error: null,
    payload: result.data?.payload as StartChatRoomPayload | null,
  };
}
