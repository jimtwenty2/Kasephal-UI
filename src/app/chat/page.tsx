import { auth } from "@/auth";
import { getChatParticipantDetailsService, getChatsService } from "@/services/chat.service";
import {
    getAcceptedContractMapService,
    getActiveContractRoomIdsService,
    getContractMapService,
    getDealContractRoomIdsService,
} from "@/services/contract.service";
import { getOrdersService, type Order } from "@/services/order.service";
import { redirect } from "next/navigation";
import ChatPage from "./_components/ChatPage";
import type { Chat, ChatType, UserRole } from "./_types/chat";

export const dynamic = "force-dynamic";

type PageProps = {
    searchParams: Promise<{
        new?: string;
        postId?: string;
        farmerId?: string;
        farmerName?: string;
        farmerLocation?: string;
        buyerId?: string;
        buyerName?: string;
        buyerLocation?: string;
        chatType?: ChatType;
        chatRoomId?: string;
        contractId?: string;
        alternatePostId?: string;
    }>;
};

export default async function Page({ searchParams }: PageProps) {
    const session = await auth();

    const role = (session?.user?.role?.toUpperCase() ?? "BUYER") as UserRole;
    const currentUserId = session?.user?.userId ?? "";

    const params = await searchParams;

    const [
        baseChats,
        contractMap,
        acceptedContractMap,
        dealContractRoomIds,
        activeContractRoomIds,
        buyerOrders,
    ] = await Promise.all([
        getChatsService(role, currentUserId),
        getContractMapService(),
        getAcceptedContractMapService(),
        getDealContractRoomIdsService(),
        getActiveContractRoomIdsService(),
        // Only buyers can place orders, and the Order button is buyer-only, so
        // skip the orders fetch for other roles.
        role === "BUYER" ? getOrdersService() : Promise.resolve<Order[]>([]),
    ]);

    // Chat rooms that already have an order, used to hide the Order button once
    // the buyer has placed an order in that room.
    const orderRoomIds = new Set<string>();
    for (const order of buyerOrders) {
        if (order.chatRoomId) orderRoomIds.add(order.chatRoomId);
    }

    // GET /contracts is the source of truth for "this chat has a contract".
    // Fall back to the contractId already resolved from the chat-rooms endpoint.
    const chats = baseChats.map((chat) => {
        const routeContractId =
            params.contractId && params.chatRoomId === chat.chatRoomId
                ? params.contractId
                : null;
        const contractId =
            routeContractId ?? contractMap.get(chat.chatRoomId) ?? chat.contractId ?? null;
        const orderReadyContractId = acceptedContractMap.get(chat.chatRoomId) ?? null;

        return {
            ...chat,
            contractId,
            orderReadyContractId,
            hasContract: Boolean(contractId),
            hasActiveContract: chat.chatRoomId
                ? activeContractRoomIds.has(chat.chatRoomId)
                : false,
            hasOrder: chat.chatRoomId
                ? orderRoomIds.has(chat.chatRoomId)
                : false,
        };
    });

    const isOpeningChatByTarget =
        !params.chatRoomId &&
        Boolean(params.chatType) &&
        (params.chatType === "DIRECT" || Boolean(params.postId)) &&
        Boolean(params.farmerId || params.buyerId);
    const isStartingNewChat = params.new === "true" || isOpeningChatByTarget;
    const reusableChats = isStartingNewChat
        ? chats.filter((chat) => chat.status !== "archived")
        : chats;

    const existingChat = reusableChats.find((chat) => {
        if (params.chatType === "DIRECT") {
            return (
                chat.chatType === "DIRECT" &&
                (!params.farmerId || chat.farmerId === params.farmerId) &&
                (!params.buyerId || chat.buyerId === params.buyerId)
            );
        }

        const postMatches =
            chat.postId === params.postId ||
            (Boolean(params.alternatePostId) && chat.postId === params.alternatePostId);

        // A crop-demand room that already has any contract belongs to that
        // negotiation, even if pending or rejected. Start a fresh room for
        // another negotiation on the same demand.
        if (
            params.chatType === "CROP_DEMAND" &&
            chat.chatRoomId &&
            dealContractRoomIds.has(chat.chatRoomId)
        ) {
            return false;
        }

        return (
            postMatches &&
            chat.farmerId === params.farmerId &&
            chat.chatType === params.chatType
        );
    });

    let finalChats: Chat[] = chats;

    if (isStartingNewChat && existingChat?.chatRoomId) {
        redirect(`/chat?chatRoomId=${existingChat.chatRoomId}`);
    }

    const shouldCreateTemporaryChat =
        isStartingNewChat &&
        !params.chatRoomId &&
        !existingChat &&
        params.chatType &&
        (params.chatType === "DIRECT" || params.postId) &&
        (params.farmerId || params.buyerId);

    if (shouldCreateTemporaryChat) {
        const isFarmer = role === "FARMER";
        const farmerId = params.farmerId ?? (isFarmer ? currentUserId : "");
        const buyerId = params.buyerId ?? (isFarmer ? "" : currentUserId);

        // Fetch the participant's real profile (and crop details for a post
        // chat) so the right-side panel shows the farmer's info and location
        // even before the chat room is created on the server.
        const participantId = isFarmer ? buyerId : farmerId;
        const participantRole = isFarmer ? "buyer" : "farmer";
        const { profile: participantProfile, crop: participantCrop } =
            await getChatParticipantDetailsService(
                participantId,
                participantRole,
                params.postId ?? "",
                params.chatType!
            );

        // Prefer the participant's actual full name over the post's
        // farmer/buyer name param, which can carry a farm/business name.
        const participantName =
            participantProfile?.fullName?.trim() ||
            (isFarmer
                ? params.buyerName ?? "Buyer"
                : params.farmerName ?? "Farmer");
        const participantLocation =
            (isFarmer ? params.buyerLocation : params.farmerLocation) ??
            participantProfile?.location ??
            participantCrop?.location;

        const temporaryChat: Chat = {
            id: `temp-${params.chatType}-${params.postId ?? "direct"}-${farmerId || buyerId}`,
            chatRoomId: "",
            postId: params.postId ?? "",
            alternatePostId: params.alternatePostId,
            farmerId,
            buyerId,
            role: isFarmer ? "farmer" : "buyer",
            chatType: params.chatType!,
            name: participantName,
            location: participantLocation ?? "",
            avatar:
                participantProfile?.profileUrl ?? "/assets/nav-bar/profile.png",
            preview: "Start a new conversation",
            time: "",
            status: "active",
            contractId: null,
            orderReadyContractId: null,
            hasContract: false,
            profile: participantProfile,
            crop:
                params.chatType === "DIRECT"
                    ? undefined
                    : participantCrop ?? {
                          cropName:
                              params.chatType === "CROP_DEMAND"
                                  ? "Crop Demand"
                                  : "Crop Product",
                          quantity: "-",
                          status: params.chatType === "CROP_DEMAND" ? "Open" : "Available",
                          estimatedPrice: "-",
                      },
            messages: [],
            isTemporary: true,
            forceNew: true,
        };

        finalChats = [temporaryChat, ...chats];
    }

    return <ChatPage role={role} chats={finalChats} />;
}
