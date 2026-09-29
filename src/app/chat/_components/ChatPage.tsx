"use client";

import BuyerChatLayout from "./BuyerChatLayout";
import FarmerChatLayout from "./FarmerChatLayout";
import type { Chat, UserRole } from "../_types/chat";

type Props = {
    role: UserRole;
    chats: Chat[];
};

export default function ChatPage({ role, chats }: Props) {
    if (role === "FARMER") {
        return <FarmerChatLayout chats={chats} />;
    }

    return <BuyerChatLayout chats={chats} />;
}
