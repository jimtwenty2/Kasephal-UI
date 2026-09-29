export type UserRole = "BUYER" | "FARMER" | "GOVERNMENT" | "ADMIN";

export type ChatRole = "buyer" | "farmer" | "government";

export type ChatStatus = "active" | "archived";

export type ChatType = "CROP_PRODUCT" | "CROP_DEMAND" | "DIRECT";

export type MessageType = "text" | "file";

export type ChatTranslationMode = "original" | "auto" | "kh" | "eng";

export type ChatFile = {
    name: string;
    storedName?: string;
    size: string;
    type: "image" | "pdf" | "xlsx" | "doc";
    url?: string;
    downloadUrl?: string;
    originalFile?: File;
};

export type Message = {
    id: string;
    sender: "me" | "other";
    type: MessageType;
    status?: "sending" | "sent" | "failed";
    text?: string;
    time: string;
    createdAt?: string;
    senderProfileUrl?: string | null;
    file?: ChatFile;
};

export type CropDetail = {
    cropName: string;
    quantity: string;
    status: string;
    estimatedPrice: string;
    currencyCode?: string;
    pricePerUnit?: number | null;
    imageUrl?: string | null;
    category?: string;
    location?: string;
    unitType?: string;
};

export type ChatParticipantProfile = {
    fullName?: string | null;
    profileUrl?: string | null;
    location?: string | null;
    bio?: string;
    joinedAt?: string | null;
    isVerifiedIdentity?: boolean;
    trustScore?: number | null;
    trustLevel?: string | null;
    medalType?: string | null;
    farmName?: string | null;
    farmSize?: number | null;
    businessName?: string | null;
    businessType?: string | null;
    averageRating?: number | null;
    reviewCount?: number;
};

export type Chat = {
    id: string;
    chatRoomId: string;
    postId: string;
    alternatePostId?: string;
    postOwnerId?: string;
    postOwnerRole?: "farmer" | "buyer";
    farmerId: string;
    buyerId: string;
    role: ChatRole;
    chatType: ChatType;
    name: string;
    location?: string;
    avatar: string;
    preview: string;
    lastMessage?: string | null;
    lastMessageSenderId?: string | null;
    lastMessageSenderName?: string | null;
    time: string;
    lastActivityAt?: string | null;
    unreadCount?: number;
    status: ChatStatus;
    online?: boolean;
    profile?: ChatParticipantProfile;
    contractId?: string | null;
    orderReadyContractId?: string | null;
    hasContract?: boolean;
    hasActiveContract?: boolean;
    
    hasOrder?: boolean;
    crop?: CropDetail;
    messages: Message[];
    isTemporary?: boolean;
    forceNew?: boolean;
};
