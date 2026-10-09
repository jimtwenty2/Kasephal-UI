"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { X } from "lucide-react";

import type {
  Chat,
  ChatTranslationMode,
  Message,
  UserRole,
} from "../_types/chat";

import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import EmptyConversation from "./EmptyConversation";
import ContractButton from "./ContractButton";
import { formatCardMessageLabel } from "../_utils/cardMessagePreview";
import { ShoppingCart } from "lucide-react";

import { startChatRoomAction } from "../_actions/startChatRoomAction";
import { markChatRoomReadAction } from "../_actions/markChatRoomReadAction";
import { getActiveCropProductOrderChatAction } from "@/action/crop-product-order.action";
import { IDENTITY_VERIFICATION_REQUIRED_MESSAGE } from "@/lib/identityVerification";
import { uploadAttachmentAction } from "@/action/upload.action";
import { getCropProductsByUserIdAction } from "@/action/crop-product.action";
import { getOwnCropDemandsAction } from "@/action/crop-demand.action";
import { showApiToast } from "@/lib/apiToast";
import { getCropProductImages } from "@/lib/cropProductImage";
import type { CropProductPost } from "@/types/crop-product";
import type { CropDemandPost } from "@/types/crop-demand";
import { getFileUrl } from "@/utils/getFileUrl";
import {
  createChatRoomSocket,
  type ChatTypingMessage,
  type ChatSocketMessage,
} from "@/lib/chat-socket";
import {
  getAttachmentDownloadUrl,
  getAttachmentUrl,
} from "@/utils/getAttachmentUrl";
import { formatChatTime } from "../_utils/formatChatTime";

const CHAT_TRANSLATE_STORAGE_PREFIX = "kasephal.chat.translation-mode";
const LEGACY_CHAT_TRANSLATE_STORAGE_PREFIX = "kasephal.chat.translate.en-to-kh";
const CHAT_ROOM_READ_EVENT = "kasephal:chat-room-read";
const FALLBACK_PRODUCT_IMAGE = "/assets/image/no-product.jpg";
const FALLBACK_DEMAND_IMAGE = "/image-demand/product2.jpg";

type Props = {
  role: UserRole;
  chat: Chat;
  onShowFarmerReviewContract?: () => void;
  onChatPreviewChange?: (chat: Chat) => void;
  onChatCreated?: (chat: Chat) => void;
  onMobileBack?: () => void;
  onToggleProfile?: () => void;
};

export default function ChatDetail({
  role,
  chat,
  onChatPreviewChange,
  onChatCreated,
  onMobileBack,
  onToggleProfile,
}: Props) {
  const router = useRouter();
  const { data: session } = useSession();

  const [messageState, setMessageState] = useState<{
    chatId: string;
    messages: Message[];
  }>({
    chatId: chat.id,
    messages: chat.messages ?? [],
  });
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typingState, setTypingState] = useState<{
    chatId: string;
    userName: string;
  } | null>(null);
  const [visibleMessageTime, setVisibleMessageTime] = useState<{
    chatId: string;
    messageId: string;
  } | null>(null);
  const [translationModeByChatId, setTranslationModeByChatId] = useState<
    Record<string, ChatTranslationMode>
  >({});
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productPickerLoading, setProductPickerLoading] = useState(false);
  const [productPickerError, setProductPickerError] = useState<string | null>(null);
  const [demandPickerError, setDemandPickerError] = useState<string | null>(null);
  const [farmerProducts, setFarmerProducts] = useState<CropProductPost[]>([]);
  const [productPickerFarmerId, setProductPickerFarmerId] = useState<string | null>(null);
  const [buyerDemands, setBuyerDemands] = useState<CropDemandPost[]>([]);
  const [pickerTab, setPickerTab] = useState<"products" | "demands">("products");
  const [orderNavigationLoading, setOrderNavigationLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messageIdsRef = useRef<string>("");
  const chatRef = useRef(chat);
  const socketRef = useRef<ReturnType<typeof createChatRoomSocket> | null>(
    null
  );
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sendTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingMessageIdsRef = useRef<string[]>([]);
  const lastTypingStateRef = useRef(false);
  const handleSendMessageRef = useRef<(content: string) => Promise<boolean>>(
    async () => false,
  );

  const isArchived = chat.status === "archived";
  const currentUserId = session?.user?.userId ?? "";
  const typingUserName =
    typingState?.chatId === chat.id ? typingState.userName : null;
  const visibleMessageTimeId =
    visibleMessageTime?.chatId === chat.id ? visibleMessageTime.messageId : null;
  const messages = useMemo(
    () =>
      messageState.chatId === chat.id
        ? messageState.messages
        : chat.messages ?? [],
    [chat.id, chat.messages, messageState]
  );
  const visibleMessages = useMemo(() => {
    if (!chat.contractId) return messages;

    const contractMarker = `CONTRACT_REQUEST:${chat.contractId}`;
    const hasContractCard = messages.some(
      (message) =>
        message.type === "text" &&
        message.text?.trimStart().startsWith(contractMarker)
    );

    if (hasContractCard) return messages;

    const cropName = chat.crop?.cropName ?? "Crop Demand";
    const farmerName = role === "BUYER" ? chat.name : "Farmer";

    return [
      ...messages,
      {
        id: `contract-fallback-${chat.contractId}`,
        sender: role === "BUYER" ? "me" : "other",
        type: "text",
        status: "sent",
        text: buildContractRequestMessage({
          contractId: chat.contractId,
          cropName,
          farmerName,
        }),
        time: "",
        createdAt: chat.lastActivityAt ?? undefined,
      } satisfies Message,
    ];
  }, [chat.contractId, chat.crop?.cropName, chat.lastActivityAt, chat.name, messages, role]);
  const translationMode =
    translationModeByChatId[chat.id] ?? "original";
  const linkedDirectChatRoomId = useMemo(
    () => getLinkedDirectChatRoomId(messages),
    [messages],
  );
  const directChatParams =
    role === "FARMER"
      ? `buyerId=${encodeURIComponent(chat.buyerId)}`
      : `farmerId=${encodeURIComponent(chat.farmerId)}`;
  const directChatHref = linkedDirectChatRoomId
    ? `/chat?chatRoomId=${encodeURIComponent(linkedDirectChatRoomId)}`
    : `/chat?new=true&chatType=DIRECT&${directChatParams}`;

  const setMessages = useCallback(
    (value: Message[] | ((messages: Message[]) => Message[])) => {
      setMessageState((prev) => {
        const currentMessages =
          prev.chatId === chat.id ? prev.messages : chat.messages ?? [];
        const nextMessages =
          typeof value === "function" ? value(currentMessages) : value;

        return {
          chatId: chat.id,
          messages: nextMessages,
        };
      });
    },
    [chat.id, chat.messages]
  );

  const clearPendingSend = useCallback(() => {
    if (sendTimeoutRef.current) {
      clearTimeout(sendTimeoutRef.current);
      sendTimeoutRef.current = null;
    }

    setLoading(false);
  }, []);

  const startPendingSendTimeout = useCallback(() => {
    if (sendTimeoutRef.current) {
      clearTimeout(sendTimeoutRef.current);
    }

    sendTimeoutRef.current = setTimeout(() => {
      const pendingIds = pendingMessageIdsRef.current;
      pendingMessageIdsRef.current = [];

      if (pendingIds.length > 0) {
        setMessages((prev) =>
          prev.map((message) =>
            pendingIds.includes(message.id)
              ? { ...message, status: "failed" }
              : message
          )
        );
      }

      setLoading(false);
      sendTimeoutRef.current = null;
      showApiToast(
        { success: false, error: "Message confirmation timed out." },
        {
          successTitle: "Message sent",
          errorTitle: "Still sending",
          errorMessage:
            "The message was sent to the server, but confirmation took too long. Please refresh if it does not appear.",
        },
      );
    }, 15000);
  }, [setMessages]);

  const markOptimisticMessageSent = useCallback(
    (messageId: string) => {
      if (sendTimeoutRef.current) {
        clearTimeout(sendTimeoutRef.current);
        sendTimeoutRef.current = null;
      }

      pendingMessageIdsRef.current = pendingMessageIdsRef.current.filter(
        (id) => id !== messageId
      );

      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId ? { ...message, status: "sent" } : message
        )
      );
      setLoading(false);
    },
    [setMessages]
  );

  const handleTypingMessage = useCallback(
    (typingMessage: ChatTypingMessage, userId: string) => {
      if (!typingMessage.senderId || typingMessage.senderId === userId) {
        return;
      }

      if (!typingMessage.typing) {
        setTypingState(null);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }

        return;
      }

      setTypingState({
        chatId: chatRef.current.id,
        userName: typingMessage.senderName || chatRef.current.name,
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setTypingState(null);
        typingTimeoutRef.current = null;
      }, 3500);
    },
    []
  );

  const handleTypingChange = useCallback(
    (typing: boolean) => {
      if (
        chat.isTemporary ||
        !chat.chatRoomId ||
        !socketRef.current?.connected ||
        lastTypingStateRef.current === typing
      ) {
        return;
      }

      lastTypingStateRef.current = typing;

      socketRef.current.publish({
        destination: "/app/chat/typing",
        body: JSON.stringify({
          chatRoomId: chat.chatRoomId,
          typing,
        }),
      });
    },
    [chat.chatRoomId, chat.isTemporary]
  );

  useEffect(() => {
    chatRef.current = chat;
  }, [chat]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const storedMode = getStoredChatTranslationMode(chat.id);

      setTranslationModeByChatId((currentValues) => {
        if (currentValues[chat.id]) return currentValues;

        return {
          ...currentValues,
          [chat.id]: storedMode,
        };
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [chat.id]);

  useEffect(() => {
    lastTypingStateRef.current = false;

    if (sendTimeoutRef.current) {
      clearTimeout(sendTimeoutRef.current);
      sendTimeoutRef.current = null;
    }
    pendingMessageIdsRef.current = [];

    const resetLoadingTimer = setTimeout(() => {
      setLoading(false);
    }, 0);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    return () => clearTimeout(resetLoadingTimer);
  }, [chat.id]);

  useEffect(() => {
    if (chat.isTemporary || !chat.chatRoomId || (chat.unreadCount ?? 0) === 0) {
      return;
    }

    onChatPreviewChange?.({
      ...chat,
      unreadCount: 0,
    });
    notifyChatRoomRead(chat.chatRoomId);
    void markChatRoomReadAction(chat.chatRoomId);
  }, [chat, onChatPreviewChange]);

  useEffect(() => {
    return () => {
      if (sendTimeoutRef.current) {
        clearTimeout(sendTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const messageIds = messages.map((message) => message.id).join("|");

    if (messageIdsRef.current && messageIdsRef.current !== messageIds) {
      setVisibleMessageTime(null);
    }

    messageIdsRef.current = messageIds;
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, typingUserName]);

  useEffect(() => {
    if (!productPickerOpen) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProductPickerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [productPickerOpen]);


  const socketHandlersRef = useRef({
    currentUserId,
    onChatPreviewChange,
    clearPendingSend,
    handleTypingMessage,
    setMessages,
  });
  useEffect(() => {
    socketHandlersRef.current = {
      currentUserId,
      onChatPreviewChange,
      clearPendingSend,
      handleTypingMessage,
      setMessages,
    };
  });

  useEffect(() => {
    if (!session?.user?.accessToken || !chat.chatRoomId || chat.isTemporary) {
      return;
    }

    const client = createChatRoomSocket({
      token: session.user.accessToken,
      chatRoomId: chat.chatRoomId,
      onConnect: () => setSocketConnected(true),
      onDisconnect: () => setSocketConnected(false),
      onMessage: (socketMessage) => {
        const {
          currentUserId,
          onChatPreviewChange,
          clearPendingSend,
          setMessages,
        } = socketHandlersRef.current;

        const nextMessage = mapSocketMessage(socketMessage, currentUserId);
        if (!nextMessage) return;

        onChatPreviewChange?.(
          buildChatPreviewUpdate(chatRef.current, nextMessage, socketMessage, currentUserId)
        );

        setMessages((prev) => {
          const optimisticIndex = prev.findIndex(
            (message) =>
              message.id.startsWith("optimistic-") &&
              message.sender === nextMessage.sender &&
              message.type === nextMessage.type &&
              message.text === nextMessage.text
          );

          if (optimisticIndex >= 0) {
            pendingMessageIdsRef.current = pendingMessageIdsRef.current.filter(
              (id) => id !== prev[optimisticIndex].id
            );

            return prev.map((message, index) =>
              index === optimisticIndex ? { ...nextMessage, status: "sent" } : message
            );
          }

          if (prev.some((message) => message.id === nextMessage.id)) {
            return prev.map((message) =>
              message.id === nextMessage.id
                ? {
                    ...message,
                    ...nextMessage,
                    status: message.status === "failed" ? message.status : "sent",
                  }
                : message
            );
          }

          return [...prev, { ...nextMessage, status: "sent" as const }];
        });

        if (socketMessage.senderId === currentUserId) {
          clearPendingSend();
        }

        if (socketMessage.senderId !== currentUserId) {
          setTypingState(null);

          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
          }
        }
      },
      onTyping: (typingMessage) => {
        const { currentUserId, handleTypingMessage } = socketHandlersRef.current;
        handleTypingMessage(typingMessage, currentUserId);
      },
    });

    if (!client) return;

    socketRef.current = client;
    client.activate();

    return () => {
      setSocketConnected(false);
      socketRef.current = null;
      void client.deactivate();
    };
  }, [chat.chatRoomId, chat.isTemporary, session?.user?.accessToken]);

  const handleCreateContract = () => {
    const params = new URLSearchParams({
      chatRoomId: chat.chatRoomId,
      postId: chat.postId,
      farmerId: chat.farmerId,
      farmerName: chat.name,
      chatType: chat.chatType,
    });

    router.push(`/digital-contract/create?${params.toString()}`);
  };

  const isBuyer = role === "BUYER";
  const canCreateContract = role === "BUYER" || role === "GOVERNMENT";

  const contractButtonLabel = "Create Contract";

  const contractButtonDisabled = false;
  const showContractButton =
    !isArchived &&
    canCreateContract &&
    chat.chatType === "CROP_DEMAND" &&
    !chat.hasActiveContract &&
    Boolean(chat.chatRoomId && chat.postId && chat.farmerId);
  
  const showOrderButton =
    !isArchived &&
    isBuyer &&
    !chat.hasOrder &&
    ((chat.chatType === "DIRECT" && Boolean(chat.farmerId && chat.chatRoomId)) ||
      (chat.chatType === "CROP_PRODUCT" &&
        Boolean(chat.postId && chat.farmerId)));
  const orderButtonLabel = chat.chatType === "DIRECT" ? "Trade" : "Order";


  const handleContractClick = () => {
    if (canCreateContract) {
      handleCreateContract();
    }
  };

  const openCropProductOrder = async ({
    postId,
    farmerId,
    chatRoomId,
    sourceChatRoomId,
  }: {
    postId: string;
    farmerId: string;
    chatRoomId?: string;
    sourceChatRoomId?: string;
  }) => {
    if (orderNavigationLoading) return;

    setOrderNavigationLoading(true);

    try {
      const activeOrderResult = await getActiveCropProductOrderChatAction({
        postId,
        farmerId,
      });

      if (activeOrderResult.success && activeOrderResult.data?.chatRoomId) {
        router.push(
          `/chat?chatRoomId=${encodeURIComponent(activeOrderResult.data.chatRoomId)}`,
        );
        return;
      }

      const params = new URLSearchParams({
        postId,
        farmerId,
      });

      if (chatRoomId) {
        params.set("chatRoomId", chatRoomId);
      }
      if (sourceChatRoomId) {
        params.set("sourceChatRoomId", sourceChatRoomId);
      }

      router.push(`/order-crop-product?${params.toString()}`);
    } finally {
      setOrderNavigationLoading(false);
    }
  };

  const handleOrderClick = async () => {
    if (chat.chatType === "CROP_DEMAND") {
      if (!chat.orderReadyContractId) {
        showApiToast(
          { success: false, error: "Please create and accept a contract before ordering this demand." },
          {
            successTitle: "Order ready",
            errorTitle: "Contract required",
          },
        );
        return;
      }

      router.push(
        `/order-crop-demands?postId=${encodeURIComponent(chat.postId)}&chatRoomId=${encodeURIComponent(chat.chatRoomId)}&farmerId=${encodeURIComponent(chat.farmerId)}&contractId=${encodeURIComponent(chat.orderReadyContractId)}`,
      );
      return;
    }

    if (chat.chatType === "DIRECT" || !chat.postId) {
      setProductPickerOpen(true);

      if (
        productPickerFarmerId === chat.farmerId &&
        (farmerProducts.length > 0 || productPickerLoading)
      ) {
        return;
      }

      setProductPickerFarmerId(chat.farmerId);
      setProductPickerLoading(true);
      setProductPickerError(null);
      setDemandPickerError(null);
      setFarmerProducts([]);
      setBuyerDemands([]);
      setPickerTab("products");

      const [productResult, demandResult] = await Promise.all([
        getCropProductsByUserIdAction(chat.farmerId, 1, 100),
        getOwnCropDemandsAction({ page: 1, size: 50, status: "OPEN" }),
      ]);

      if (productResult.error && demandResult.error) {
        setProductPickerError(productResult.error || demandResult.error || "Failed to load trade items.");
        setFarmerProducts([]);
        setBuyerDemands([]);
      } else {
        setDemandPickerError(demandResult.error ?? null);
        setFarmerProducts(productResult.data ?? []);
        setBuyerDemands(
          (demandResult.data ?? []).filter(
            (demand) =>
              demand.status === "OPEN" && Number(demand.quantityNeeded ?? 0) > 0,
          ),
        );
      }

      setProductPickerLoading(false);
      return;
    }

    await openCropProductOrder({
      postId: chat.postId,
      chatRoomId: chat.chatRoomId,
      farmerId: chat.farmerId,
    });
  };


  const handleSelectFarmerProduct = async (product: CropProductPost) => {
    const postId =
      product.postId ||
      product.post?.postId ||
      product.cropProductPostId ||
      product.cropProductId;

    if (!postId) {
      showApiToast(
        { success: false, error: "Missing product reference." },
        {
          successTitle: "Product selected",
          errorTitle: "Cannot start order",
        },
      );
      return;
    }

    const params = {
      postId,
      farmerId: chat.farmerId,
    };

    setProductPickerOpen(false);
    await openCropProductOrder({
      ...params,
      sourceChatRoomId:
        chat.chatType === "DIRECT" && chat.chatRoomId ? chat.chatRoomId : undefined,
    });
  };

  const handleSelectBuyerDemand = async (demand: CropDemandPost) => {
    const postId = demand.postId || demand.cropDemandPostId;

    if (!postId) {
      showApiToast(
        { success: false, error: "Missing demand reference." },
        {
          successTitle: "Demand selected",
          errorTitle: "Cannot start negotiation",
        },
      );
      return;
    }

    setProductPickerLoading(true);

    const result = await startChatRoomAction({
      postId,
      farmerId: chat.farmerId,
      message: buildDemandNegotiationMessage({
        postId,
        title: demand.title || demand.cropName || "Crop Demand",
        quantity: demand.quantityNeeded
          ? `${demand.quantityNeeded} ${demand.unitType ?? "KG"}`
          : "",
      }),
      chatType: "CROP_DEMAND",
    });

    setProductPickerLoading(false);

    if (!result.success || !result.payload?.chatRoomId) {
      showApiToast(
        { success: false, error: result.error ?? "Failed to start crop-demand chat." },
        {
          successTitle: "Demand selected",
          errorTitle: "Cannot start negotiation",
        },
      );
      return;
    }

    const now = new Date();
    const initialMessage: Message = {
      id: `demand-negotiation-${result.payload.chatRoomId}`,
      sender: "me",
      type: "text",
      status: "sent",
      text: buildDemandNegotiationMessage({
        postId,
        title: demand.title || demand.cropName || "Crop Demand",
        quantity: demand.quantityNeeded
          ? `${demand.quantityNeeded} ${demand.unitType ?? "KG"}`
          : "",
      }),
      createdAt: now.toISOString(),
      time: formatChatTime(now),
    };

    onChatCreated?.({
      ...chat,
      id: result.payload.chatRoomId,
      chatRoomId: result.payload.chatRoomId,
      postId,
      chatType: "CROP_DEMAND",
      isTemporary: false,
      contractId: null,
      orderReadyContractId: null,
      hasContract: false,
      preview: formatChatPreview(
        initialMessage.text ?? "",
        currentUserId,
        "You",
        currentUserId,
      ),
      lastMessage: initialMessage.text,
      lastMessageSenderId: currentUserId,
      lastMessageSenderName: "You",
      time: initialMessage.time,
      lastActivityAt: initialMessage.createdAt,
      crop: {
        cropName: demand.title || demand.cropName || "Crop Demand",
        quantity: demand.quantityNeeded
          ? `${demand.quantityNeeded} ${demand.unitType ?? "KG"}`
          : "-",
        status: demand.status ?? "OPEN",
        estimatedPrice: `${demand.currencyCode === "KHR" ? "៛" : "$"}${Number(demand.maxPricePerUnit ?? 0).toLocaleString()} / ${demand.unitType ?? "KG"}`,
        currencyCode: demand.currencyCode,
        pricePerUnit: demand.maxPricePerUnit,
        imageUrl: getDemandPickerImage(demand),
        category: demand.cropTypeName || demand.cropType || "Crop Demand",
        location: demand.locationPreferences || demand.buyerLocation || "Cambodia",
        unitType: demand.unitType,
      },
      messages: [initialMessage],
    });

    await handleSendMessageRef.current(
      buildLinkedChatNoticeMessage({
        chatRoomId: result.payload.chatRoomId,
        chatType: "CROP_DEMAND",
        title: demand.title || demand.cropName || "Crop Demand",
      }),
    );

    setProductPickerOpen(false);
    router.push(`/chat?chatRoomId=${encodeURIComponent(result.payload.chatRoomId)}`);
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return false;
    if (loading) return false;

    setLoading(true);

    if (!chat.isTemporary && (!socketConnected || !socketRef.current?.connected)) {
      showApiToast(
        { success: false, error: "Chat socket is not connected." },
        {
          successTitle: "Message sent",
          errorTitle: "Chat connection unavailable",
          errorMessage: "Please wait for the chat connection and try again.",
        },
      );

      setLoading(false);
      return false;
    }

    const now = new Date();
    const optimisticMessage: Message = {
      id: `optimistic-${crypto.randomUUID()}`,
      sender: "me",
      type: "text",
      status: "sending",
      text: content,
      createdAt: now.toISOString(),
      time: formatChatTime(now),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    pendingMessageIdsRef.current = [
      ...pendingMessageIdsRef.current,
      optimisticMessage.id,
    ];
    onChatPreviewChange?.(
      buildChatPreviewUpdate(chat, optimisticMessage, undefined, currentUserId)
    );

    // FIRST MESSAGE OF TEMPORARY CHAT
    if (chat.isTemporary) {
      const result = await startChatRoomAction({
        postId: chat.postId,
        alternatePostId: chat.alternatePostId,
        farmerId: chat.farmerId,
        buyerId: chat.buyerId,
        message: content,
        chatType: chat.chatType,
        forceNew: chat.forceNew,
      });

      if (!result.success) {
        console.error(result.error);
        const isIdentityError =
          result.error === IDENTITY_VERIFICATION_REQUIRED_MESSAGE;
        showApiToast(
          { success: false, error: result.error ?? undefined },
          {
            successTitle: "Message sent",
            errorTitle: isIdentityError
              ? "Identity verification required"
              : "Couldn't start chat",
            errorMessage: isIdentityError
              ? "Please verify your identity document before contacting a farmer."
              : "We couldn't start this conversation. Please try again.",
          },
        );

        setMessages((prev) =>
          prev.map((message) =>
            message.id === optimisticMessage.id
              ? { ...message, status: "failed" }
              : message
          )
        );
        pendingMessageIdsRef.current = pendingMessageIdsRef.current.filter(
          (id) => id !== optimisticMessage.id
        );
        setLoading(false);
        return false;
      }

      const realChatRoomId = result.payload?.chatRoomId;

      if (realChatRoomId) {
        const messageWasSent = result.payload?.messageSent !== false;
        if (result.payload?.reusedExistingRoom) {
          showApiToast(
            { success: true },
            {
              successTitle: "Existing chat found",
              successMessage: "We opened your existing chat for this crop.",
            },
          );
        }
        const sentMessage: Message = { ...optimisticMessage, status: "sent" };

        setMessages((prev) => {
          if (!messageWasSent) {
            return prev.filter((message) => message.id !== optimisticMessage.id);
          }

          return prev.map((message) =>
            message.id === optimisticMessage.id ? sentMessage : message
          );
        });
        pendingMessageIdsRef.current = pendingMessageIdsRef.current.filter(
          (id) => id !== optimisticMessage.id
        );

        // Promote the temporary chat into a real one in the sidebar list
        // immediately, so it shows up without waiting for a server refresh.
        const contractId = result.payload?.contractId ?? chat.contractId ?? null;
        const realChat: Chat = messageWasSent
          ? {
              ...buildChatPreviewUpdate(chat, sentMessage, undefined, currentUserId),
              id: realChatRoomId,
              chatRoomId: realChatRoomId,
              contractId,
              hasContract: Boolean(contractId),
              hasActiveContract: Boolean(contractId),
              isTemporary: false,
              messages: [sentMessage],
            }
          : {
              ...chat,
              id: realChatRoomId,
              chatRoomId: realChatRoomId,
              contractId,
              hasContract: Boolean(contractId),
              hasActiveContract: Boolean(contractId),
              isTemporary: false,
              preview: contractId ? "Existing contract" : chat.preview,
              messages: [],
            };
        onChatCreated?.(realChat);

        // Swap the URL to the real room (so reloads/socket target it) but do
        // NOT router.refresh() here: the page is force-dynamic and refreshing
        // re-runs the heavy getChatsService fan-out, which leaves the Next.js
        // "Rendering…" indicator stuck for seconds. The chat is already
        // promoted optimistically via onChatCreated above, and the URL change
        // re-keys ChatDetail so its socket connects to the new room.
        router.replace(`/chat?chatRoomId=${realChatRoomId}`);
      }

      setLoading(false);
      return true;
    }

    // NORMAL MESSAGE OF EXISTING CHAT
    try {
      if (!socketRef.current?.connected) {
        throw new Error("Chat socket disconnected before publish.");
      }

      socketRef.current.publish({
        destination: "/app/chat/send",
        body: JSON.stringify({
          chatRoomId: chat.chatRoomId,
          content,
        }),
      });

      startPendingSendTimeout();
      setTimeout(() => {
        markOptimisticMessageSent(optimisticMessage.id);
      }, 700);
    } catch (error) {
      console.error(error);
      showApiToast(
        { success: false, error: "Failed to send socket message." },
        {
          successTitle: "Message sent",
          errorTitle: "Message failed",
          errorMessage: "The chat socket failed to send your message. Please try again.",
        },
      );

      setMessages((prev) =>
        prev.map((message) =>
          message.id === optimisticMessage.id
            ? { ...message, status: "failed" }
            : message
        )
      );
      pendingMessageIdsRef.current = pendingMessageIdsRef.current.filter(
        (id) => id !== optimisticMessage.id
      );
      setLoading(false);
      return false;
    }

    return true;
  };

  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  });

  // After placing/updating an order or sending a contract, the buyer is
  // redirected here. We store the special card message in sessionStorage so it
  // can be sent through the socket once the chat connection is ready.
  useEffect(() => {
    if (!socketConnected || !chat.chatRoomId || chat.isTemporary) return;
    if (loading) return;

    const keys = [
      `pending_order_message:${chat.chatRoomId}`,
      `pending_contract_message:${chat.chatRoomId}`,
    ];

    if (!keys.some((key) => sessionStorage.getItem(key))) return;

    let cancelled = false;

    const timeoutId = window.setTimeout(async () => {
      const isConnected =
        socketRef.current?.connected || (await waitForSocketConnection(socketRef));

      if (cancelled || !isConnected) return;

      for (const key of keys) {
        const value = sessionStorage.getItem(key);
        if (!value) continue;

        const sent = await handleSendMessageRef.current(value);
        if (sent) {
          sessionStorage.removeItem(key);
        }

        // Give the optimistic send state time to settle before sending the
        // next stored special card.
        await new Promise((resolve) => window.setTimeout(resolve, 900));
      }
    }, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [socketConnected, chat.chatRoomId, chat.isTemporary, loading]);

  const handleSendAttachment = async (file: File) => {
    if (loading) return;

    if (chat.isTemporary) {
      showApiToast(
        { success: false, error: "Please send a text message first." },
        {
          successTitle: "Attachment sent",
          errorTitle: "Start the chat first",
          errorMessage: "Send a message first, then attach files in the created chat room.",
        },
      );
      return;
    }

    const connectedBeforeUpload = await waitForSocketConnection(socketRef);

    if (!socketConnected && !connectedBeforeUpload) {
      showApiToast(
        { success: false, error: "Chat socket is not connected." },
        {
          successTitle: "Attachment sent",
          errorTitle: "Chat connection unavailable",
          errorMessage: "Please wait for the chat connection and try again.",
        },
      );
      return;
    }

    if (!isAllowedAttachment(file)) {
      showApiToast(
        { success: false, error: "Unsupported attachment type." },
        {
          successTitle: "Attachment sent",
          errorTitle: "Unsupported file",
          errorMessage: "Please choose an image, PDF, Word, or Excel file.",
        },
      );
      return;
    }

    setLoading(true);

    const objectUrl = URL.createObjectURL(file);
    const now = new Date();
    const optimisticMessage: Message = {
      id: `optimistic-${crypto.randomUUID()}`,
      sender: "me",
      type: "file",
      status: "sending",
      text: file.name,
      createdAt: now.toISOString(),
      time: formatChatTime(now),
      file: {
        name: file.name,
        size: formatFileSize(file.size),
        type: getChatFileType(file.name, file.type),
        url: objectUrl,
        downloadUrl: objectUrl,
        originalFile: file,
      },
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    pendingMessageIdsRef.current = [
      ...pendingMessageIdsRef.current,
      optimisticMessage.id,
    ];
    onChatPreviewChange?.(
      buildChatPreviewUpdate(chat, optimisticMessage, undefined, currentUserId)
    );

    const formData = new FormData();
    formData.append("file", file);

    const uploadResult = await uploadAttachmentAction(formData);

    if (!uploadResult.success || !uploadResult.fileName) {
      showApiToast(uploadResult, {
        successTitle: "Attachment uploaded",
        errorTitle: "Upload failed",
        errorMessage: uploadResult.error ?? "Failed to upload attachment.",
      });

      setMessages((prev) =>
        prev.map((message) =>
          message.id === optimisticMessage.id
            ? { ...message, status: "failed" }
            : message
        )
      );
      pendingMessageIdsRef.current = pendingMessageIdsRef.current.filter(
        (id) => id !== optimisticMessage.id
      );
      setLoading(false);
      return;
    }

    try {
      const isConnected = await waitForSocketConnection(socketRef);

      if (!isConnected) {
        throw new Error("Chat socket disconnected before publish.");
      }

      const socket = socketRef.current;

      if (!socket) {
        throw new Error("Chat socket disconnected before publish.");
      }

      socket.publish({
        destination: "/app/chat/send",
        body: JSON.stringify({
          chatRoomId: chat.chatRoomId,
          content: file.name,
          fileName: uploadResult.fileName,
          fileSize: file.size,
        }),
      });

      startPendingSendTimeout();
      setTimeout(() => {
        markOptimisticMessageSent(optimisticMessage.id);
      }, 700);
    } catch (error) {
      console.error(error);
      showApiToast(
        { success: false, error: "Failed to send socket attachment." },
        {
          successTitle: "Attachment sent",
          errorTitle: "Message failed",
          errorMessage: "The chat socket failed to send your attachment. Please try again.",
        },
      );

      setMessages((prev) =>
        prev.map((message) =>
          message.id === optimisticMessage.id
            ? { ...message, status: "failed" }
            : message
        )
      );
      pendingMessageIdsRef.current = pendingMessageIdsRef.current.filter(
        (id) => id !== optimisticMessage.id
      );
      setLoading(false);
      return;
    }
  };

  const handleRetryMessage = (message: Message) => {
    if (message.status !== "failed" || loading) return;

    removeFailedMessage(message.id, setMessages);

    if (message.type === "text" && message.text?.trim()) {
      void handleSendMessage(message.text);
      return;
    }

    const originalFile = message.file?.originalFile;

    if (message.type === "file" && originalFile) {
      void handleSendAttachment(originalFile);
      return;
    }

    showApiToast(
      { success: false, error: "This file can no longer be retried." },
      {
        successTitle: "Message sent",
        errorTitle: "Retry unavailable",
        errorMessage: "Please choose the file again and send it.",
      },
    );
  };

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col bg-white">
      <ChatHeader
        role={role}
        chat={chat}
        showContractButton={showContractButton}
        contractButtonLabel={contractButtonLabel}
        contractButtonDisabled={contractButtonDisabled}
        onContractClick={handleContractClick}
        showOrderButton={showOrderButton}
        orderButtonLabel={orderButtonLabel}
        onOrderClick={() => void handleOrderClick()}
        onMobileBack={onMobileBack}
        onToggleProfile={onToggleProfile}
      />

      {/* Mobile action bar: action buttons are hidden in the header on mobile, shown here instead */}
      {(showOrderButton || showContractButton) && (
        <div className="flex items-center gap-2 border-b border-light-grey bg-white px-4 py-2 sm:hidden">
          {showOrderButton && (
            <button
              type="button"
              onClick={handleOrderClick}
              className="flex h-9 flex-1 items-center justify-center gap-2 rounded-full bg-[#F5B02E] text-[13px] font-bold text-primary-heading transition-all hover:bg-[#e5a022] active:scale-[0.98]"
            >
              <ShoppingCart className="h-4 w-4" />
              {orderButtonLabel}
            </button>
          )}
          {showContractButton && (
            <div className="flex-1">
              <ContractButton
                label={contractButtonLabel}
                disabled={contractButtonDisabled}
                variant={contractButtonDisabled ? "outline" : "solid"}
                onClick={handleContractClick}
                fullWidth
              />
            </div>
          )}
        </div>
      )}

      <div
        className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-3 py-5 pb-8"
        onScroll={() => setVisibleMessageTime(null)}
      >
        {visibleMessages.length === 0 && !typingUserName ? (
          <EmptyConversation role={role} name={chat.name} />
        ) : (
          <ChatMessages
            chatRoomId={chat.chatRoomId}
            messages={visibleMessages}
            typingUserName={typingUserName}
            senderAvatar={chat.avatar}
            senderName={chat.name}
            senderProfileHref={getChatProfileHref(role, chat)}
            visibleMessageTimeId={visibleMessageTimeId}
            translationMode={translationMode}
            role={role}
            onRetryMessage={handleRetryMessage}
            onVisibleMessageTimeChange={(messageId) =>
              setVisibleMessageTime(messageId ? { chatId: chat.id, messageId } : null)
            }
          />
        )}
        <div ref={messagesEndRef} className="h-1 scroll-mb-8" />
      </div>

      {!isArchived && (
        <ChatInput
          isArchived={isArchived}
          focusKey={chat.id}
          translationMode={translationMode}
          onTranslationModeChange={(nextMode) => {
            setTranslationModeByChatId((currentValues) => {
              window.localStorage.setItem(
                getChatTranslateStorageKey(chat.id),
                nextMode
              );

              return {
                ...currentValues,
                [chat.id]: nextMode,
              };
            });
          }}
          onSendMessage={handleSendMessage}
          onSendAttachment={handleSendAttachment}
          onTypingChange={handleTypingChange}
          isSending={loading}
          attachmentsEnabled={!chat.isTemporary}
          showTranslation={!chat.isTemporary && messages.length > 0}
        />
      )}

      {isArchived && (
        <div className="flex w-full flex-col gap-3 border-t bg-secondary/95 px-4 py-3 text-primary-heading sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold">
            This chat is archived. You cannot send new messages here.
          </p>
          <button
            type="button"
            onClick={() => {
              router.push(directChatHref);
              router.refresh();
            }}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-primary/90 active:scale-[0.98]"
          >
            Direct Chat
          </button>
        </div>
      )}

      {productPickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6"
          role="presentation"
          onClick={() => setProductPickerOpen(false)}
        >
          <section
            className="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-[#EAECF0] px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-[#101828]">Select Trade Item</h2>
                <p className="text-sm font-medium text-[#667085]">
                  Choose a farmer product for direct order, or your demand for contract flow.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProductPickerOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D0D5DD] text-[#475467] transition hover:bg-[#F9FAFB]"
                aria-label="Close product picker"
              >
                <X size={18} />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <div className="mb-4 grid grid-cols-2 rounded-xl bg-[#F2F4F7] p-1">
                <button
                  type="button"
                  onClick={() => setPickerTab("products")}
                  className={`h-10 rounded-lg text-sm font-bold transition ${
                    pickerTab === "products"
                      ? "bg-white text-primary shadow-xs"
                      : "text-[#667085] hover:text-[#344054]"
                  }`}
                >
                  Farmer Products
                </button>
                <button
                  type="button"
                  onClick={() => setPickerTab("demands")}
                  className={`h-10 rounded-lg text-sm font-bold transition ${
                    pickerTab === "demands"
                      ? "bg-white text-primary shadow-xs"
                      : "text-[#667085] hover:text-[#344054]"
                  }`}
                >
                  My Demands
                </button>
              </div>

              {productPickerLoading ? (
                <div className="flex min-h-48 items-center justify-center text-sm font-semibold text-[#667085]">
                  Loading products...
                </div>
              ) : productPickerError ? (
                <div className="flex min-h-48 items-center justify-center text-center text-sm font-semibold text-red-600">
                  {productPickerError}
                </div>
              ) : pickerTab === "demands" && demandPickerError ? (
                <div className="flex min-h-48 items-center justify-center text-center text-sm font-semibold text-red-600">
                  {demandPickerError}
                </div>
              ) : pickerTab === "products" && farmerProducts.length === 0 ? (
                <div className="flex min-h-48 items-center justify-center text-center text-sm font-semibold text-[#667085]">
                  This farmer has no crop products available.
                </div>
              ) : pickerTab === "demands" && buyerDemands.length === 0 ? (
                <div className="flex min-h-48 items-center justify-center text-center text-sm font-semibold text-[#667085]">
                  You have no open crop demands available for contract.
                </div>
              ) : pickerTab === "products" ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {farmerProducts.map((product) => {
                    const postId =
                      product.postId ||
                      product.post?.postId ||
                      product.cropProductPostId ||
                      product.cropProductId ||
                      "";
                    const title =
                      product.post?.title ||
                      product.title ||
                      product.crop?.cropName ||
                      product.cropName ||
                      "Crop Product";
                    const image = getProductPickerImage(product);
                    const isUnavailable =
                      product.status === "UNAVAILABLE" || Number(product.stockLeft ?? 0) <= 0;
                    const currency = product.currencyCode === "USD" ? "$" : "៛";

                    return (
                      <button
                        key={postId || title}
                        type="button"
                        disabled={isUnavailable}
                        onClick={() => void handleSelectFarmerProduct(product)}
                        className="grid grid-cols-[88px_1fr] gap-3 rounded-xl border border-[#EAECF0] bg-white p-3 text-left transition hover:border-primary hover:bg-[#F8FFFB] disabled:cursor-not-allowed disabled:opacity-55"
                      >
                        <div className="relative h-22 w-22 overflow-hidden rounded-lg bg-[#F2F4F7]">
                          <Image
                            src={image}
                            alt={title}
                            fill
                            sizes="88px"
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-[#101828]">
                            {title}
                          </h3>
                          <p className="mt-1 text-xs font-semibold text-[#667085]">
                            {product.cropTypeName || product.cropType || "Crop"}
                          </p>
                          <p className="mt-2 text-sm font-extrabold text-primary">
                            {currency}
                            {Number(product.pricePerUnit ?? 0).toLocaleString()}
                            <span className="text-xs font-medium text-[#667085]">
                              /{product.unitType ?? "KG"}
                            </span>
                          </p>
                          <p className="mt-1 text-xs font-medium text-[#667085]">
                            Stock: {Number(product.stockLeft ?? 0).toLocaleString()}{" "}
                            {product.unitType ?? "KG"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {buyerDemands.map((demand) => {
                    const postId = demand.postId || demand.cropDemandPostId || "";
                    const title = demand.title || demand.cropName || "Crop Demand";
                    const image = getDemandPickerImage(demand);
                    const isClosed = demand.status === "CLOSED";
                    const currency = demand.currencyCode === "USD" ? "$" : "៛";

                    return (
                      <button
                        key={postId || title}
                        type="button"
                        disabled={isClosed}
                        onClick={() => void handleSelectBuyerDemand(demand)}
                        className="grid grid-cols-[88px_1fr] gap-3 rounded-xl border border-[#EAECF0] bg-white p-3 text-left transition hover:border-primary hover:bg-[#F8FFFB] disabled:cursor-not-allowed disabled:opacity-55"
                      >
                        <div className="relative h-22 w-22 overflow-hidden rounded-lg bg-[#F2F4F7]">
                          <Image
                            src={image}
                            alt={title}
                            fill
                            sizes="88px"
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-[#101828]">
                            {title}
                          </h3>
                          <p className="mt-1 text-xs font-semibold text-[#667085]">
                            {demand.cropTypeName || demand.cropType || "Crop Demand"}
                          </p>
                          <p className="mt-2 text-sm font-extrabold text-primary">
                            {currency}
                            {Number(demand.maxPricePerUnit ?? 0).toLocaleString()}
                            <span className="text-xs font-medium text-[#667085]">
                              /{demand.unitType ?? "KG"}
                            </span>
                          </p>
                          <p className="mt-1 text-xs font-medium text-[#667085]">
                            Need: {Number(demand.quantityNeeded ?? 0).toLocaleString()}{" "}
                            {demand.unitType ?? "KG"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

    </div>
  );
}

function getChatTranslateStorageKey(chatId: string) {
  return `${CHAT_TRANSLATE_STORAGE_PREFIX}.${chatId}`;
}

function buildLinkedChatNoticeMessage({
  chatRoomId,
  chatType,
  title,
}: {
  chatRoomId: string;
  chatType: Chat["chatType"];
  title: string;
}) {
  return [
    `LINKED_CHAT_ROOM:${chatRoomId}`,
    `TYPE:${chatType}`,
    `TITLE:${title.replace(/\s+/g, " ").trim()}`,
  ].join("\n");
}

function getLinkedDirectChatRoomId(messages: Message[]) {
  for (const message of [...messages].reverse()) {
    const text = message.text ?? "";
    const lines = text.split("\n").map((line) => line.trim());
    const firstLine = lines[0] ?? "";
    if (!firstLine.startsWith("LINKED_CHAT_ROOM:")) continue;

    const chatRoomId = firstLine.replace("LINKED_CHAT_ROOM:", "").trim();
    const chatType =
      lines.find((line) => line.startsWith("TYPE:"))?.replace("TYPE:", "").trim() ?? "";

    if (chatRoomId && chatType === "DIRECT") return chatRoomId;
  }

  return null;
}

function buildContractRequestMessage({
  contractId,
  cropName,
  farmerName,
}: {
  contractId: string;
  cropName: string;
  farmerName: string;
}) {
  return [
    `CONTRACT_REQUEST:${contractId}`,
    `crop:${cropName.replace(/\s+/g, " ").trim() || "Crop Demand"}`,
    `farmer:${farmerName.replace(/\s+/g, " ").trim() || "Farmer"}`,
  ].join("\n");
}

function buildDemandNegotiationMessage({
  postId,
  title,
  quantity,
}: {
  postId: string;
  title: string;
  quantity?: string;
}) {
  return [
    `DEMAND_NEGOTIATION:${postId}`,
    `TITLE:${title.replace(/\s+/g, " ").trim()}`,
    `QTY:${quantity?.replace(/\s+/g, " ").trim() ?? ""}`,
  ].join("\n");
}

function getLegacyChatTranslateStorageKey(chatId: string) {
  return `${LEGACY_CHAT_TRANSLATE_STORAGE_PREFIX}.${chatId}`;
}

function getChatProfileHref(role: UserRole, chat: Chat) {
  if (role === "FARMER") {
    return `/other-profile/${chat.buyerId}`;
  }

  if (role === "BUYER") {
    return `/other-profile/farmer/${chat.farmerId}`;
  }

  return `/other-profile/${chat.id}`;
}

function getStoredChatTranslationMode(chatId: string): ChatTranslationMode {
  if (typeof window === "undefined") return "original";

  const storedValue = window.localStorage.getItem(getChatTranslateStorageKey(chatId));

  if (storedValue === "original" || storedValue === "auto") {
    return storedValue;
  }

  if (storedValue === "kh" || storedValue === "eng") {
    return "auto";
  }

  return window.localStorage.getItem(getLegacyChatTranslateStorageKey(chatId)) === "true"
    ? "auto"
    : "original";
}

function mapSocketMessage(
  socketMessage: ChatSocketMessage,
  currentUserId: string
): Message | null {
  const content = socketMessage.content?.trim();
  const fileName = socketMessage.fileName?.trim();
  const displayName = content || fileName;

  if (!content && !fileName) return null;

  return {
    id: socketMessage.chatMessageId ?? crypto.randomUUID(),
    sender: socketMessage.senderId === currentUserId ? "me" : "other",
    type: fileName ? "file" : "text",
    text: content,
    time: formatChatTime(socketMessage.createdAt ?? new Date()),
    createdAt: socketMessage.createdAt ?? new Date().toISOString(),
    senderProfileUrl: socketMessage.senderProfileUrl ?? null,
    file: fileName
      ? {
          name: displayName ?? fileName,
          storedName: fileName,
          size: socketMessage.fileSize ?? "",
          type: getChatFileType(displayName ?? fileName),
          url: getAttachmentUrl(fileName),
          downloadUrl: getAttachmentDownloadUrl(fileName),
        }
      : undefined,
  };
}

function removeFailedMessage(
  messageId: string,
  setMessages: (value: Message[] | ((messages: Message[]) => Message[])) => void
) {
  setMessages((prev) => prev.filter((message) => message.id !== messageId));
}

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function getChatFileType(fileName: string, mimeType?: string | null) {
  const extension = getFileExtension(fileName);

  if (mimeType?.startsWith("image/") || ["png", "jpg", "jpeg", "webp", "gif"].includes(extension)) {
    return "image";
  }

  if (extension === "pdf" || mimeType === "application/pdf") {
    return "pdf";
  }

  if (["xls", "xlsx"].includes(extension) || mimeType?.includes("spreadsheet") || mimeType?.includes("excel")) {
    return "xlsx";
  }

  return "doc";
}

function notifyChatRoomRead(chatRoomId: string) {
  const payload = {
    chatRoomId,
    eventAt: Date.now(),
  };

  window.dispatchEvent(new CustomEvent(CHAT_ROOM_READ_EVENT, { detail: payload }));

  try {
    localStorage.setItem(CHAT_ROOM_READ_EVENT, JSON.stringify(payload));
  } catch {
    // Storage may be unavailable; the same-tab event already fired.
  }
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAllowedAttachment(file: File) {
  const extension = getFileExtension(file.name);
  const allowedExtensions = [
    "png",
    "jpg",
    "jpeg",
    "webp",
    "gif",
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
  ];

  return allowedExtensions.includes(extension);
}

function getProductPickerImage(product: CropProductPost) {
  const source = product as CropProductPost & {
    images?: string | string[];
    post?: CropProductPost["post"] & {
      imageUrls?: string | string[];
      thumbnailUrl?: string | string[];
    };
  };

  const candidates = [
    source.imageUrls,
    source.thumbnailUrl,
    source.images,
    source.post?.images,
    source.post?.imageUrls,
    source.post?.thumbnailUrl,
  ].flatMap((value) => (Array.isArray(value) ? value : value ? [value] : []));

  for (const candidate of candidates) {
    const value = candidate.trim();

    if (!value || value === FALLBACK_PRODUCT_IMAGE) continue;

    const uploadUrl = getFileUrl(value);
    if (uploadUrl) return uploadUrl;

    const normalizedUrl = getCropProductImages(value)[0];
    if (normalizedUrl && normalizedUrl !== FALLBACK_PRODUCT_IMAGE) {
      return normalizedUrl;
    }
  }

  return FALLBACK_PRODUCT_IMAGE;
}

function getDemandPickerImage(demand: CropDemandPost) {
  const source = demand as CropDemandPost & {
    images?: unknown;
    postImages?: unknown;
    post?: {
      images?: unknown;
      imageUrls?: unknown;
      thumbnailUrl?: unknown;
    };
  };
  const candidates = [
    source.imageUrls,
    source.thumbnailUrl,
    source.images,
    source.postImages,
    source.post?.images,
    source.post?.imageUrls,
    source.post?.thumbnailUrl,
  ].flatMap(extractImageCandidates);

  for (const candidate of candidates) {
    const value = candidate.trim();

    if (!value || value === FALLBACK_PRODUCT_IMAGE || value === FALLBACK_DEMAND_IMAGE) {
      continue;
    }

    const uploadUrl = getFileUrl(value);
    if (uploadUrl) return uploadUrl;

    const normalizedUrl = getCropProductImages(value)[0];
    if (normalizedUrl && normalizedUrl !== FALLBACK_PRODUCT_IMAGE) {
      return normalizedUrl;
    }
  }

  return FALLBACK_DEMAND_IMAGE;
}

function extractImageCandidates(value: unknown): string[] {
  if (!value) return [];

  if (typeof value === "string") return [value];

  if (Array.isArray(value)) {
    return value.flatMap(extractImageCandidates);
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    return [
      record.imageUrl,
      record.image_url,
      record.url,
      record.fileName,
      record.file_name,
      record.name,
    ].flatMap(extractImageCandidates);
  }

  return [];
}

function waitForSocketConnection(
  socketRef: RefObject<ReturnType<typeof createChatRoomSocket> | null>,
  timeoutMs = 5000
) {
  if (socketRef.current?.connected) {
    return Promise.resolve(true);
  }

  return new Promise<boolean>((resolve) => {
    const startedAt = Date.now();
    const interval = setInterval(() => {
      if (socketRef.current?.connected) {
        clearInterval(interval);
        resolve(true);
        return;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        clearInterval(interval);
        resolve(false);
      }
    }, 100);
  });
}

function buildChatPreviewUpdate(
  chat: Chat,
  message: Message,
  socketMessage?: ChatSocketMessage,
  currentUserId?: string
): Chat {
  const previewMessage = formatChatPreviewMessage(message, socketMessage);
  const isFromReceiver =
    socketMessage?.senderId && currentUserId
      ? socketMessage.senderId !== currentUserId
      : false;

  return {
    ...chat,
    preview: formatChatPreview(
      previewMessage,
      socketMessage?.senderId ?? (message.sender === "me" ? currentUserId : null),
      socketMessage?.senderName ?? chat.name,
      currentUserId
    ),
    lastMessage: previewMessage,
    lastMessageSenderId:
      socketMessage?.senderId ?? (message.sender === "me" ? currentUserId : null),
    lastMessageSenderName:
      socketMessage?.senderName ?? (message.sender === "me" ? "You" : chat.name),
    time: message.time,
    lastActivityAt:
      socketMessage?.createdAt ?? message.createdAt ?? new Date().toISOString(),
    location:
      isFromReceiver && socketMessage?.senderLocation
        ? socketMessage.senderLocation
        : chat.location,
  };
}

function formatChatPreviewMessage(
  message: Message,
  socketMessage?: ChatSocketMessage
) {
  if (message.type !== "file") {
    return message.text ? formatCardMessageLabel(message.text) : "No messages yet";
  }

  const fileType =
    message.file?.type ??
    getChatFileType(socketMessage?.content || socketMessage?.fileName || "");

  return fileType === "image" ? "sent a photo" : "sent a file";
}

function formatChatPreview(
  message: string,
  senderId?: string | null,
  senderName?: string | null,
  currentUserId?: string
) {
  if (!message) return "No messages yet";

  const prefix = senderId && currentUserId && senderId === currentUserId
    ? "You"
    : senderName;

  if (message === "sent a photo" || message === "sent a file") {
    return prefix ? `${prefix}: ${message}` : message;
  }

  return prefix ? `${prefix}: ${message}` : message;
}
