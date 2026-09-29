import type { Message } from "../_types/chat";

type Props = {
    message: Message;
    onRetry?: (message: Message) => void;
};

export default function MessageStatusMark({ message, onRetry }: Props) {
    if (message.sender !== "me") return null;

    if (message.status === "failed") {
        return (
            <span className="flex items-center justify-end gap-2 text-[11px] font-semibold">
                <span className="text-red-500">Failed to send</span>
                {onRetry && (
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onRetry(message);
                        }}
                        className="rounded-full border border-red-200 px-2 py-0.5 text-red-600 transition hover:bg-red-50"
                    >
                        Retry
                    </button>
                )}
            </span>
        );
    }

    return null;
}
