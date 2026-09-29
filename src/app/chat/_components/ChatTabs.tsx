import type { ChatStatus } from "../_types/chat";
import { chatTabs } from "../_constants/chat-tabs";

type Props = {
    activeTab: ChatStatus | "all";
    onTabChange: (value: ChatStatus | "all") => void;
};

export default function ChatTabs({ activeTab, onTabChange }: Props) {
    return (
        <div className="grid h-[34px] grid-cols-2 rounded-full bg-[#F5F7F8] p-1">
            {chatTabs.map((tab) => {
                const isActive = activeTab === tab.value;

                return (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={() => onTabChange(tab.value)}
                        className={`rounded-full text-[12px] transition ${isActive
                            ? "bg-white font-semibold text-primary-heading shadow-sm"
                            : "text-secondary-body"
                            }`}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}