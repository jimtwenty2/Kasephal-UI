// Chat "card" messages are stored as machine-readable markers (e.g.
// "CONTRACT_REQUEST:<id>\ncrop:...") and rendered as rich cards in the thread.
// In chat-list previews those raw markers look ugly, so map them to a short,
// human-friendly label. Order matters: more specific prefixes come first.
const CARD_MESSAGE_LABELS: { prefix: string; label: string }[] = [
  { prefix: "ORDER_REQUEST:", label: "Order request" },
  { prefix: "ORDER_ACCEPTED:", label: "Order accepted" },
  { prefix: "ORDER_CREATED:", label: "Order created" },
  { prefix: "ORDER_REJECTED:", label: "Order rejected" },
  { prefix: "PAYMENT_COMPLETED:", label: "Payment completed" },
  { prefix: "PAYMENT_REQUEST_ACCEPTED:", label: "Payment approved" },
  { prefix: "PAYMENT_REQUEST:", label: "Payment request" },
  { prefix: "DEMAND_NEGOTIATION:", label: "Crop demand discussion" },
  { prefix: "CONTRACT_REQUEST:", label: "Contract sent" },
  { prefix: "CONTRACT_ACCEPTED:", label: "Contract accepted" },
  { prefix: "CONTRACT_ORDER_READY:", label: "Contract ready" },
  { prefix: "CONTRACT_CHANGE_REQUESTED:", label: "Change requested" },
  { prefix: "CONTRACT_REJECTED:", label: "Contract rejected" },
  { prefix: "LINKED_CHAT_ROOM:", label: "Trade chat opened" },
];

/**
 * Returns a friendly preview label for a raw chat message. If the message is a
 * known card marker, the short label is returned; otherwise the original text
 * is returned unchanged.
 */
export function formatCardMessageLabel(message: string): string {
  const trimmed = message.trimStart();

  for (const { prefix, label } of CARD_MESSAGE_LABELS) {
    if (trimmed.startsWith(prefix)) return label;
  }

  return message;
}
