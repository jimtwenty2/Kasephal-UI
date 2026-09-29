import {
    ChatBubbleLeftRightIcon,
    DocumentTextIcon,
    UserGroupIcon,
} from "@heroicons/react/24/outline";

import type { UserRole } from "../_types/chat";

type Props = {
    role: UserRole;
    name: string;
};

export default function EmptyConversation({ role, name }: Props) {
    const counterpart = role === "FARMER" ? "buyer" : "farmer";
    const displayName = name?.trim() || `this ${counterpart}`;

    return (
        <div className="flex h-full items-center justify-center px-6">
            <div className="text-center">
                <div className="relative mx-auto mb-8 flex h-[110px] w-[110px] items-center justify-center rounded-full bg-[#FFF8D9]">
                    <ChatBubbleLeftRightIcon className="h-10 w-10 text-[#F5A300]" />

                    <div className="absolute -right-2 top-2 rounded-full bg-white p-2.5 shadow">
                        <span className="text-lg">🌾</span>
                    </div>

                    <div className="absolute -left-3 top-10 rounded-full bg-white p-2.5 shadow">
                        <DocumentTextIcon className="h-4 w-4 text-[#9A5B34]" />
                    </div>

                    <div className="absolute bottom-0 right-4 rounded-full bg-white p-2.5 shadow">
                        <UserGroupIcon className="h-4 w-4 text-green-500" />
                    </div>
                </div>

                <h2 className="text-[28px] font-bold text-black">
                    Start the conversation
                </h2>

                <p className="mx-auto mt-3 max-w-[460px] text-[16px] text-secondary-body">
                    Send your first message to {displayName} using the box below.
                    Introduce yourself, discuss terms, share quality reports, and
                    finalize your contract — all in one place.
                </p>
            </div>
        </div>
    );
}
