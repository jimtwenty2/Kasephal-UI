import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export type ChatSocketMessage = {
  chatRoomId: string;
  chatMessageId?: string;
  senderId?: string;
  senderName?: string | null;
  senderProfileUrl?: string | null;
  senderLocation?: string | null;
  content?: string;
  fileName?: string | null;
  fileSize?: string | null;
  createdAt?: string;
};

export type ChatTypingMessage = {
  chatRoomId: string;
  senderId?: string;
  senderName?: string | null;
  senderProfileUrl?: string | null;
  typing?: boolean;
  eventAt?: string;
};

export type ChatPresenceMessage = {
  userId?: string;
  online?: boolean;
  eventAt?: string;
};

export type ChatRoomSocketItem = {
  chatRoomId: string;
  chatType: "CROP_PRODUCT" | "CROP_DEMAND" | "DIRECT";
  isArchived?: boolean | null;
  postId?: string | null;
  contractId?: string | null;
  farmerId: string;
  farmerName?: string | null;
  farmerProfileUrl?: string | null;
  farmerLocation?: string | null;
  farmerOnline?: boolean | null;
  buyerId: string;
  buyerName?: string | null;
  buyerProfileUrl?: string | null;
  buyerLocation?: string | null;
  buyerOnline?: boolean | null;
  lastMessage?: string | null;
  lastMessageSenderId?: string | null;
  lastMessageSenderName?: string | null;
  lastMessageAt?: string | null;
  unreadCount?: number | null;
  createdAt?: string | null;
};

export type ChatRoomEventMessage = {
  eventType?: "ROOM_UPSERTED" | string;
  room?: ChatRoomSocketItem | null;
  message?: ChatSocketMessage | null;
};

type ChatRoomSocketProps = {
  token: string;
  chatRoomId: string;
  onMessage: (message: ChatSocketMessage) => void;
  onTyping?: (message: ChatTypingMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
};

type ChatRoomsSocketProps = {
  token: string;
  chatRoomIds: string[];
  onMessage: (message: ChatSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
};

type ChatEventsSocketProps = {
  token: string;
  onMessage: (message: ChatSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
};

type ChatRoomEventsSocketProps = {
  token: string;
  onRoomEvent: (message: ChatRoomEventMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
};

type ChatPresenceSocketProps = {
  token: string;
  onPresence: (message: ChatPresenceMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
};

function normalizeMessage<T>(body: string): T | null {
  const data = JSON.parse(body);
  const payload = data?.payload ?? data;

  if (!payload || typeof payload !== "object") return null;

  return payload as T;
}

export function createChatRoomSocket({
  token,
  chatRoomId,
  onMessage,
  onTyping,
  onConnect,
  onDisconnect,
}: ChatRoomSocketProps) {
  const socketBaseUrl = process.env.NEXT_PUBLIC_BASE_WS_URL?.trim();

  if (!socketBaseUrl) {
    console.warn(
      "NEXT_PUBLIC_BASE_WS_URL is not configured; chat socket disabled.",
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
        `/topic/chat-rooms/${chatRoomId}`,
        (message: IMessage) => {
          try {
            const parsedMessage = normalizeMessage<ChatSocketMessage>(message.body);
            if (!parsedMessage || parsedMessage.chatRoomId !== chatRoomId) {
              return;
            }

            onMessage(parsedMessage);
          } catch (error) {
            console.error("Failed to parse chat socket message", error);
          }
        },
      );

      client.subscribe(
        `/topic/chat-rooms/${chatRoomId}/typing`,
        (message: IMessage) => {
          try {
            const parsedMessage = normalizeMessage<ChatTypingMessage>(message.body);
            if (!parsedMessage || parsedMessage.chatRoomId !== chatRoomId) {
              return;
            }

            onTyping?.(parsedMessage);
          } catch (error) {
            console.error("Failed to parse chat typing message", error);
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

export function createChatEventsSocket({
  token,
  onMessage,
  onConnect,
  onDisconnect,
}: ChatEventsSocketProps) {
  const socketBaseUrl = process.env.NEXT_PUBLIC_BASE_WS_URL?.trim();

  if (!socketBaseUrl) {
    console.warn(
      "NEXT_PUBLIC_BASE_WS_URL is not configured; chat event socket disabled.",
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

      client.subscribe("/user/queue/chat-events", (message: IMessage) => {
        try {
          const parsedMessage = normalizeMessage<ChatSocketMessage>(message.body);
          if (!parsedMessage?.chatRoomId) return;

          onMessage(parsedMessage);
        } catch (error) {
          console.error("Failed to parse chat event socket message", error);
        }
      });
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

export function createChatRoomEventsSocket({
  token,
  onRoomEvent,
  onConnect,
  onDisconnect,
}: ChatRoomEventsSocketProps) {
  const socketBaseUrl = process.env.NEXT_PUBLIC_BASE_WS_URL?.trim();

  if (!socketBaseUrl) {
    console.warn(
      "NEXT_PUBLIC_BASE_WS_URL is not configured; chat room event socket disabled.",
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

      client.subscribe("/user/queue/chat-room-events", (message: IMessage) => {
        try {
          const parsedMessage = normalizeMessage<ChatRoomEventMessage>(message.body);
          if (!parsedMessage?.room?.chatRoomId) return;

          onRoomEvent(parsedMessage);
        } catch (error) {
          console.error("Failed to parse chat room event socket message", error);
        }
      });
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

export function createChatRoomsSocket({
  token,
  chatRoomIds,
  onMessage,
  onConnect,
  onDisconnect,
}: ChatRoomsSocketProps) {
  const socketBaseUrl = process.env.NEXT_PUBLIC_BASE_WS_URL?.trim();
  const roomIds = Array.from(new Set(chatRoomIds.filter(Boolean)));

  if (!socketBaseUrl || roomIds.length === 0) {
    if (!socketBaseUrl) {
      console.warn(
        "NEXT_PUBLIC_BASE_WS_URL is not configured; chat socket disabled.",
      );
    }
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

      for (const chatRoomId of roomIds) {
        client.subscribe(
          `/topic/chat-rooms/${chatRoomId}`,
          (message: IMessage) => {
            try {
              const parsedMessage = normalizeMessage<ChatSocketMessage>(message.body);
              if (!parsedMessage || parsedMessage.chatRoomId !== chatRoomId) {
                return;
              }

              onMessage(parsedMessage);
            } catch (error) {
              console.error("Failed to parse chat socket message", error);
            }
          },
        );
      }
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

export function createChatPresenceSocket({
  token,
  onPresence,
  onConnect,
  onDisconnect,
}: ChatPresenceSocketProps) {
  const socketBaseUrl = process.env.NEXT_PUBLIC_BASE_WS_URL?.trim();

  if (!socketBaseUrl) {
    console.warn(
      "NEXT_PUBLIC_BASE_WS_URL is not configured; chat presence socket disabled.",
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

      client.subscribe("/topic/chat-presence", (message: IMessage) => {
        try {
          const parsedMessage = normalizeMessage<ChatPresenceMessage>(message.body);
          if (!parsedMessage?.userId) return;

          onPresence(parsedMessage);
        } catch (error) {
          console.error("Failed to parse chat presence message", error);
        }
      });
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
