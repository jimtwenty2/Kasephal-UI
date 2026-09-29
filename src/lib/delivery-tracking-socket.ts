import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { DeliveryTracking } from "@/services/delivery-tracking.service";

export type DeliveryTrackingSocketMessage = {
  eventType?: "TRACKING_UPDATED" | string;
  tracking?: DeliveryTracking | null;
};

type DeliveryTrackingSocketProps = {
  token: string;
  onTrackingUpdate: (message: DeliveryTrackingSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
};

function normalizeMessage(body: string): DeliveryTrackingSocketMessage | null {
  const data = JSON.parse(body);
  const payload = data?.payload ?? data?.data ?? data;

  if (!payload || typeof payload !== "object") return null;

  return payload as DeliveryTrackingSocketMessage;
}

export function createDeliveryTrackingSocket({
  token,
  onTrackingUpdate,
  onConnect,
  onDisconnect,
}: DeliveryTrackingSocketProps) {
  const socketBaseUrl = process.env.NEXT_PUBLIC_BASE_WS_URL?.trim();

  if (!socketBaseUrl) {
    console.warn(
      "NEXT_PUBLIC_BASE_WS_URL is not configured; delivery tracking socket disabled.",
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
        "/user/queue/delivery-tracking-events",
        (message: IMessage) => {
          try {
            const parsedMessage = normalizeMessage(message.body);
            if (!parsedMessage?.tracking?.orderId) return;

            onTrackingUpdate(parsedMessage);
          } catch (error) {
            console.error("Failed to parse delivery tracking socket message", error);
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
