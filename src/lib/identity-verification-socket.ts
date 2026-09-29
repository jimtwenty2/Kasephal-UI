import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export type IdentityVerificationSocketMessage = {
  status?: string;
  identityDocumentId?: string;
  hasDocument?: boolean;
  isVerifiedIdentity?: boolean;
  rejectionReason?: string | null;
  eventAt?: string;
};

type IdentityVerificationSocketProps = {
  token: string;
  onVerificationUpdate: (message: IdentityVerificationSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
};

function normalizeMessage(body: string): IdentityVerificationSocketMessage | null {
  const data = JSON.parse(body);
  const payload = data?.payload ?? data?.data ?? data;

  if (!payload || typeof payload !== "object") return null;

  return payload as IdentityVerificationSocketMessage;
}

export function createIdentityVerificationSocket({
  token,
  onVerificationUpdate,
  onConnect,
  onDisconnect,
}: IdentityVerificationSocketProps) {
  const socketBaseUrl = process.env.NEXT_PUBLIC_BASE_WS_URL?.trim();

  if (!socketBaseUrl) {
    console.warn(
      "NEXT_PUBLIC_BASE_WS_URL is not configured; identity verification socket disabled.",
    );
    return null;
  }

  const client = new Client({
    webSocketFactory: () =>
      new SockJS(`${socketBaseUrl.replace(/\/$/, "")}/ws-sockjs`),

    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },

    reconnectDelay: 5000,

    onConnect: () => {
      onConnect?.();

      client.subscribe(
        "/user/queue/identity-verification",
        (message: IMessage) => {
          try {
            const parsedMessage = normalizeMessage(message.body);
            if (!parsedMessage) return;

            onVerificationUpdate(parsedMessage);
          } catch (error) {
            console.error("Failed to parse identity verification socket message", error);
          }
        },
      );
    },

    onWebSocketClose: () => {
      onDisconnect?.();
    },

    onStompError: () => {
      onDisconnect?.();
    },
  });

  return client;
}
