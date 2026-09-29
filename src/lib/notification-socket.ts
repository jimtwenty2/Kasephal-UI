import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

type NotificationSocketProps = {
  token: string;
  onNotification: (data: unknown) => void;
  onUnreadCount: (count: number) => void;
};

export function createNotificationSocket({
  token,
  onNotification,
  onUnreadCount,
}: NotificationSocketProps) {
  const socketBaseUrl = process.env.NEXT_PUBLIC_BASE_WS_URL?.trim();

  if (!socketBaseUrl) {
    console.warn(
      "NEXT_PUBLIC_BASE_WS_URL is not configured; notification socket disabled.",
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
      client.subscribe("/user/queue/notifications", (message: IMessage) => {
        onNotification(JSON.parse(message.body));
      });

      client.subscribe(
        "/user/queue/notification-count",
        (message: IMessage) => {
          const data = JSON.parse(message.body);
          const count =
            typeof data === "number"
              ? data
              : (data?.count ?? data?.unreadCount ?? 0);
          onUnreadCount(count);
        },
      );
    },
  });

  return client;
}
