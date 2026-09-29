const CAMBODIA_TIME_ZONE = "Asia/Phnom_Penh";

export function formatChatTime(date?: string | Date | null) {
  if (!date) return "";

  const value = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(value.getTime())) return "";

  return value.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: CAMBODIA_TIME_ZONE,
  });
}
