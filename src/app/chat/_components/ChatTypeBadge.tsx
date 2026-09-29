"use client";

import type { ChatType } from "../_types/chat";

type Props = {
  chatType: ChatType;
  compact?: boolean;
};

const CHAT_TYPE_META: Record<ChatType, { label: string; className: string }> = {
  CROP_PRODUCT: {
    label: "Crop Product",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  CROP_DEMAND: {
    label: "Crop Demand",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  DIRECT: {
    label: "Direct",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
};

export function getChatTypeLabel(chatType: ChatType) {
  return CHAT_TYPE_META[chatType]?.label ?? "Chat";
}

export default function ChatTypeBadge({ chatType, compact = false }: Props) {
  const meta = CHAT_TYPE_META[chatType] ?? CHAT_TYPE_META.DIRECT;

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border font-bold leading-none ${meta.className} ${
        compact ? "px-2 py-1 text-[10px]" : "px-2.5 py-1 text-[11px]"
      }`}
    >
      {meta.label}
    </span>
  );
}
