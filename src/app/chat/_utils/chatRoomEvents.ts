import type {
  ChatRoomEventMessage,
  ChatRoomSocketItem,
  ChatSocketMessage,
} from "@/lib/chat-socket";
import type { Chat, ChatFile, Message, UserRole } from "../_types/chat";
import { formatCardMessageLabel } from "./cardMessagePreview";
import { formatChatTime } from "./formatChatTime";

type UpsertOptions = {
  role: UserRole;
  currentUserId: string;
  selectedChatId?: string | null;
  selectedChatRoomId?: string | null;
};

export function upsertChatRoomEvent(
  chats: Chat[],
  event: ChatRoomEventMessage,
  options: UpsertOptions,
): Chat[] {
  if (event.eventType && event.eventType !== "ROOM_UPSERTED") return chats;
  if (!event.room?.chatRoomId) return chats;

  const existingIndex = chats.findIndex(
    (chat) => chat.chatRoomId === event.room?.chatRoomId,
  );
  const existingChat = existingIndex >= 0 ? chats[existingIndex] : undefined;
  const isSelected =
    event.room.chatRoomId === options.selectedChatRoomId ||
    existingChat?.id === options.selectedChatId;

  let nextChat = mapRoomToChat(event.room, options.role, options.currentUserId, existingChat);

  if (event.message) {
    nextChat = mergeRoomEventMessage(
      nextChat,
      event.message,
      options.currentUserId,
      isSelected,
    );
  }

  if (existingIndex < 0) {
    return [nextChat, ...chats];
  }

  return chats.map((chat, index) => (index === existingIndex ? nextChat : chat));
}

function mapRoomToChat(
  room: ChatRoomSocketItem,
  role: UserRole,
  currentUserId: string,
  existingChat?: Chat,
): Chat {
  const isFarmer = role === "FARMER";
  const participantName =
    (isFarmer ? room.buyerName : room.farmerName)?.trim() ||
    existingChat?.name ||
    (isFarmer ? "Buyer" : "Farmer");
  const lastActivityAt =
    room.lastMessageAt ?? room.createdAt ?? existingChat?.lastActivityAt ?? null;

  return {
    id: room.chatRoomId,
    chatRoomId: room.chatRoomId,
    postId: room.postId ?? existingChat?.postId ?? "",
    alternatePostId: existingChat?.alternatePostId,
    postOwnerId: existingChat?.postOwnerId,
    postOwnerRole: existingChat?.postOwnerRole,
    farmerId: room.farmerId,
    buyerId: room.buyerId,
    role: isFarmer ? "farmer" : "buyer",
    chatType: room.chatType,
    name: participantName,
    location:
      (isFarmer ? room.buyerLocation : room.farmerLocation) ??
      existingChat?.location ??
      "",
    avatar:
      (isFarmer ? room.buyerProfileUrl : room.farmerProfileUrl) ??
      existingChat?.avatar ??
      "/assets/nav-bar/profile.png",
    preview: formatLastMessagePreview(
      room.lastMessage ?? existingChat?.lastMessage ?? null,
      room.lastMessageSenderId ?? existingChat?.lastMessageSenderId ?? null,
      room.lastMessageSenderName ?? existingChat?.lastMessageSenderName ?? null,
      currentUserId,
    ),
    lastMessage: room.lastMessage ?? existingChat?.lastMessage ?? null,
    lastMessageSenderId:
      room.lastMessageSenderId ?? existingChat?.lastMessageSenderId ?? null,
    lastMessageSenderName:
      room.lastMessageSenderName ?? existingChat?.lastMessageSenderName ?? null,
    time: formatChatTime(lastActivityAt),
    lastActivityAt,
    unreadCount: room.unreadCount ?? existingChat?.unreadCount ?? 0,
    status: room.isArchived ? "archived" : "active",
    online: isFarmer ? Boolean(room.buyerOnline) : Boolean(room.farmerOnline),
    profile: existingChat?.profile,
    contractId: room.contractId ?? existingChat?.contractId ?? null,
    orderReadyContractId: existingChat?.orderReadyContractId ?? null,
    hasContract: Boolean(room.contractId ?? existingChat?.contractId),
    crop: existingChat?.crop,
    messages: existingChat?.messages ?? [],
    isTemporary: existingChat?.isTemporary,
    forceNew: existingChat?.forceNew,
  };
}

function mergeRoomEventMessage(
  chat: Chat,
  socketMessage: ChatSocketMessage,
  currentUserId: string,
  isSelected: boolean,
): Chat {
  const message = mapSocketMessage(socketMessage, currentUserId);
  if (!message) return chat;

  const hasMessage = chat.messages.some((item) => item.id === message.id);
  const nextMessages = hasMessage
    ? chat.messages.map((item) => (item.id === message.id ? message : item))
    : [...chat.messages, message];
  const previewMessage = getMessagePreview(message);

  return {
    ...chat,
    preview: formatChatPreview(
      previewMessage,
      socketMessage.senderId,
      socketMessage.senderName ?? chat.name,
      currentUserId,
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
  currentUserId: string,
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

function formatLastMessagePreview(
  message: string | null,
  senderId: string | null,
  senderName: string | null,
  currentUserId: string,
) {
  if (!message) return "No messages yet";

  return formatChatPreview(
    formatCardMessageLabel(message),
    senderId,
    senderName,
    currentUserId,
  );
}

function getMessagePreview(message: Message) {
  if (message.type === "file") {
    return message.file?.type === "image" ? "sent a photo" : "sent a file";
  }

  return message.text ? formatCardMessageLabel(message.text) : "No messages yet";
}

function formatChatPreview(
  message: string,
  senderId?: string | null,
  senderName?: string | null,
  currentUserId?: string,
) {
  const prefix =
    senderId && currentUserId && senderId === currentUserId ? "You" : senderName;

  return prefix ? `${prefix}: ${message}` : message;
}

function getChatFileType(fileName: string): ChatFile["type"] {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";

  if (["png", "jpg", "jpeg", "webp", "gif"].includes(extension)) return "image";
  if (extension === "pdf") return "pdf";
  if (["xls", "xlsx"].includes(extension)) return "xlsx";

  return "doc";
}
