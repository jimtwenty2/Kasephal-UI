"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Image from "next/image";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { FileUp, ImageUp, X } from "lucide-react";
import type { ChatTranslationMode } from "../_types/chat";

type Props = {
    isArchived: boolean;
    focusKey?: string;
    translationMode?: ChatTranslationMode;
    onTranslationModeChange?: (mode: ChatTranslationMode) => void;
    onSendMessage?: (message: string) => boolean | Promise<boolean>;
    onSendAttachment?: (file: File) => void;
    onTypingChange?: (typing: boolean) => void;
    isSending?: boolean;
    attachmentsEnabled?: boolean;
    showTranslation?: boolean;
};

const imageAccept = ".png,.jpg,.jpeg,.webp,.gif,image/png,image/jpeg,image/webp,image/gif";
const documentAccept = [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
].join(",");

type PendingAttachment = {
    file: File;
    previewUrl: string | null;
};

export default function ChatInput({
    isArchived,
    focusKey,
    translationMode = "original",
    onTranslationModeChange,
    onSendMessage,
    onSendAttachment,
    onTypingChange,
    isSending = false,
    attachmentsEnabled = true,
    showTranslation = true,
}: Props) {
    const [message, setMessage] = useState("");
    const [pendingAttachment, setPendingAttachment] =
        useState<PendingAttachment | null>(null);
    const messageInputRef = useRef<HTMLInputElement | null>(null);
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const shouldFocusWhenReadyRef = useRef(false);

    const focusMessageInput = useCallback(() => {
        if (isArchived || isSending) {
            shouldFocusWhenReadyRef.current = true;
            return;
        }

        requestAnimationFrame(() => {
            messageInputRef.current?.focus();
        });
    }, [isArchived, isSending]);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            onTypingChange?.(false);
        };
    }, [onTypingChange]);

    useEffect(() => {
        focusMessageInput();
    }, [focusKey, focusMessageInput]);

    useEffect(() => {
        if (!isSending && shouldFocusWhenReadyRef.current) {
            shouldFocusWhenReadyRef.current = false;
            focusMessageInput();
        }
    }, [focusMessageInput, isSending]);

    useEffect(() => {
        return () => {
            if (pendingAttachment?.previewUrl) {
                URL.revokeObjectURL(pendingAttachment.previewUrl);
            }
        };
    }, [pendingAttachment]);

    const handleSend = async () => {
        if (!message.trim() || isSending) return;

        const sent = await onSendMessage?.(message);
        onTypingChange?.(false);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }

        if (sent !== false) {
            setMessage("");
        }

        focusMessageInput();
    };

    const handleFileChange = (file?: File) => {
        if (!file || isSending) return;

        const previewUrl = file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : null;

        setPendingAttachment((currentAttachment) => {
            if (currentAttachment?.previewUrl) {
                URL.revokeObjectURL(currentAttachment.previewUrl);
            }

            return { file, previewUrl };
        });
    };

    const handleCancelAttachment = () => {
        setPendingAttachment((currentAttachment) => {
            if (currentAttachment?.previewUrl) {
                URL.revokeObjectURL(currentAttachment.previewUrl);
            }

            return null;
        });
        focusMessageInput();
    };

    const handleConfirmAttachment = () => {
        if (!pendingAttachment || isSending) return;

        const file = pendingAttachment.file;

        setPendingAttachment((currentAttachment) => {
            if (currentAttachment?.previewUrl) {
                URL.revokeObjectURL(currentAttachment.previewUrl);
            }

            return null;
        });
        onSendAttachment?.(file);
        focusMessageInput();
    };

    const handleMessageChange = (value: string) => {
        setMessage(value);

        if (!value.trim()) {
            onTypingChange?.(false);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }

            return;
        }

        onTypingChange?.(true);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            onTypingChange?.(false);
            typingTimeoutRef.current = null;
        }, 1800);
    };

    if (isArchived) {
        return (
            <div className="border-t border-light-grey bg-[#F8FAFC] px-4 py-5 text-[15px] text-secondary-body sm:px-8">
                This transaction is complete. Chat is archived and read-only.
            </div>
        );
    }

    return (
        <div className="border-t border-light-grey bg-white px-4 py-4 sm:px-8">
            {pendingAttachment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
                    <div className="w-full max-w-105 rounded-2xl bg-white p-5 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-[18px] font-semibold text-primary-heading">
                                    Send attachment?
                                </h3>
                                <p className="mt-1 text-sm text-secondary-body">
                                    Confirm before sending this file.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleCancelAttachment}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
                                aria-label="Cancel attachment"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-5 overflow-hidden rounded-xl border border-light-grey bg-[#F8FAFC]">
                            {pendingAttachment.previewUrl ? (
                                <Image
                                    src={pendingAttachment.previewUrl}
                                    alt={pendingAttachment.file.name}
                                    width={420}
                                    height={260}
                                    unoptimized
                                    className="max-h-65 w-full object-contain"
                                />
                            ) : (
                                <div className="flex h-37.5 items-center justify-center">
                                    <FileUp className="h-10 w-10 text-primary" />
                                </div>
                            )}
                            <div className="border-t border-light-grey bg-white px-4 py-3">
                                <p className="truncate text-sm font-semibold text-primary-heading">
                                    {pendingAttachment.file.name}
                                </p>
                                <p className="mt-1 text-xs text-secondary-body">
                                    {formatAttachmentSize(pendingAttachment.file.size)}
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCancelAttachment}
                                disabled={isSending}
                                className="rounded-xl border border-light-grey px-5 py-2.5 text-sm font-semibold text-secondary-body transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmAttachment}
                                disabled={isSending}
                                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        

            {showTranslation && (
                <div className="mb-3 flex items-center gap-2 text-[12px] text-secondary-body">
                    <div
                        className="inline-flex items-center rounded-xl border border-light-grey bg-[#F8FAFC] p-1"
                        aria-label="Chat translation mode"
                    >
                        {[
                            { value: "original" as const, label: "Original" },
                            { value: "auto" as const, label: "Translate" },
                        ].map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onTranslationModeChange?.(option.value)}
                                aria-pressed={translationMode === option.value}
                                className={`h-8 rounded-lg px-3 text-[12px] font-bold transition ${
                                    translationMode === option.value
                                        ? "bg-primary text-white shadow-sm"
                                        : "text-secondary-body hover:bg-primary/5 hover:text-primary"
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex h-14 items-center gap-3 rounded-[18px] border border-light-grey bg-[#F8FAFC] px-4">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={documentAccept}
                    className="hidden"
                    onChange={(event) => {
                        handleFileChange(event.target.files?.[0]);
                        event.target.value = "";
                    }}
                />
                <input
                    ref={imageInputRef}
                    type="file"
                    accept={imageAccept}
                    className="hidden"
                    onChange={(event) => {
                        handleFileChange(event.target.files?.[0]);
                        event.target.value = "";
                    }}
                />

                {attachmentsEnabled && (
                    <>
                        <button
                            type="button"
                            disabled={isSending}
                            onClick={() => fileInputRef.current?.click()}
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-light-grey bg-white text-secondary-body transition hover:border-primary hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                            title="Attach PDF, Word, or Excel"
                        >
                            <FileUp className="h-4.5 w-4.5" strokeWidth={2.2} />
                        </button>

                        <button
                            type="button"
                            disabled={isSending}
                            onClick={() => imageInputRef.current?.click()}
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-light-grey bg-white text-secondary-body transition hover:border-primary hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                            title="Attach image"
                        >
                            <ImageUp className="h-4.5 w-4.5" strokeWidth={2.2} />
                        </button>
                    </>
                )}

                <input
                    ref={messageInputRef}
                    type="text"
                    value={message}
                    onChange={(e) => handleMessageChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSend();
                        }
                    }}
                    disabled={isSending}
                    placeholder="Type your message here..."
                    className="min-w-0 flex-1 bg-transparent text-[14px] text-primary-heading outline-none placeholder:text-secondary-body disabled:cursor-not-allowed"
                />

                <button
                    type="button"
                    onClick={handleSend}
                    disabled={isSending || !message.trim()}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSending ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                        <PaperAirplaneIcon className="h-5 w-5" />
                    )}
                </button>
            </div>

        </div>
    );
}

function formatAttachmentSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
