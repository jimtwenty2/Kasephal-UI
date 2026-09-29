import type { ChatStatus } from "../_types/chat";

export const chatTabs: { label: string; value: ChatStatus | "all" }[] = [
    {
        label: "All",
        value: "all",
    },
    {
        label: "Archived",
        value: "archived",
    },
];