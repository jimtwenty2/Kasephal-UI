/* eslint-disable @next/next/no-img-element */
"use client";

import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  PhotoIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import type { Message } from "../_types/chat";
import MessageStatusMark from "./MessageStatusMark";
import {
  getAttachmentDownloadUrl,
  getAttachmentImageUrl,
  getAttachmentUrl,
} from "@/utils/getAttachmentUrl";

type Props = {
  message: Message;
  showTime?: boolean;
  onRetry?: (message: Message) => void;
};

export default function ChatFileMessage({
  message,
  showTime = false,
  onRetry,
}: Props) {
  if (!message.file) return null;

  const isMe = message.sender === "me";
  const isImage = message.file.type === "image";
  const attachmentName = message.file.storedName ?? message.file.name;
  const isLocalImagePreview =
    isImage && /^(blob:|data:)/i.test(message.file.url ?? "");
  const fileUrl = isImage
    ? isLocalImagePreview
      ? (message.file.url ?? "")
      : getAttachmentImageUrl(attachmentName)
    : message.file.url || getAttachmentUrl(attachmentName);
  const downloadUrl =
    message.file.downloadUrl ??
    (message.file.url?.startsWith("blob:")
      ? message.file.url
      : getAttachmentDownloadUrl(attachmentName));
  const Icon = isImage
    ? PhotoIcon
    : message.file.type === "xlsx"
      ? TableCellsIcon
      : DocumentTextIcon;

  if (isImage) {
    return (
      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
        <div className="flex items-center gap-2">
          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-[18px] border border-light-grey bg-white"
            >
              <img
                src={fileUrl}
                alt={message.file.name}
                className="max-h-[280px] w-full max-w-[280px] object-cover"
              />
            </a>
          )}

          {message.status === "sending" && (
            <span
              aria-label="Sending attachment"
              className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary/25 border-t-primary"
            />
          )}
        </div>
        {isMe && (
          <div className="mt-1 flex justify-end">
            <MessageStatusMark message={message} onRetry={onRetry} />
          </div>
        )}

        {showTime && (
          <p className="mt-2 text-[12px] text-secondary-body">{message.time}</p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
      <div className="flex items-center gap-2">
        <FileDownloadCard
          name={message.file.name}
          size={message.file.size}
          downloadUrl={downloadUrl}
          Icon={Icon}
        />

        {message.status === "sending" && (
          <span
            aria-label="Sending attachment"
            className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary/25 border-t-primary"
          />
        )}
      </div>
      {isMe && (
        <div className="mt-1 flex justify-end">
          <MessageStatusMark message={message} onRetry={onRetry} />
        </div>
      )}

      {showTime && (
        <span className="mt-2 text-[12px] text-secondary-body">
          {message.time}
        </span>
      )}
    </div>
  );
}

function FileDownloadCard({
  name,
  size,
  downloadUrl,
  Icon,
}: {
  name: string;
  size: string;
  downloadUrl: string;
  Icon: typeof PhotoIcon;
}) {
  return (
    <div className="w-full max-w-[280px] rounded-[18px] border border-light-grey bg-white p-4">
      <div className="flex items-center gap-3 rounded-[16px] bg-[#F7FAFC] p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="break-words text-[13px] font-bold text-primary-heading">
            {name}
          </p>
          <p className="text-[12px] text-secondary-body">{size}</p>
        </div>

        <a
          href={downloadUrl || undefined}
          download
          aria-label={`Download ${name}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-light-grey bg-white transition hover:border-primary hover:bg-primary/5"
        >
          <ArrowDownTrayIcon className="h-4 w-4 text-secondary-body" />
        </a>
      </div>
    </div>
  );
}
