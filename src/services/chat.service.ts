import headerToken from "@/lib/headerToken";
import type {
    Chat,
    ChatFile,
    ChatParticipantProfile,
    CropDetail,
    Message,
    UserRole,
} from "@/app/chat/_types/chat";
import { formatCardMessageLabel } from "@/app/chat/_utils/cardMessagePreview";
import { formatChatTime } from "@/app/chat/_utils/formatChatTime";
import type { FarmerReview } from "@/types/rankingView";
import type { UserProfilePayload } from "@/types/user";
import { apiBaseUrl } from "@/utils/apiBaseUrl";
import {
    getAttachmentDownloadUrl,
    getAttachmentUrl,
} from "@/utils/getAttachmentUrl";

type ChatRoomApiItem = {
    chatRoomId: string;
    chatType: "CROP_PRODUCT" | "CROP_DEMAND" | "DIRECT";
    isArchived: boolean;
    postId: string;
    contractId?: string | null;

    farmerName: string | null;
    farmerProfileUrl: string | null;
    farmerLocation: string | null;
    farmerOnline?: boolean | null;
    buyerName: string | null;
    buyerProfileUrl: string | null;
    buyerLocation: string | null;
    buyerOnline?: boolean | null;

    lastMessage: string | null;
    lastMessageSenderId: string | null;
    lastMessageSenderName: string | null;
    lastMessageAt: string | null;
    unreadCount?: number | null;
    createdAt: string;

    farmerId: string;
    buyerId: string;
};

type ChatMessageApiItem = {
    chatRoomId: string;
    chatMessageId: string;
    senderId: string;
    senderProfileUrl?: string | null;
    content: string;
    fileName: string | null;
    fileSize: string | null;
    createdAt: string;
};

type PostDetailResult = {
    createdBy: string;
    crop: CropDetail;
};

type CropPostApiPayload = Record<string, unknown> & {
    crop?: Record<string, unknown>;
    post?: Record<string, unknown>;
};

type ReviewPayload = FarmerReview[] | {
    items?: FarmerReview[];
    content?: FarmerReview[];
    data?: FarmerReview[];
    results?: FarmerReview[];
};

async function apiGet<T>(url: string): Promise<T | null> {
    try {
        const headers = await headerToken();

        const res = await fetch(url, {
            cache: "no-store",
            headers,
        });

        if (!res.ok) return null;

        const data = await res.json();
        return data.payload;
    } catch (error) {
        console.error("Chat API fetch failed:", url, error);
        return null;
    }
}

function asNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) return value;

    if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function extractReviews(payload: ReviewPayload | null): FarmerReview[] {
    if (Array.isArray(payload)) return payload;
    if (!payload) return [];

    return payload.items ?? payload.content ?? payload.data ?? payload.results ?? [];
}

async function getReviewsSummaryByUserId(
    userId: string,
    role: "farmer" | "buyer"
) {
    const payload = await apiGet<ReviewPayload>(
        `${apiBaseUrl}/reviews/users/${userId}/${role}`
    );
    const reviews = extractReviews(payload);

    if (reviews.length === 0) {
        return {
            averageRating: null,
            reviewCount: 0,
        };
    }

    const total = reviews.reduce(
        (sum, review) => sum + (asNumber(review.overallRating) ?? 0),
        0
    );

    return {
        averageRating: total / reviews.length,
        reviewCount: reviews.length,
    };
}

async function getParticipantProfile(
    userId: string,
    role: "farmer" | "buyer"
): Promise<ChatParticipantProfile | undefined> {
    const [profile, reviewsSummary] = await Promise.all([
        apiGet<UserProfilePayload>(`${apiBaseUrl}/profile/${userId}`),
        getReviewsSummaryByUserId(userId, role),
    ]);

    if (!profile && reviewsSummary.reviewCount === 0) return undefined;

    return {
        fullName: profile?.personalInfo?.fullName ?? null,
        profileUrl: profile?.basicInfo?.profileUrl ?? null,
        // Mirrors the chat-room API's farmer_location (fp.farm_location) so the
        // pre-start temporary chat shows the same location as the real chat.
        location: profile?.personalInfo?.farmLocation ?? null,
        bio: profile?.basicInfo?.bio,
        joinedAt: profile?.basicInfo?.createdAt ?? null,
        isVerifiedIdentity: profile?.basicInfo?.isVerifiedIdentity,
        trustScore: asNumber(profile?.personalInfo?.trustScore),
        trustLevel: profile?.personalInfo?.trustLevel ?? null,
        medalType: profile?.personalInfo?.medalType ?? null,
        farmName: profile?.personalInfo?.farmName ?? null,
        farmSize: profile?.personalInfo?.farmSize ?? null,
        businessName: profile?.personalInfo?.businessName ?? null,
        businessType: profile?.personalInfo?.businessType ?? null,
        averageRating: reviewsSummary.averageRating,
        reviewCount: reviewsSummary.reviewCount,
    };
}

export async function getUserFullNameService(
    userId: string
): Promise<string | null> {
    if (!userId) return null;

    const profile = await apiGet<UserProfilePayload>(
        `${apiBaseUrl}/profile/${userId}`
    );

    return profile?.personalInfo?.fullName?.trim() || null;
}


export async function getChatParticipantDetailsService(
    participantId: string,
    participantRole: "farmer" | "buyer",
    postId: string,
    chatType: "CROP_PRODUCT" | "CROP_DEMAND" | "DIRECT"
): Promise<{ profile?: ChatParticipantProfile; crop?: CropDetail }> {
    const [profile, postDetail] = await Promise.all([
        getParticipantProfile(participantId, participantRole),
        getCropDetailByPostId(postId, chatType),
    ]);

    return { profile, crop: postDetail?.crop };
}

export async function getChatRoomsService(): Promise<ChatRoomApiItem[]> {
    const data = await apiGet<{ items: ChatRoomApiItem[] }>(
        `${apiBaseUrl}/chat-rooms`
    );

    return data?.items ?? [];
}

export async function getChatMessagesService(
    chatRoomId: string
): Promise<ChatMessageApiItem[]> {
    const data = await apiGet<{ items: ChatMessageApiItem[] }>(
        `${apiBaseUrl}/chat-rooms/${chatRoomId}/messages`
    );

    return data?.items ?? [];
}

function asString(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
}

function formatCropPrice(price: unknown, currencyCode: unknown, unitType: string) {
    if (price == null) return "-";

    const symbol = currencyCode === "KHR" ? "៛" : "$";

    return `${symbol}${price} / ${unitType}`;
}

function firstString(value: unknown): string | null {
    return Array.isArray(value) && typeof value[0] === "string"
        ? value[0]
        : null;
}

function firstRecord(value: unknown): Record<string, unknown> | null {
    return Array.isArray(value) && value[0] && typeof value[0] === "object"
        ? (value[0] as Record<string, unknown>)
        : null;
}

async function getCropDetailByPostId(
    postId: string,
    chatType: "CROP_PRODUCT" | "CROP_DEMAND" | "DIRECT"
): Promise<PostDetailResult | undefined> {
    if (chatType === "DIRECT") return undefined;

    const base =
        chatType === "CROP_PRODUCT" ? "crop-products" : "crop-demands";

    let payload =
        (await apiGet<CropPostApiPayload>(`${apiBaseUrl}/${base}/post/${postId}`)) ??
        (await apiGet<CropPostApiPayload>(`${apiBaseUrl}/${base}/${postId}`));

    if (!payload) {
        const listData = await apiGet<{ items: CropPostApiPayload[] }>(
            `${apiBaseUrl}/${base}?page=1&size=100`
        );

        payload =
            listData?.items.find(
                (item) =>
                    item.postId === postId ||
                    item.cropProductPostId === postId ||
                    item.cropDemandPostId === postId
            ) ?? null;
    }

    if (!payload) return undefined;

    const cropProduct = isObject(payload.cropProduct)
        ? payload.cropProduct
        : undefined;
    const crop = isObject(payload.crop) ? payload.crop : undefined;
    const nestedCrop = isObject(cropProduct?.crop) ? cropProduct.crop : undefined;

    const imageRecord = firstRecord(payload.imageUrls) ?? firstRecord(payload.images);
    const imageUrl =
        firstString(payload.imageUrls) ??
        firstString(payload.post?.images) ??
        firstString(payload.images) ??
        asString(imageRecord?.url) ??
        asString(imageRecord?.imageUrl) ??
        asString(imageRecord?.fileUrl) ??
        null;

    const cropName =
        asString(payload.cropName) ??
        asString(payload.title) ??
        asString(crop?.cropName) ??
        asString(nestedCrop?.cropName) ??
        "Unknown Crop";

    const quantityValue =
        payload.totalQuantity ??
        cropProduct?.totalQuantity ??
        payload.quantityNeeded ??
        payload.stockLeft ??
        cropProduct?.stockLeft ??
        "-";

    const unitType = asString(payload.unitType) ?? asString(cropProduct?.unitType) ?? "";

    const status =
        payload.status === "AVAILABLE"
            ? "AVAILABLE"
            : payload.status === "OPEN"
                ? "OPEN"
                : payload.status === "MATCHED"
                    ? "MATCHED"
                    : asString(payload.status) ?? "-";

    const price =
        payload.pricePerUnit ??
        cropProduct?.pricePerUnit ??
        payload.maxPricePerUnit ??
        payload.currentPrice ??
        null;
    const currencyCode =
        asString(payload.currencyCode) ?? asString(cropProduct?.currencyCode) ?? "USD";

    return {
        createdBy: asString(payload.createdBy) ?? "",
        crop: {
            cropName,
            quantity: `${quantityValue} ${unitType}`,
            status,
            estimatedPrice: formatCropPrice(price, currencyCode, unitType),
            currencyCode,
            pricePerUnit: asNumber(price),
            imageUrl,
            category:
                asString(payload.cropTypeName) ??
                asString(payload.cropType) ??
                asString(crop?.cropTypeName) ??
                asString(nestedCrop?.cropTypeName) ??
                "CROP",
            location:
                asString(payload.location) ??
                asString(payload.locationPreferences) ??
                "Cambodia",
            unitType,
        },
    };
}

function formatLastMessagePreview(
    message: string | null,
    senderId: string | null,
    senderName: string | null,
    currentUserId: string,
    fileName?: string | null
) {
    const prefix = senderId === currentUserId ? "You" : senderName;

    if (fileName) {
        const fileType = getChatFileType(message || fileName);
        const attachmentMessage =
            fileType === "image" ? "sent a photo" : "sent a file";

        return prefix ? `${prefix}: ${attachmentMessage}` : attachmentMessage;
    }

    if (!message) return "No messages yet";

    const label = formatCardMessageLabel(message);

    return prefix ? `${prefix}: ${label}` : label;
}

function getParticipantName(name: string | null | undefined, fallback: string) {
    const trimmedName = name?.trim();
    return trimmedName ? trimmedName : fallback;
}

function getFileExtension(fileName: string) {
    return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function getChatFileType(
    fileName: string,
    mimeType?: string | null
): ChatFile["type"] {
    const extension = getFileExtension(fileName);

    if (
        mimeType?.startsWith("image/") ||
        ["png", "jpg", "jpeg", "webp", "gif"].includes(extension)
    ) {
        return "image";
    }

    if (extension === "pdf" || mimeType === "application/pdf") {
        return "pdf";
    }

    if (
        ["xls", "xlsx"].includes(extension) ||
        mimeType?.includes("spreadsheet") ||
        mimeType?.includes("excel")
    ) {
        return "xlsx";
    }

    return "doc";
}

function mapMessages(
    messages: ChatMessageApiItem[],
    currentUserId: string
): Message[] {
    return messages.map((message) => ({
        id: message.chatMessageId,
        sender: message.senderId === currentUserId ? "me" : "other",
        type: message.fileName ? "file" : "text",
        text: message.content,
        time: formatChatTime(message.createdAt),
        createdAt: message.createdAt,
        senderProfileUrl: message.senderProfileUrl ?? null,
        file: message.fileName
            ? {
                name: message.content || message.fileName,
                storedName: message.fileName,
                size: message.fileSize ?? "",
                type: getChatFileType(message.content || message.fileName),
                url: getAttachmentUrl(message.fileName),
                downloadUrl: getAttachmentDownloadUrl(message.fileName),
            }
            : undefined,
    }));
}

export async function getChatsService(
    role: UserRole,
    currentUserId: string
): Promise<Chat[]> {
    const rooms = await getChatRoomsService();

    return Promise.all(
        rooms.map(async (room) => {
            const isFarmer = role === "FARMER";
            const participantRole = isFarmer ? "buyer" : "farmer";
            const participantId = isFarmer ? room.buyerId : room.farmerId;
            const [messages, postDetail, participantProfile] = await Promise.all([
                getChatMessagesService(room.chatRoomId),
                getCropDetailByPostId(room.postId, room.chatType),
                getParticipantProfile(participantId, participantRole),
            ]);

            const latestMessage = messages[messages.length - 1];
            const participantName = getParticipantName(
                participantProfile?.fullName ??
                    (isFarmer ? room.buyerName : room.farmerName),
                isFarmer ? "Buyer" : "Farmer"
            );

            return {
                id: room.chatRoomId,
                chatRoomId: room.chatRoomId,
                postId: room.postId,

                // IMPORTANT: this is for View Contract button
                contractId: room.contractId ?? null,

                postOwnerId: postDetail?.createdBy,
                postOwnerRole: room.chatType === "CROP_PRODUCT" ? "farmer" : "buyer",

                role: isFarmer ? "farmer" : "buyer",
                chatType: room.chatType,

                name: participantName,
                location: isFarmer ? room.buyerLocation ?? "" : room.farmerLocation ?? "",
                avatar:
                    (isFarmer ? room.buyerProfileUrl : room.farmerProfileUrl) ??
                    "/assets/nav-bar/profile.png",

                preview: formatLastMessagePreview(
                    room.lastMessage,
                    room.lastMessageSenderId,
                    room.lastMessageSenderName,
                    currentUserId,
                    latestMessage?.fileName
                ),
                lastMessage: room.lastMessage,
                lastMessageSenderId: room.lastMessageSenderId,
                lastMessageSenderName: room.lastMessageSenderName,
                time: formatChatTime(room.lastMessageAt ?? room.createdAt),
                lastActivityAt: room.lastMessageAt ?? room.createdAt,
                unreadCount: room.unreadCount ?? 0,

                status: room.isArchived ? "archived" : "active",
                online: isFarmer
                    ? Boolean(room.buyerOnline)
                    : Boolean(room.farmerOnline),
                profile: participantProfile,
                crop: postDetail?.crop,

                messages: mapMessages(messages, currentUserId),

                farmerId: room.farmerId,
                buyerId: room.buyerId,
            } satisfies Chat;
        })
    );
}
