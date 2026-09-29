import type { Chat } from "../_types/chat";
import ChatCard from "../_components/ChatCard";

type Props = {
    chats: Chat[];
    isCollapsed: boolean;
    selectedChat: Chat | null;
    onSelectChat: (chat: Chat) => void;
};

export default function ChatList({
    chats,
    isCollapsed,
    selectedChat,
    onSelectChat,
}: Props) {
    return (
        <div
            className={`scrollbar-hide min-h-0 flex-1 overflow-y-auto ${
                isCollapsed ? "mt-2 flex w-full flex-col items-center gap-2 px-0" : "mt-6 space-y-3 pr-1"
            }`}
        >
            {chats.map((chat) => (
                <ChatCard
                    key={chat.id}
                    chat={chat}
                    isCollapsed={isCollapsed}
                    isActive={selectedChat?.id === chat.id}
                    onClick={() => onSelectChat(chat)}
                />
            ))}
        </div>
    );
}
