"use server";

import headerToken from "@/lib/headerToken";
import {
    IDENTITY_VERIFICATION_REQUIRED_MESSAGE,
    isIdentityVerified,
} from "@/lib/identityVerification";
import { apiBaseUrl } from "@/utils/apiBaseUrl";

type SendChatMessageInput = {
    chatRoomId: string;
    content?: string;
    fileName?: string;
    fileSize?: number;
    fileUrl?: string;
};

export async function sendChatMessageAction(input: SendChatMessageInput) {
    if (!(await isIdentityVerified())) {
        return {
            success: false,
            error: IDENTITY_VERIFICATION_REQUIRED_MESSAGE,
            payload: null,
        };
    }

    const headers = await headerToken();

    const res = await fetch(
        `${apiBaseUrl}/chat-rooms/${input.chatRoomId}/messages`,
        {
            method: "POST",
            headers: {
                ...headers,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content: input.content ?? "",
                ...(input.fileName ? { fileName: input.fileName } : {}),
                ...(input.fileSize ? { fileSize: input.fileSize } : {}),
                ...(input.fileUrl ? { fileUrl: input.fileUrl } : {}),
            }),
            cache: "no-store",
        }
    );

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        return {
            success: false,
            error: data?.detail || data?.message || "Failed to send message",
            payload: null,
        };
    }

    return {
        success: true,
        error: null,
        payload: data?.payload,
    };
}
